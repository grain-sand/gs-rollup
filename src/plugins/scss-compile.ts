import fs from "fs";
import * as sass from "sass";
import {FunctionPluginHooks, Plugin} from "rollup";
import {resolveFileOperationOption} from "../tools";
import {FileOperationOption} from "../type";

export function scssCompile(option: FileOperationOption): Plugin {

	const targets = resolveFileOperationOption(option, ".css");

	return <Plugin & Partial<FunctionPluginHooks>>{
		name: "scss-compile",
		buildStart() {
			for (const t of targets) {
				for (const f of t.src) {
					if (f.includes("*")) this.error("not support glob");
					if (!fs.existsSync(f)) this.error(`file not exist: ${f}`);
				}
			}
		},

		async generateBundle() {
			for (const t of targets) {
				for (let i = 0; i < t.src.length; i++) {
					const file = t.src[i];
					const dest = t.dest[i];

					const result = await sass.compileAsync(file);
					let output = result.css.toString();

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
