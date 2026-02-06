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
	let {format, extension = moduleFormatExt[format], dir = DefaultValues.fullCodeDir, other} = arg;
	if (!extension.startsWith('.')) {
		extension = `.${extension}`;
	}
	if (dir) {
		file = join(dir, file);
	}
	return {
		format,
		file: `${file.replace(/\\/g, '/')}${extension}`
	}
}
