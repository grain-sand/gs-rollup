import {RollupOptions} from "rollup";
import dts from "rollup-plugin-dts";
import {IDefineDtsArg} from "../type";
import {formatInput, getExternalByInput, itemAfterAddPlugin} from "../tools";
import {defineCopy, defineOutput} from "../core";
import {packageJson} from "../plugins";

export function defineDts(arg?: IDefineDtsArg): RollupOptions[] {
	const {
		exclude = 'test/**/*.ts',
		copyMd = true,
		output,
		buildPackageJson = true
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
		result[0].plugins = [...result[0].plugins, defineCopy('*.md')]
	}
	if (buildPackageJson) {
		result[0].plugins = [...result[0].plugins, definePkgPlugin(arg)]
	}
	return itemAfterAddPlugin(result, arg);
}

function definePkgPlugin(arg?: IDefineDtsArg) {
	const {
		buildPackageJson,
		outputBase,
		input,
		outputCodeDir
	} = arg || {};
	return packageJson({
		...{
			outputBase,
			exports: {
				input,
				outputCodeDir
			}
		},
		...buildPackageJson
	});
}
