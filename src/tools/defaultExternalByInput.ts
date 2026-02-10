import {ExternalFn, IExternalByInputArg} from "../type";
import {isString} from "gs-base";

export function defaultExternalByInput(arg: IExternalByInputArg): ExternalFn {
	const {current, names, regexes, functions} = preExternal(arg);
	return (id, importer, isResolved) => {
		if (current.test(id)) {
			return
		}
		if (names.length && names.includes(id)) {
			return true
		}
		if (regexes.length && regexes.some(r => r.test(id))) {
			return true
		}
		if (functions.length && functions.some(f => f(id, importer, isResolved))) {
			return true
		}
	}
}

function preExternal(arg: IExternalByInputArg) {
	const {current, currentPath, inputs} = arg;
	const {external, addExternal} = arg.itemArg;
	let externals = [];
	if (external) {
		externals.push(external as any);
	}
	if (addExternal) {
		externals.push(addExternal as any);
	}
	externals = externals.flat();

	const regexes: RegExp[] = externals.filter(e => e instanceof RegExp);
	const functions: ExternalFn[] = externals.filter(e => e instanceof Function);
	const names: string[] = externals.filter(e => isString(e));

	const keys = Object.keys(inputs).filter(k => k !== current)
	keys.length && regexes.push(new RegExp(`^(?:\.\.?/)+(?:${keys.join('|')})(?:/index\.[tj]s)?$`));

	const paths = Object.values(inputs).filter(p => p !== currentPath);
	paths.length && regexes.push(new RegExp(`(?:${formatPath(paths.join('|'))})$`));

	return {
		current: new RegExp(`^(?:\.\.?/)+${current}(?:/index\.[tj]s)?$|${formatPath(currentPath)}$`),
		names,
		regexes,
		functions,
	}
}

function formatPath(path: string): string {
	return path.replace(/[\\/]/g, '[\\\\/]');
}
