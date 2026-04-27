import {RollupOptions} from "rollup";
import {vueDts} from "gs-rollup-plugin-vue-dts";
import {dts} from "rollup-plugin-dts";
import {IDefineDtsArg, IDefineItemArg} from "../type";
import {GsRollupDefaults, itemAfterAddPlugin} from "../tools";
import {defineCopy, defineOutput} from "../core";
import {packageJson} from "../plugins";
import resolve from "@rollup/plugin-node-resolve";

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
		externalByInput = GsRollupDefaults.externalByInput,
		vueDts: vueDtsOption
	} = arg || {}
	const dtsExternal = Array.isArray(external) ? external : [external]
	dtsExternal.push(/\.scss$/)
	const inputs = formatInput(<IDefineItemArg>{...arg, input, includeInputDir, includeInputSrc});
	const plugins = arg?.plugins || [];
	plugins.push(resolve())
	const dtsOptions = {respectExternal: false, exclude: Array.isArray(exclude) ? exclude : [exclude]}
	if(vueDtsOption===false) {
		plugins.push(dts(dtsOptions))
	} else {
		plugins.push(vueDts({
			...{dtsOptions},
			...vueDtsOption
		}))
	}
	const result: RollupOptions[] = [];
	const inputEntries = Object.entries(inputs);
	for (const [current, input] of inputEntries) {
		result.push({
			input,
			external: externalByInput({
				current,
				currentPath: input,
				inputs,
				itemArg: {...arg, external: dtsExternal as any}
			}),
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
	const {jsFormats: jf = []} = GsRollupDefaults;
	const formats = Array.isArray(jf) ? [...jf] : [jf]
	if(!formats.includes('.d.ts')){
		formats.push('.d.ts')
	}
	return packageJson({
		...{
			outputBase,
			exports: {
				input,
				formats,
				outputCodeDir,
				includeInputDir,
				includeInputSrc
			}
		},
		...buildPackageJson
	});
}
