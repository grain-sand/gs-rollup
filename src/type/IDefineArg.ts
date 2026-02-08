import {ExternalOption, InputOption, ModuleFormat, OutputOptions, Plugin} from "rollup";
import {IPackageJsonArg} from "./IPackageJsonArg";
import {Options} from "rollup-plugin-esbuild";

export interface IDefineArg {
	outputBase?: string,
	input?: InputOption
	outputCodeDir?: string;
	includeInputDir?: boolean;
	/**
	 * 是否包含src目录
	 * - 当 `includeInputDir` 为 `true` 时，此属性才有效
	 */
	includeInputSrc?: boolean;
}

interface IDefineOutputOptionBase {
	format: ModuleFormat
	extension?: string
	/**
	 * 覆盖输出选项
	 */
	overwriteProps?: OutputOptions
}

export interface IDefineOutputOption extends IDefineArg, IDefineOutputOptionBase {
}

export type ExternalByInput = Record<string, ExternalOption> | ((input: string) => ExternalOption)

interface IDefineItemArg extends IDefineArg {
	external?: ExternalOption[]
	plugins?: Plugin[]
	externalByInput?: ExternalByInput
	processImport?: boolean
	addExternal?: string | RegExp | (string | RegExp)[]
	addPlugins?: Plugin[]
}

export interface IDefineJsFormat extends IDefineOutputOptionBase {
}

export type DefineJsFormat = IDefineJsFormat | ModuleFormat

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
