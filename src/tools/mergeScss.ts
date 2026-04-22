import fs from "fs";
import path from "path";
import postcss, {AtRule, Root} from "postcss";
import scss from "postcss-scss";

interface IMergeScssOption {
	external?: string[];
	addMergeComment?: boolean;
}

export async function mergeScss(file: string, option: IMergeScssOption = {}): Promise<Root> {
	const { external = [], addMergeComment = true } = option;
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
				if (!params.startsWith(".") && !params.includes("/") && !external.includes(params)) {
					// 这是一个包名，跳过
					return;
				}
				throw new Error(`parse error: ${params} from ${currentFile}`);
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

	return await mergeRecursive(file);
}


function resolveScssPath(importPath: string, basedir: string) {
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
