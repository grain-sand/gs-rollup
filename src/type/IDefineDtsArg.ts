import type {Options} from "rollup-plugin-esbuild";
import type {OutputOptions} from "rollup";
import type {IPackageJsonArg} from "./IPackageJsonArg";
import type {IRawLoaderArg} from "../plugins";
import type {IVueDtsOptions} from "gs-rollup-plugin-vue-dts";
import type {DefineJsFormat} from "./formats";
import type {IDefineItemArg} from "./IDefineItemArg";

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
	vueDts?: IVueDtsOptions | boolean
}
