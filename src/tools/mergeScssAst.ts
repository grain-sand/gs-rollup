import fs from "fs";
import path from "path";
import postcss, {AtRule, Root} from "postcss";
import scss from "postcss-scss";

export async function mergeScssAst(file: string, visited: Set<string> = new Set()): Promise<Root> {
	if (visited.has(file)) {
		return postcss.root(); // 防循环
	}

	visited.add(file);

	const code = fs.readFileSync(file, "utf8");

	const result = await postcss([])
		.process(code, {
			parser: scss.parse as any,
			from: file,
		});

	const root = result.root!;

	const dir = path.dirname(file);

	const tasks: Promise<void>[] = [];

	root.walkAtRules((rule: AtRule) => {
		if (rule.name !== "use" && rule.name !== "import") return;

		const params = rule.params.replace(/['"]/g, "").trim();

		// 跳过第三方
		if (!params.startsWith(".")) return;

		const resolved = resolveScssPath(params, dir);
		if (!resolved) {
			throw new Error(`parse error: ${params} from ${file}`);
		}

		const task = (async () => {
			const child = await mergeScssAst(resolved, visited);

			// 插入注释（可选）
			const comment = postcss.comment({
				text: `merged from: ${resolved}`,
			});

			rule.replaceWith(comment, ...child.nodes);
		})();

		tasks.push(task);
	});

	await Promise.all(tasks);

	return root;
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
