import {IDefineOutputArg} from "../type";
import {ModuleFormat} from "rollup";
import {isObject, isString} from "gs-base";
import {DefaultValues} from "./DefaultValues";

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

export function defineOutput(format: ModuleFormat): any;
export function defineOutput(arg: IDefineOutputArg): any;
export function defineOutput(arg: any): any {
	arg = isString(arg) ? {format: arg} : arg
	const {format}: IDefineOutputArg = arg;
	const file = arg.file || defineFile(arg);

}

function defineFile(arg: IDefineOutputArg) {
	const {format, dir, input = DefaultValues.input}: IDefineOutputArg = arg;
	const names: string[] = [];
	if (isString(input)) {
		names.push(input as string);
	} else if (Array.isArray(input)) {
	} else if (isObject(input)) {
		names.push(...Object.keys(input));
	}
}
