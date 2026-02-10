import {DefineJsFormat, ExternalByInput, IDefineArg} from "./IDefineArg";
import {Options} from "rollup-plugin-esbuild";
import {ExternalOption, OutputOptions, Plugin} from "rollup";
import {IPackageJsonArg} from "./IPackageJsonArg";
import {ImportReplaceRole} from "./IImportReplaceRole";
import {IRawLoaderArg} from "../plugins";

export type FormatInputFn = (arg?: IDefineItemArg) => Record<string, string>

export interface IDefineItemArg extends IDefineArg {
	external?: ExternalOption
	plugins?: Plugin[]
	externalByInput?: ExternalByInput
	replaceImport?: boolean | ImportReplaceRole
	addPlugins?: Plugin[]
	formatInput?: FormatInputFn
}


export interface IDefineJsArg extends IDefineItemArg {
	formats?: DefineJsFormat | DefineJsFormat[]
	esbuild?: Options
	rawLoader?: IRawLoaderArg
}

export interface IDefineDtsArg extends IDefineItemArg {
	exclude?: string | string[]
	copyMd?: boolean
	output?: OutputOptions
	buildPackageJson?: IPackageJsonArg | boolean
}
