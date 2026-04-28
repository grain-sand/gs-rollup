import type {IDefineArg} from "./IDefineArg";
import type {ExternalOption, NullValue, Plugin} from "rollup";
import type {PostCodeModify} from "./IPostCodeModify";

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
	postCodeModify?: boolean | PostCodeModify
	addPlugins?: Plugin[]
	formatInput?: FormatInputFn
	addExternal?: ExternalOption
	externalByInput?: ExternalByInputFn
}
