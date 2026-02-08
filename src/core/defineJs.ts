import {DefineJsFormat, IDefineJsArg, IDefineJsFormat, IDefineOutputOption} from "../type";
import {formatInput, getExternalByInput, itemAfterAddPlugin} from "../tools";
import {nodeResolve as resolve} from "@rollup/plugin-node-resolve";
import esbuild, {Options} from "rollup-plugin-esbuild";
import {RollupOptions} from "rollup";
import {isFunction, isString} from "gs-base";
import {defineOutput} from "./defineOutput";
import {rawLoader} from "../plugins";

const defaultEsbuildOption: Options = {target: 'esnext', minifySyntax: true, charset: 'utf8'}

export function defineJs(arg?: IDefineJsArg): RollupOptions[] {
	const {esbuild: esOpt = {}} = arg || {}
	const inputs = formatInput(arg);
	const plugins = arg?.plugins || [];
	plugins.push(resolve())
	plugins.push(rawLoader())
	// noinspection TypeScriptUnresolvedReference
	const esbuildFn = isFunction(esbuild) ? esbuild : esbuild.default;
	plugins.push(esbuildFn(<Options>{...defaultEsbuildOption, ...esOpt}))
	const outputs = checkFormats(arg?.formats, arg);

	const result = [];
	const inputEntries = Object.entries(inputs);
	for (const [file, input] of inputEntries) {
		result.push({
			input,
			external: getExternalByInput(input, inputEntries, arg),
			plugins,
			output: outputs.map(out => defineOutput(file, out))
		})
	}
	return itemAfterAddPlugin(result, arg);
}

function checkFormats(formats: DefineJsFormat | DefineJsFormat[] = ['esm', 'cjs'], arg: IDefineJsArg): IDefineOutputOption[] {
	type Dd = IDefineOutputOption & IDefineJsFormat
	return (Array.isArray(formats) ? formats : [formats])
		.map(format => {
			const result = (isString(format) ? {format} : format) as Dd
			return {...arg, ...result};
		})
}
