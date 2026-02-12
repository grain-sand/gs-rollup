import {parse, compileScript} from '@vue/compiler-sfc';
import {transformSync} from 'esbuild';
import {IVueCode, IVueTsToJsOption} from "../type";
import {parsePostCodeModify} from "./parsePostCodeModify";
import {replaceImportEsCode} from "./replaceImportEsCode";

export function vueTsToJs(code: string, option?: IVueTsToJsOption) {
	const {filename, compile, scriptCodeModify, vueCodeModify} = option || {};
	const {descriptor} = parse(code, {filename, sourceMap: false, ignoreEmpty: true});
	let script = descriptor.script || descriptor.scriptSetup;
	if (script) {
		if (compile === 'vue') {
			script = compileScript(descriptor, {id: filename, hoistStatic: true, isProd: true});
		} else if (compile === 'esbuild') {
			script.content = transformSync(script.content, {
				loader: 'ts',
				target: 'esnext'
			}).code.trim();
		}
		delete descriptor.script.attrs?.lang;
		if (scriptCodeModify) {
			const {importReplace, codeModify} = parsePostCodeModify(scriptCodeModify);
			if (importReplace) {
				script.content = replaceImportEsCode(script.content, importReplace, filename);
			}
			if (codeModify) {
				script.content = codeModify(script.content, filename);
			}
		}
	}

	let vueCode: IVueCode = {script, template: descriptor.template, styles: descriptor.styles};
	if (vueCodeModify) {
		vueCode = vueCodeModify(vueCode);
	}
	const result = [];
	if (vueCode.template?.content) {
		result.push(`<template>`)
		result.push(vueCode.template.content)
		result.push(`</template>`)
	}
	if (vueCode.script?.content) {
		result.push(`<script>`)
		result.push(vueCode.script.content)
		result.push(`</script>`)
	}
	for (const style of vueCode.styles) {
		const attrs = attrToString(style.attrs)
		result.push(`<style${attrs}>`);
		result.push(style.content)
		result.push(`</style>`);
	}
	return result.join('\n');
}

function attrToString(attrs: Record<string, string | true>) {
	const result = [];
	for (const [attr, value] of Object.entries(attrs)) {
		if (value === true) {
			result.push(attr);
		} else {
			result.push(`${attr}="${value}"`);
		}
	}
	if (result.length) {
		return ` ${result.join(",")}`;
	}
	return '';
}
