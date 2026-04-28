import path from "path";
import {FileOperationOption, IFileOperationValidTarget} from "../type";

export function resolveFileOperationOption(option: FileOperationOption, ext?: string): IFileOperationValidTarget[] {
	const targets = Array.isArray(option) ? option : [option]
	const distNameSet = new Set();

	const createDistName = (src: string) => {
		const info = path.parse(src);
		let distName = '', i = 1;
		const targetExt = ext || info.ext;
		do {
			if (distName) {
				distName = `${info.name}-${i++}${targetExt}`
			} else {
				distName = `${info.name}${targetExt}`;
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
			tmp.dest = tmp.dest.map(f => (tmp as IFileOperationValidTarget).rename(f))
		}

		targets[i] = tmp;
	}

	return targets as IFileOperationValidTarget[]
}
