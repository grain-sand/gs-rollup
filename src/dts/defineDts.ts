import {RollupOptions} from "rollup";
import dts from "rollup-plugin-dts";
import {IDefineDtsArg} from "../type";
import {defineCopy, defineOutput, formatInput, getExternalByInput, importReplace} from "../core";
import {isBoolean} from "gs-base";

export function defineDts(arg?: IDefineDtsArg): RollupOptions[] {
	const {
		exclude = 'test/**/*.ts',
		copyMd = true,
		output,
		processImport
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
	if (processImport === false || result.length <= 1) {
		return result;
	}
	const plugin = importReplace(isBoolean(processImport) ? undefined : processImport as any);
	for (const item of result) {
		item.plugins = [...(item.plugins || []), plugin];
	}
	return result;
}
