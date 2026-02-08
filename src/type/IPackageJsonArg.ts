import {PackageJson} from "type-fest";
import {EsOrCjsFormat} from "./formats";

export interface IPackageJsonExport {
	input?: string | string[] | Record<string, string>
	formats?: (EsOrCjsFormat | '.d.ts')[]
	outputCodeDir?: string;
	includeInputDir?: boolean;
	includeInputSrc?: boolean;
	default?: string
}

export type PackageJsonExport = string | string[] | IPackageJsonExport

export interface IPackageJsonArg {
	minify?: boolean
	outputBase?: string
	input?: string
	overwriteProps?: PackageJson
	deleteProps?: RegExp
	deleteChildProps?: Partial<Record<keyof PackageJson | string, RegExp>>
	before?: (pkg: PackageJson) => PackageJson | void
	after?: (pkg: PackageJson) => PackageJson | void
	exports?: PackageJsonExport
}
