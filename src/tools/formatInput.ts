import {isObject, isString} from "gs-base";
import {join, parse} from "node:path";
import {IDefineArg} from "../type";

export function formatInput(arg?: IDefineArg): Record<string, string> {
	const {input, includeInputDir, includeInputSrc} = arg || {};
	if (isString(input)) {
		return {
			[parseName(input as string, includeInputDir, includeInputSrc)]: input as string
		}
	} else if (Array.isArray(input)) {
		let result: Record<string, string> = {};
		for (const path of input as string[]) {
			const name = parseName(path, includeInputDir, includeInputSrc);
			let tmpName = name;
			for (let i = 1; result[tmpName]; i++) {
				tmpName = `${name}${i}`;
			}
			result[tmpName] = path;
		}
		return result;
	} else if (isObject(input)) {
		return {...input as any};
	}
}

function parseName(input: string, includeInputDir: boolean, includeInputSrc: boolean): string {
	const {name, dir} = parse(input);
	let result: string;
	if (includeInputDir) {
		result = join(dir, name);
		if (!includeInputSrc) {
			result = result.replace(/^src[\/\\]/, '');
		}
		result = result.replace(/[\\/]+/g, '/');
	} else {
		switch (name) {
			case 'index':
				result = dir === 'src' ? name : dir.replace(/^.+[\/\\]/, '');
				break;
			default:
				result = name;
		}
	}
	return result;
}
