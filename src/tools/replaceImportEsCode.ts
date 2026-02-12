import {IImportReplaceFn} from "../type";

const esImtReg = /((?:import|from)\s*)(['"])([^'"\s]+)\2|await\s+import\s*\(\s*(['"])([^'"\s]+)\4\s*\)/g

export function replaceImportEsCode(code, fn: IImportReplaceFn, file: string): string {
	return code.replace(esImtReg, (_, p1, p2, p3, p4, p5) => {
		if (p3) {
			return `${p1}'${fn(p3, file)}'`
		} else if (p5) {
			return `await import('${fn(p5, file)}')`
		}
	});
}
