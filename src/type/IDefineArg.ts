import {ExternalOption, InputOption, ModuleFormat, Plugin} from "rollup";

export interface IDefineArg {
	input?: InputOption
	dir?: string;
	file?: string;
}

export interface IDefineOutputArg extends IDefineArg {
	format: ModuleFormat
}

export interface IDefineJsArg extends IDefineArg {
	external?: ExternalOption[]
	plugins?: Plugin[]
}

export interface IDefineDtsArg extends IDefineJsArg {
	exclude?: string | string[]
	copyMd?: boolean
}
