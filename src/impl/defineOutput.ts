import {IDefineOutputOption} from "../type";
import {ModuleFormat, OutputOptions} from "rollup";
import {DefaultValues} from "./DefaultValues";
import {join} from "node:path";

const moduleFormatExt: Record<ModuleFormat, string> = {
	amd: ".amd.js",
	cjs: ".cjs",
	es: ".es.js",
	iife: ".iife.js",
	system: ".system.js",
	umd: ".umd.js",
	commonjs: ".common.js",
	esm: ".mjs",
	module: ".module.js",
	systemjs: ".systemjs.js"
};

export function defineOutput(file: string, arg: IDefineOutputOption): OutputOptions {
	let {
		other, format,
		extension = moduleFormatExt[format],
		outputCodeDir = DefaultValues.codeDir,
		outputBase = DefaultValues.outputBase
	} = arg;
	if (outputBase) {
		outputCodeDir = join(outputBase, outputCodeDir);
	}
	if (!extension.startsWith('.')) {
		extension = `.${extension}`;
	}
	if (outputCodeDir) {
		file = join(outputCodeDir, file);
	}
	return {
		inlineDynamicImports: true,
		...other,
		format,
		file: `${file.replace(/\\/g, '/')}${extension}`
	}
}
