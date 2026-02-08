import {FunctionPluginHooks, OutputAsset, OutputChunk, Plugin} from "rollup";
import {isFunction} from "gs-base";
import {isEsFormat, isEsOrCjsFormat, margeEsImport} from "../tools";

export const defaultImportReplaceRole: IImportReplaceRole = {search: /^(\.{2}\/)+/, replace: './'}

export type IImportReplaceFn = (name: string) => string

export interface IImportReplaceRole {
	search: RegExp
	replace: string | ((substring: string, ...args: any[]) => string)
}

export type ImportReplaceRole = IImportReplaceRole | IImportReplaceRole[] | IImportReplaceFn

const esImtReg = /((?:import|from)\s*)(['"])([^'"\s]+)\2/g
const cjsImtReg = /require\(\s*(['"])([^'"\s]+)\1\s*\)/g

export function importReplace(replace?: ImportReplaceRole): Plugin {
	const fn = parseFn(replace || defaultImportReplaceRole);
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'import-replace',
		generateBundle({format}, bundle) {
			if (!isEsOrCjsFormat(format)) return;

			for (const chunk of Object.values(bundle) as (OutputAsset & OutputChunk)[]) {
				let code = chunk.code || chunk.source.toString();
				if (isEsFormat(format)) {
					code = processEsCode(code, fn);
					code = margeEsImport(code);
				} else {
					code = processCjsCode(code, fn);
				}
				if (!code) continue;
				if (chunk.code) {
					chunk.code = code;
				} else {
					chunk.source = code;
				}
			}
		},
	}
}

function processCjsCode(code: string, fn: IImportReplaceFn) {
	return code.replace(cjsImtReg, (_, p1, p2) => `require('${fn(p2)}')`);
}

function processEsCode(code, fn: IImportReplaceFn) {
	return code.replace(esImtReg, (_, p1, p2, p3) => `${p1}'${fn(p3)}'`);
	// return code.replace(esImtReg, (_, p1, p2, p3) => {
	// 	console.log(_,`${p1}'${fn(p3)}'`)
	// 	return `${p1}'${fn(p3)}'`
	// });
}

function parseFn(replace: ImportReplaceRole): IImportReplaceFn {
	if (isFunction(replace)) {
		return replace as IImportReplaceFn;
	}
	const roles = Array.isArray(replace) ? replace : [replace] as IImportReplaceRole[];
	return (name) => {
		for (const item of roles) {
			if (item.search.test(name)) {
				return name.replace(item.search, item.replace as any)
			}
		}
		return name;
	}
}
