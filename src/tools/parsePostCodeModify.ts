import {IImportReplaceFn, IPostCodeModify, PostCodeModify} from "../type";
import {parseImportReplaceRole} from "./parseImportReplaceRole";
import {isFunction} from "gs-base";

export function parsePostCodeModify(replace: PostCodeModify): IPostCodeModify<IImportReplaceFn> {
	if (Array.isArray(replace)) {
		return {
			importReplace: parseImportReplaceRole(replace)
		}
	}
	if (isFunction(replace)) {
		return {
			importReplace: replace as IImportReplaceFn
		}
	}
	return replace || {} as any;
}
