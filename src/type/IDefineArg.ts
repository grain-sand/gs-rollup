import {ExternalOption, InputOption, ModuleFormat, OutputOptions, Plugin} from "rollup";

export interface IDefineArg {
	input?: InputOption
	dir?: string;
	includeInputDir?: boolean;
	/**
	 * 是否包含src目录
	 * - 当 `includeInputDir` 为 `true` 时，此属性才有效
	 */
	includeInputSrc?: boolean;
}

export interface IDefineOutputOption extends IDefineArg {
	format: ModuleFormat
	extension?: string
	other?: OutputOptions
}

export interface IDefineJsArg extends IDefineArg {
	external?: ExternalOption[]
	plugins?: Plugin[]
}

export interface IDefineDtsArg extends IDefineJsArg {
	exclude?: string | string[]
	copyMd?: boolean
}
