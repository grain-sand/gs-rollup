import {RollupOptions} from "rollup";
import {dts} from "rollup-plugin-dts";
import {IDefineDtsArg, IDefineItemArg} from "../type";
import {getExternalByInput, GsRollupDefaults, itemAfterAddPlugin} from "../tools";
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
	} = arg || {}
	const inputs = formatInput(<IDefineItemArg>{...arg, input, includeInputDir, includeInputSrc});
	const plugins = arg?.plugins || [];
	plugins.push(dts({respectExternal: false, exclude: Array.isArray(exclude) ? exclude : [exclude]}))
	const result: RollupOptions[] = [];
	const inputEntries = Object.entries(inputs);
	const files = Object.values(inputs);
	for (const [file, input] of inputEntries) {
		result.push({
			input,
			external: getExternalByInput(input, files, arg),
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
