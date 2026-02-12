import {FunctionPluginHooks, OutputAsset, OutputChunk, Plugin} from "rollup";
import {
	isEsFormat,
	isEsOrCjsFormat,
	margeEsImport,
	parseImportReplaceRole,
	replaceImportCjsCode,
	replaceImportEsCode
} from "../tools";
import {IImportReplaceFn, IPostCodeModify, PostCodeModify} from "../type";
import {isFunction} from "gs-base";

export function postCodeModify(replace: PostCodeModify): Plugin {
	const {importReplace, codeModify} = parsePostCodeModify(replace);
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'post-code-modify',
		generateBundle({format, file}, bundle) {
			if (!isEsOrCjsFormat(format)) return;
			for (const chunk of Object.values(bundle) as (OutputAsset & OutputChunk)[]) {
				let code = chunk.code || chunk.source.toString();

				if (importReplace) {
					if (isEsFormat(format)) {
						code = replaceImportEsCode(code, importReplace, file);
						code = margeEsImport(code);
					} else {
						code = replaceImportCjsCode(code, importReplace, file);
					}
				}

				if (codeModify) {
					code = codeModify(code, file);
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

function parsePostCodeModify(replace: PostCodeModify): IPostCodeModify<IImportReplaceFn> {
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


