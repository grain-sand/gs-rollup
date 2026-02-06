import {DefineJsFormat, IDefineJsArg, IDefineJsFormat, IDefineOutputOption} from "../type";
import {DefaultValues} from "./DefaultValues";
import {formatInput} from "./fn/formatInput";
import resolve from "@rollup/plugin-node-resolve";
import esbuild from "rollup-plugin-esbuild";
import {RollupOptions} from "rollup";
import {isString} from "gs-base";
import {defineOutput} from "./defineOutput";

export function defineJs(arg?: IDefineJsArg): RollupOptions[] {
	const {
		external = DefaultValues.external,
		minify = false,
	} = arg || {}
	const inputs = formatInput(arg);
	const plugins = arg?.plugins || [];
	plugins.push(resolve())
	plugins.push(esbuild({target: 'esnext', minifySyntax: true, charset: 'utf8', minify}))
	const outputs = checkFormats(arg?.formats, arg);

	const result = [];
	for (const [file, input] of Object.entries(inputs)) {
		result.push({
			input,
			external,
			plugins,
			output: outputs.map(out => defineOutput(file, out))
		})
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
