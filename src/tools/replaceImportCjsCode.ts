import {IImportReplaceFn} from "../type";

const cjsImtReg = /(?:require|await\s+import)\s*\(\s*(['"])([^'"\s]+)\1\s*\)/g

export function replaceImportCjsCode(code: string, fn: IImportReplaceFn, file: string): string {
	return code.replace(cjsImtReg, (_, p1, p2) => `require('${fn(p2, file)}')`);
}
