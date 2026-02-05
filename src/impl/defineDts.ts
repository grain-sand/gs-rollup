import {OutputOptions, RollupOptions} from "rollup";
import dts from "rollup-plugin-dts";
import {IDefineDtsArg} from "../type";
import {DefaultValues} from "./DefaultValues";
import {defineCopy} from "./defineCopy";

export function defineDts(arg?: IDefineDtsArg): RollupOptions {
	const {
		input = DefaultValues.input,
		external = DefaultValues.external,
		exclude = 'test/**/*.ts',
		dir = DefaultValues.fullCodeDir,
		file,
		copyMd = true
	} = arg || {}
	const plugins = arg?.plugins || [];
	if (copyMd) {
		plugins.push(defineCopy('*.md'))
	}
	const output: OutputOptions = {
		file,
		dir,
		format: 'esm',
		entryFileNames: '[name].d.ts',
		inlineDynamicImports: true
	}
	return {
		input,
		external,
		output: Array.isArray(input) ? input.map(() => output) : output,
		plugins: [
			dts({respectExternal: false, exclude: Array.isArray(exclude) ? exclude : [exclude]}),
			...plugins
		],
	}
}
