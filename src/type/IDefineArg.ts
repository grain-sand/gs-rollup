import {ExternalOption, InputOption, ModuleFormat, OutputOptions, Plugin} from "rollup";

export interface IDefineArg {
	outputBase: string,
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
	other?: OutputOptions
}

export interface IDefineOutputOption extends IDefineArg, IDefineOutputOptionBase {
}

interface IDefineItemArg extends IDefineArg {
	external?: ExternalOption[]
	plugins?: Plugin[]
}

export interface IDefineJsFormat extends IDefineOutputOptionBase {
}

export type DefineJsFormat = IDefineJsFormat | ModuleFormat

export interface IDefineJsArg extends IDefineItemArg {
	minify?: boolean
	target?: string | string[]
	formats?: DefineJsFormat | DefineJsFormat[]
}

export interface IDefineDtsArg extends IDefineItemArg {
	exclude?: string | string[]
	copyMd?: boolean
	output?: OutputOptions
}
