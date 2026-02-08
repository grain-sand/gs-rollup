import {ModuleFormat} from "rollup";
import {join} from "node:path";
import {isCjsFormat, isEsFormat} from "./isEsOrCjsFormat";

export function formatOutput(file: string, outputBase, outputCodeDir, format: ModuleFormat | '.d.ts', extension?: string) {
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

function getExt(format: ModuleFormat | ".d.ts"): string {
	if (format === '.d.ts') return format;
	if (isCjsFormat(format)) return '.cjs'
	if (isEsFormat(format)) return '.mjs'
	return `.${format}.js`
}
