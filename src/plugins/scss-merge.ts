import fs from "fs";
import path from "path";
import {mergeScss, resolveFileOperationOption, resolveScssPath} from "../tools";
import {FunctionPluginHooks, Plugin} from "rollup";
import {FileOperationOption} from "../type";

export function scssMerge(option: FileOperationOption): Plugin {

	const targets = resolveFileOperationOption(option);

	return <Plugin & Partial<FunctionPluginHooks>>{
		name: "scss-merge",
		buildStart() {
			for (const t of targets) {
				for (const f of t.src) {
					if (f.includes("*")) this.error("not support glob");
					if (!fs.existsSync(f)) this.error(`file not exist: ${f}`);
				}
			}
		},

		async generateBundle() {
			const inputOutputMap = new Map<string, string>();
			for (const t of targets) {
				for (let i = 0; i < t.src.length; i++) {
					const src = path.resolve(t.src[i]);
					const dest = t.dest[i];
					inputOutputMap.set(src, dest);
				}
			}

			for (const t of targets) {
				for (let i = 0; i < t.src.length; i++) {
					const file = t.src[i];
					const dest = t.dest[i];

					const externalFiles = Array.from(inputOutputMap.keys()).filter(f => f !== path.resolve(file));

					let output = await mergeScss(file, {
						external: (id: string) => {
							const resolvedId = resolveScssPath(id, path.dirname(file));
							return resolvedId && externalFiles.includes(resolvedId);
						},
						inputOutputMap: inputOutputMap
					});

					if (t.transform instanceof Function) {
						output = t.transform(output, file);
					}

					this.emitFile({
						type: "asset",
						fileName: dest,
						source: output,
					});
				}
			}
		},
	};
}
