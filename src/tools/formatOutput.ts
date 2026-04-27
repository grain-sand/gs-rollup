import {join} from "node:path";
import {isCjsFormat, isEsFormat} from "./isEsOrCjsFormat";
import {DefinePackageJsonFormat, IDefineJsFormat} from "../type";

export function formatOutput(file: string, outputBase, outputCodeDir, format: DefinePackageJsonFormat, extension?: string) {
	extension === undefined && (extension = getExt(format));
	if (outputBase) {
		outputCodeDir = join(outputBase, outputCodeDir);
	}
	if (extension && !extension.startsWith('.')) {
		extension = `.${extension}`;
	}
	if (outputCodeDir) {
		file = join(outputCodeDir, file);
	}
	return `${file.replace(/\\/g, '/')}${extension}`;
}

function getExt(defineFormat: DefinePackageJsonFormat): string {
	if (defineFormat === '.d.ts') return defineFormat;
	const {
		format,
		extension
	} = (typeof defineFormat === 'string' ? {format: defineFormat} : defineFormat || {}) as IDefineJsFormat;
	if (extension) return extension;
	if (isCjsFormat(format)) return '.cjs'
	if (isEsFormat(format)) return '.mjs'
	return `.${format}.js`
}
