import {RollupOptions} from "rollup";
import dts from "rollup-plugin-dts";
import {IDefineDtsArg} from "../type";
import {formatInput, getExternalByInput, itemAfterAddPlugin} from "../tools";
import {defineCopy, defineOutput} from "../core";

export function defineDts(arg?: IDefineDtsArg): RollupOptions[] {
	const {
		exclude = 'test/**/*.ts',
		copyMd = true,
		output,
	} = arg || {}
	const inputs = formatInput(arg);
	const plugins = arg?.plugins || [];
	plugins.push(dts({respectExternal: false, exclude: Array.isArray(exclude) ? exclude : [exclude]}))
	const result: RollupOptions[] = [];
	const inputEntries = Object.entries(inputs);
	for (const [file, input] of inputEntries) {
		result.push({
			input,
			external: getExternalByInput(input, inputEntries, arg),
			plugins,
			output: output || defineOutput(file, {format: 'esm', extension: '.d.ts'})
		})
	}
	if (copyMd) {
		result[0].plugins = [...plugins, defineCopy('*.md')]
	}
	return itemAfterAddPlugin(result, arg);
}
