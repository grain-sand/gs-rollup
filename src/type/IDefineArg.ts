import {ExternalOption, InputOption, OutputOptions, Plugin} from "rollup";

export interface IDefineArg {
	input?: InputOption
	dir?: string;
	file?: string;
}

export interface IDefineOutputArg extends IDefineArg {
	format: OutputOptions['format']
}

export interface IDefineJsArg extends IDefineArg {
	external?: ExternalOption[]
	plugins?: Plugin[]
}

export interface IDefineDtsArg extends IDefineJsArg {
	exclude?: string | string[]
	copyMd?: boolean
}
