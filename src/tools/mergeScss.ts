import fs from "fs";
import path from "path";
import postcss, {AtRule, Root} from "postcss";
import scss from "postcss-scss";
import type { ExternalOption } from "rollup";

interface IMergeScssOption {
	external?: ExternalOption;
	addMergeComment?: boolean;
	inputOutputMap?: Map<string, string>;
}

export async function mergeScss(file: string, option: IMergeScssOption = {}): Promise<string> {
	const { external = [], addMergeComment = true, inputOutputMap } = option;
	const visited = new Set<string>();
	const entryDir = path.dirname(file);

	async function mergeRecursive(currentFile: string): Promise<Root> {
		if (visited.has(currentFile)) {
			return postcss.root(); // 防循环
		}

		visited.add(currentFile);

		const code = fs.readFileSync(currentFile, "utf8");

		const result = await postcss([])
			.process(code, {
				parser: scss.parse as any,
				from: currentFile,
			});

		const root = result.root!;

		const dir = path.dirname(currentFile);

		const tasks: Promise<void>[] = [];

		root.walkAtRules((rule: AtRule) => {
			if (rule.name !== "use" && rule.name !== "import") return;

			// 提取路径部分和命名空间
			let params = rule.params.trim();
			let namespace = '';

			// 提取命名空间
			const asIndex = params.indexOf(' as ');
			if (asIndex !== -1) {
				namespace = params.substring(asIndex + 4).trim();
				params = params.substring(0, asIndex).trim();
			}

			// 移除引号
			params = params.replace(/^['"]|['"]$/g, '');

			// 处理相对路径和直接文件名
			const resolved = resolveScssPath(params, dir);
			if (!resolved) {
				// 尝试解析失败，检查是否是外部依赖
				let isExternal = false;
				if (external === true) {
					isExternal = true;
				} else if (Array.isArray(external)) {
					isExternal = external.includes(params);
				} else if (typeof external === 'function') {
					isExternal = external(params);
				} else if (external instanceof RegExp) {
					// noinspection TypeScriptUnresolvedReference
					isExternal = external.test(params);
				} else if (!params.startsWith(".") && !params.includes("/")) {
					// 这是一个包名，视为外部依赖
					isExternal = true;
				}

				if (isExternal) {
					// 这是一个外部依赖，检查是否使用了命名空间
					if (!namespace || namespace === '*') {
						// 没有使用命名空间或使用了通配符命名空间，移除该导入语句
						rule.remove();
					}
					// 跳过
					return;
				}
				throw new Error(`parse error: ${params} from ${currentFile}`);
			} else {
				// 解析成功，检查是否是外部依赖
				let isExternal = false;
				if (typeof external === 'function') {
					isExternal = external(params);
				} else if (Array.isArray(external)) {
					// 检查 resolved 是否在 external 列表中
					isExternal = external.some(externalPath =>
						path.resolve(externalPath) === resolved
					);
				} else if (external instanceof RegExp) {
					// noinspection TypeScriptUnresolvedReference
					isExternal = external.test(params);
				}

				if (isExternal) {
					// 这是一个外部依赖，检查是否使用了命名空间
					if (!namespace || namespace === '*') {
						// 没有使用命名空间或使用了通配符命名空间，移除该导入语句
						rule.remove();
					}
					// 跳过
					return;
				}
			}

			const task = (async () => {
				const child = await mergeRecursive(resolved);

				// 替换带命名空间的引用
				if (namespace) {
					// 遍历所有节点，替换命名空间引用
					root.walk((node) => {
						if (node.type === 'decl' || node.type === 'atrule' || node.type === 'rule') {
							// 处理声明值中的命名空间引用
							if (node.type === 'decl' && node.value) {
								node.value = node.value.split(`${namespace}.$`).join('$');
							}
							// 处理选择器中的命名空间引用（如果有）
							if (node.type === 'rule' && node.selector) {
								node.selector = node.selector.split(`${namespace}.$`).join('$');
							}
							// 处理@include中的命名空间引用
							if (node.type === 'atrule' && node.name === 'include' && node.params) {
								node.params = node.params.split(`${namespace}.`).join('');
							}
						}
					});
				}

				// 替换规则为子节点
				rule.replaceWith(...child.nodes);
			})();

			tasks.push(task);
		});

		await Promise.all(tasks);

		// 生成统一的合并注释
		if (addMergeComment) {
			const relativePath = path.relative(entryDir, currentFile).replace(/\\/g, '/');
			const comment = postcss.comment({
				text: `merged from: ${relativePath}`,
			});
			// 将注释添加到文件开头
			root.prepend(comment);
		}

		return root;
	}

	const root = await mergeRecursive(file);
	let output = root.toString();

	// 收集所有外部依赖的导入语句
	const importStatements = new Set<string>();
	const contentWithoutImports: string[] = [];

	// 分离导入语句和其他内容
	const lines = output.split('\n');
	for (const line of lines) {
		if (line.trim().startsWith('@use ') || line.trim().startsWith('@import ')) {
			// 调整导入路径
			let adjustedLine = line;
			if (inputOutputMap) {
					for (const [externalFile, externalDest] of inputOutputMap) {
						if (externalFile !== path.resolve(file)) {
							// 计算相对路径
							const currentDest = inputOutputMap.get(path.resolve(file));
							if (currentDest) {
								const currentDir = path.dirname(currentDest);
								const externalPath = path.relative(currentDir, externalDest);
								// 替换导入路径
								const originalPath = path.basename(externalFile, '.scss');
								adjustedLine = adjustedLine.replace(new RegExp(`@use "${originalPath}"`, 'g'), `@use "${externalPath.replace(/\\/g, '/')}"`);
								adjustedLine = adjustedLine.replace(new RegExp(`@import "${originalPath}"`, 'g'), `@import "${externalPath.replace(/\\/g, '/')}"`);
							}
						}
					}
				}
			importStatements.add(adjustedLine);
		} else {
			contentWithoutImports.push(line);
		}
	}

	// 重新组合文件内容：导入语句 + 其他内容
	output = [...importStatements].join('\n') + '\n\n' + contentWithoutImports.join('\n');

	// 处理文件合并交界处的空行
	// 按行分割
	const outputLines = output.split('\n');
	const processedLines: string[] = [];
	let lastLineWasComment = false;
	let lastLineWasContent = false;

	for (const line of outputLines) {
		const trimmedLine = line.trim();
		if (trimmedLine === '') {
			continue; // 跳过空行
		}

		const isImport = trimmedLine.startsWith('@use ') || trimmedLine.startsWith('@import ');
		const isComment = trimmedLine.startsWith('/* merged from:');
		const isContent = !isImport && !isComment;

		// 在导入语句和第一个注释之间添加一个空行
		if (isComment && processedLines.length > 0) {
			const lastProcessedLine = processedLines[processedLines.length - 1].trim();
			if (lastProcessedLine.startsWith('@use ') || lastProcessedLine.startsWith('@import ')) {
				processedLines.push('');
			}
		}

		// 在内容和下一个注释之间添加一个空行
		if (isComment && lastLineWasContent) {
			processedLines.push('');
		}

		// 注释之间不需要空行
		if (isComment && lastLineWasComment) {
			// 直接添加注释，不需要空行
		} else if (isComment && !lastLineWasComment) {
			// 第一个注释，直接添加
		}

		processedLines.push(line);

		lastLineWasComment = isComment;
		lastLineWasContent = isContent;
	}

	// 重新组合行
	output = processedLines.join('\n');

	// 最终输出文件前被 trim()
	output = output.trim();

	return output;
}


export function resolveScssPath(importPath: string, basedir: string) {
	const tryList = [
		importPath,
		`${importPath}.scss`,
		path.join(
			path.dirname(importPath),
			`_${path.basename(importPath)}.scss`
		),
	];

	for (const p of tryList) {
		const full = path.resolve(basedir, p);
		if (fs.existsSync(full)) return full;
	}

	return null;
}
