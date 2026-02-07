import {FunctionPluginHooks, OutputAsset, OutputChunk, Plugin} from "rollup";
import {isFunction} from "gs-base";

export const defaultImportReplaceRole: IImportReplaceRole = {search: /^(\.{2}\/)+/, replace: './'}

export type IImportReplaceFn = (name: string) => string

export interface IImportReplaceRole {
	search: RegExp
	replace: string | ((substring: string, ...args: any[]) => string)
}

export type ImportReplaceRole = IImportReplaceRole | IImportReplaceRole[] | IImportReplaceFn

const esFormats = ['es', 'esm', 'module']
const cjsFormats = ['cjs', 'commonjs']

const esFmtReg = new RegExp(`^(${esFormats.join('|')})$`, 'i')
const sFmtReg = new RegExp(`^(${[...esFormats, ...cjsFormats].join('|')})$`, 'i')

const esImtReg = /import\s*\{\s*([^}]+)\s*}[^'"]+(['"])([^'"]+)\2\s*;(\n)?/g
const cjsImtReg = /require\(\s*(['"])([^'"]+)\1\s*\)/g

export function importReplace(replace?: ImportReplaceRole): Plugin {
	const fn = parseFn(replace || defaultImportReplaceRole);
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'import-replace',
		generateBundle({format}, bundle) {
			if (!sFmtReg.test(format)) return;

			for (const chunk of Object.values(bundle) as (OutputAsset & OutputChunk)[]) {
				let code = chunk.code || chunk.source.toString();
				if (esFmtReg.test(format)) {
					code = processEsCode(code, fn);
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
	// let rs;
	// while (rs = cjsImtReg.exec(code)) {
	// 	console.log(rs[2])
	// }
	return code.replace(cjsImtReg, (_, p1, p2) => `require('${fn(p2)}')`);
}

function processEsCode(code, fn: IImportReplaceFn) {
	const map = new Map<string, string[]>();
	let rs, last, lineBreak = '';
	while (rs = esImtReg.exec(code)) {
		const mName = fn(rs[3]) || rs[3];
		const imports = rs[1].split(/\s*,\s*/);
		if (map.has(mName)) {
			map.get(mName).push(...imports.split(/\s*,\s*/))
		} else {
			map.set(mName, imports);
		}
		if (rs[4]) {
			lineBreak = rs[4];
		}
		last = rs;
	}
	if (!last) return;
	let imt = [...map.entries()].map(([k, v]) => `import {${v.join(',')}} from '${k}';`).join(lineBreak);
	if (lineBreak) {
		imt += lineBreak;
	}
	const tail = code.slice(last.index + last[0].length)
	return `${imt}${tail}`;
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
