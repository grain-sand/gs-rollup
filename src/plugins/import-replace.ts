import {FunctionPluginHooks, OutputAsset, OutputChunk, Plugin} from "rollup";
import {isFunction} from "gs-base";
import {isEsFormat, isEsOrCjsFormat, margeEsImport} from "../tools";
import {IImportReplaceFn, IImportReplaceRole, ImportReplaceRole} from "../type";

const esImtReg = /((?:import|from)\s*)(['"])([^'"\s]+)\2|await\s+import\s*\(\s*(['"])([^'"\s]+)\4\s*\)/g
const cjsImtReg = /(?:require|await\s+import)\s*\(\s*(['"])([^'"\s]+)\1\s*\)/g

export function importReplace(replace: ImportReplaceRole): Plugin {
	const fn = parseFn(replace);
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'import-replace',
		generateBundle({format, file}, bundle) {
			if (!isEsOrCjsFormat(format)) return;
			for (const chunk of Object.values(bundle) as (OutputAsset & OutputChunk)[]) {
				let code = chunk.code || chunk.source.toString();
				if (isEsFormat(format)) {
					code = processEsCode(code, fn, file);
					code = margeEsImport(code);
				} else {
					code = processCjsCode(code, fn, file);
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

function processCjsCode(code: string, fn: IImportReplaceFn, file: string) {
	return code.replace(cjsImtReg, (_, p1, p2) => `require('${fn(p2, file)}')`);
}

function processEsCode(code, fn: IImportReplaceFn, file: string) {
	return code.replace(esImtReg, (_, p1, p2, p3, p4, p5) => {
		if (p3) {
			return `${p1}'${fn(p3, file)}'`
		} else if (p5) {
			return `await import('${fn(p5, file)}')`
		}

	});
}

function parseFn(replace: ImportReplaceRole): IImportReplaceFn {
	if (isFunction(replace)) {
		return replace as IImportReplaceFn;
	}
	const roles = Array.isArray(replace) ? replace : [replace] as IImportReplaceRole[];
	return (name, file) => {
		for (const {search, replace, ensureExtension} of roles) {
			if (!search.test(name)) {
				continue
			}
			name = name.replace(search, replace as any);
			if (!ensureExtension) {
				return name;
			}
			const [ext] = file.match(/(?:\.\S+){1,2}$/)
			if (name.endsWith(ext)) {
				return name;
			}
			return `${name.replace(/\.[cm]?[tj]s$/, '')}${ext}`
		}
		return name;
	}
}
