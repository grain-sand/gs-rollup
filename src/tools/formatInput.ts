import {isObject, isString} from "gs-base";
import {join, parse} from "node:path";
import {IDefineArg} from "../type";

export function formatInput(arg: IDefineArg): Record<string, string> {
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
	const normalizeDir = dir.replace(/^\.+[\/\\]/, '')
	let result: string;
	if (includeInputDir) {
		switch (name) {
			case 'index':
				if (normalizeDir === 'src') {
					result = includeInputSrc ? join(normalizeDir, name) : name
				} else {
					result = normalizeDir;
				}
				break
			default:
				result = join(normalizeDir, name)
		}
		if (!includeInputSrc) {
			result = result.replace(/^src[\/\\]/, '');
		}
	} else {
		switch (name) {
			case 'index':
				result = normalizeDir === 'src' ? name : normalizeDir.replace(/^.+[\/\\]/, '');
				break;
			default:
				result = name;
		}
	}
	return result.replace(/[\\/]+/g, '/');
}
