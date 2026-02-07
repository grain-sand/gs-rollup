import {DefineJsFormat, IDefineJsArg, IDefineJsFormat, IDefineOutputOption} from "../type";
import {DefaultValues} from "./DefaultValues";
import {formatInput, getExternalByInput} from "./fn";
import resolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import {RollupOptions} from "rollup";
import {isBoolean, isString} from "gs-base";
import {defineOutput} from "./defineOutput";
import {importReplace, rawLoader} from "../plugins";

export function defineJs(arg?: IDefineJsArg): RollupOptions[] {
	const {
		external = DefaultValues.external,
		minify = false,
		processImport
	} = arg || {}
	const inputs = formatInput(arg);
	const plugins = arg?.plugins || [];
	plugins.push(resolve())
	plugins.push(rawLoader())
	plugins.push(esbuild({target: 'esnext', minifySyntax: true, charset: 'utf8', minify}))
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
	if (processImport === false || result.length <= 1) {
		return result;
	}
	const plugin = importReplace(isBoolean(processImport) ? undefined : processImport as any);
	for (const item of result) {
		item.plugins = [...(item.plugins || []), plugin];
	}
	return result;
}

function checkFormats(formats: DefineJsFormat | DefineJsFormat[] = ['esm', 'cjs'], arg: IDefineJsArg): IDefineOutputOption[] {
	type Dd = IDefineOutputOption & IDefineJsFormat
	return (Array.isArray(formats) ? formats : [formats])
		.map(format => {
			const result = (isString(format) ? {format} : format) as Dd
			return {...arg, ...result};
		})
}
