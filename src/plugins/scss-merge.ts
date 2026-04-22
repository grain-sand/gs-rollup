import fs from "fs";
import path from "path";
import {mergeScss} from "../tools";
import {FunctionPluginHooks, Plugin} from "rollup";

export interface IScssMergeTarget {

	src: string | string[];

	dest?: string | string[];

	rename?: (fullPath: string) => string;

	transform?: (code: string, file: string) => any;

}

interface IScssMergeValidTarget extends Omit<IScssMergeTarget, 'src' | 'dest'> {

	src: string[];

	dest: string[];
}

export type ScssMergeTarget = string | IScssMergeTarget;
export type ScssMergeOption = ScssMergeTarget | ScssMergeTarget[];

export function scssMerge(option: ScssMergeOption): Plugin {

	const targets = checkScssMergeOption(option);

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
			for (const t of targets) {
				for (let i = 0; i < t.src.length; i++) {
					const file = t.src[i];
					const dest = t.dest[i];

					const root = await mergeScss(file);

					let output = root.toString();

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

function checkScssMergeOption(option: any): IScssMergeValidTarget[] {
	const targets = Array.isArray(option) ? option : [option]
	const distNameSet = new Set();

	const createDistName = (src: string) => {
		const info = path.parse(src);
		let distName = '', i = 1;
		do {
			if (distName) {
				distName = `${info.name}-${i++}${info.ext}`
			} else {
				distName = info.base;
			}
		} while (distNameSet.has(distName))
		distNameSet.add(distName)
		return distName
	}

	for (let i = 0; i < targets.length; i++) {
		let tmp = targets[i];
		if (typeof tmp === 'string') {
			tmp = {src: [tmp]}
		} else if (Array.isArray(tmp)) {
			tmp = {src: tmp}
		} else if (!Array.isArray(tmp.src)) {
			tmp.src = [tmp.src]
		}

		if (typeof tmp.dest === 'string') {
			tmp.dest = [tmp.dest]
		} else if (!Array.isArray(tmp.dest)) {
			tmp.dest = []
		}

		for (let j = 0; j < tmp.src.length; j++) {
			if (!tmp.dest[j]) {
				tmp.dest[j] = createDistName(tmp.src[j])
			}
		}

		if (tmp.rename instanceof Function) {
			tmp.dest = tmp.dest.map(f => tmp.rename(f))
		}

		targets[i] = tmp;
	}

	return targets
}
