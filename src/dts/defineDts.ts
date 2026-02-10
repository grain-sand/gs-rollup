import {RollupOptions} from "rollup";
import {dts} from "rollup-plugin-dts";
import {IDefineDtsArg, IDefineItemArg} from "../type";
import {GsRollupDefaults, itemAfterAddPlugin} from "../tools";
import {defineCopy, defineOutput} from "../core";
import {packageJson} from "../plugins";

export function defineDts(arg?: IDefineDtsArg): RollupOptions[] {
	const {
		exclude = 'test/**/*.ts',
		copyMd = true,
		output,
		buildPackageJson = true,
		formatInput = GsRollupDefaults.formatInput,
		input = GsRollupDefaults.input,
		includeInputDir = GsRollupDefaults.includeInputDir,
		includeInputSrc = GsRollupDefaults.includeInputSrc,
		external = GsRollupDefaults.external,
		externalByInput = GsRollupDefaults.externalByInput
	} = arg || {}
	const inputs = formatInput(<IDefineItemArg>{...arg, input, includeInputDir, includeInputSrc});
	const plugins = arg?.plugins || [];
	plugins.push(dts({respectExternal: false, exclude: Array.isArray(exclude) ? exclude : [exclude]}))
	const result: RollupOptions[] = [];
	const inputEntries = Object.entries(inputs);
	for (const [current, input] of inputEntries) {
		result.push({
			input,
			external: externalByInput({current, currentPath: input, inputs, itemArg: {...arg, external}}),
			plugins,
			output: output || defineOutput(current, {format: 'esm', extension: '.d.ts'})
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
		outputCodeDir,
		includeInputSrc,
		includeInputDir
	} = arg || {};
	return packageJson({
		...{
			outputBase,
			exports: {
				input,
				outputCodeDir,
				includeInputDir,
				includeInputSrc,
			}
		},
		...buildPackageJson
	});
}
