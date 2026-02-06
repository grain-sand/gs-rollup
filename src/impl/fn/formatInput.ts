import {DefaultValues} from "../DefaultValues";
import {isObject, isString} from "gs-base";
import {join} from "node:path";
import {IDefineArg} from "../../type";

const parseNameRegex = /^([\w.-]+)[\/\\](.*?[\/\\])?([\w.-]+?)(?:\.[\w-]+)?$/

export function formatInput(arg?: IDefineArg): Record<string, string> {
	const {input = DefaultValues.input, includeInputDir, includeInputSrc} = arg || {};
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
	const match = input.replace(/\\/g, '/').match(parseNameRegex);
	if (!match) {
		return input;
	}
	const [, dir, prefix, name] = match;
	let result: string;
	switch (name) {
		case 'index':
			result = dir === 'src' && !prefix ? name : dir;
			break;
		default:
			result = name;
	}
	if (includeInputDir) {
		if (prefix) result = join(prefix, result);
		if (includeInputSrc || dir !== 'src') {
			result = join(dir, result);
		}
		result = result.replace(/\\/g, '/');
	}
	return result;
}
