import {DefineJsFormat, IDefineArg} from "./IDefineArg";
import {Options} from "rollup-plugin-esbuild";
import {ExternalOption, NullValue, OutputOptions, Plugin} from "rollup";
import {IPackageJsonArg} from "./IPackageJsonArg";
import {ImportReplaceRole} from "./IImportReplaceRole";
import {IRawLoaderArg} from "../plugins";

export interface IExternalByInputArg {
	current: string
	currentPath: string
	inputs: Record<string, string>
	itemArg: IDefineItemArg
}

export type FormatInputFn = (arg?: IDefineItemArg) => Record<string, string>

export type ExternalFn = (source: string, importer: string | undefined, isResolved: boolean) => boolean | NullValue

export type ExternalByInputFn = (arg: IExternalByInputArg) => ExternalFn

export interface IDefineItemArg extends IDefineArg {
	external?: ExternalOption
	plugins?: Plugin[]
	replaceImport?: boolean | ImportReplaceRole
	addPlugins?: Plugin[]
	formatInput?: FormatInputFn
	addExternal?: ExternalOption
	/**
	 * 外部依赖函数，根据输入文件路径返回外部依赖选项
	 * - 此配置如果存在，将接管 `external` 与 `addExternal` 配置
	 */
	externalByInput?: ExternalByInputFn
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
