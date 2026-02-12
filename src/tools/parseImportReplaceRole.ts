import {IImportReplaceFn, IImportReplaceRole, ImportReplaceRole} from "../type";
import {isFunction} from "gs-base";

export function parseImportReplaceRole(replace: ImportReplaceRole): IImportReplaceFn {
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
