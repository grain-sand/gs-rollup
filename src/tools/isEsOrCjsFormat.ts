import {ModuleFormat} from "rollup";
import {cjsFormats, esFormats} from "../type";

export function isCjsFormat(name: ModuleFormat): boolean {
	return cjsFormats.includes(name)
}

export function isEsFormat(name: ModuleFormat): boolean {
	return esFormats.includes(name)
}

export function isEsOrCjsFormat(name: ModuleFormat): boolean {
	return esFormats.includes(name) || cjsFormats.includes(name)
}
