import {DefineJsFormat, ExternalByInput, IDefineArg} from "./IDefineArg";
import {Options} from "rollup-plugin-esbuild";
import {ExternalOption, OutputOptions, Plugin} from "rollup";
import {IPackageJsonArg} from "./IPackageJsonArg";
import {ImportReplaceRole} from "./IImportReplaceRole";

interface IDefineItemArg extends IDefineArg {
	external?: ExternalOption[]
	plugins?: Plugin[]
	externalByInput?: ExternalByInput
	replaceImport?: boolean | ImportReplaceRole
	addExternal?: string | RegExp | (string | RegExp)[]
	addPlugins?: Plugin[]
}


export interface IDefineJsArg extends IDefineItemArg {
	formats?: DefineJsFormat | DefineJsFormat[]
	esbuild?: Options
}

export interface IDefineDtsArg extends IDefineItemArg {
	exclude?: string | string[]
	copyMd?: boolean
	output?: OutputOptions
	buildPackageJson?: IPackageJsonArg | boolean
}
