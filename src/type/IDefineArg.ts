import {InputOption, ModuleFormat, OutputOptions} from "rollup";

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

export interface IDefineJsFormat extends IDefineOutputOptionBase {
}

export type DefineJsFormat = IDefineJsFormat | ModuleFormat

