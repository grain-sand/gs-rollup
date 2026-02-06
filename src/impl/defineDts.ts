import {OutputOptions, RollupOptions} from "rollup";
import dts from "rollup-plugin-dts";
import {IDefineDtsArg} from "../type";
import {DefaultValues} from "./DefaultValues";
import {defineCopy} from "./defineCopy";
import {formatInput} from "./fn/formatInput";
import {defineOutput} from "./defineOutput";

export function defineDts(arg?: IDefineDtsArg): RollupOptions[] {
	const {
		external = DefaultValues.external,
		exclude = 'test/**/*.ts',
		dir = DefaultValues.fullCodeDir,
		copyMd = true
	} = arg || {}
	const inputs = formatInput(arg);
	const plugins = arg?.plugins || [];
	plugins.push(dts({respectExternal: false, exclude: Array.isArray(exclude) ? exclude : [exclude]}))
	if (copyMd) {
		plugins.push(defineCopy('*.md'))
	}
	const result = [];
	for (const [file, input] of Object.entries(inputs)) {
		result.push({
			input,
			external,
			plugins,
			output: defineOutput(file, {format: 'esm', extension: '.d.ts'})
		})
	}
	return result;
}
