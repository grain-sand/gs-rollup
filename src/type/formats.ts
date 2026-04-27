import {ModuleFormat} from "rollup";

export const esFormats = ['es', 'esm', 'module'] as const

export const cjsFormats = ['cjs', 'commonjs'] as const

export interface IDefineJsFormat {
	format: ModuleFormat
	extension?: string
}

export type DefineJsFormat = IDefineJsFormat | ModuleFormat

export type DefinePackageJsonFormat = DefineJsFormat | '.d.ts'


