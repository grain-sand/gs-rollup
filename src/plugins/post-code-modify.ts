import {FunctionPluginHooks, OutputAsset, OutputChunk, Plugin} from "rollup";
import {
	isEsFormat,
	isEsOrCjsFormat,
	margeEsImport,
	parsePostCodeModify,
	replaceImportCjsCode,
	replaceImportEsCode
} from "../tools";
import {PostCodeModify} from "../type";

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




