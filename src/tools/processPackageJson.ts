import {IPackageJsonArg, IPackageJsonExport} from "../type";
import {PackageJson} from "type-fest";
import fs from "fs";
import {isString} from "gs-base";
import {formatInput} from "./formatInput";
import {formatOutput} from "./formatOutput";
import {DefaultValues} from "./DefaultValues";
import {ModuleFormat} from "rollup";
import {isCjsFormat, isEsFormat} from "./isEsOrCjsFormat";

export const defaultPackageJsonFileName = 'package.json';

// console.log(processPackageJson({
// 	deleteProps: /scripts|dependencies/,
// 	deleteChildProps: {devDependencies: /typescript|vitest/}
// }))

export function processPackageJson(arg?: IPackageJsonArg) {
	const {
		minify,
		input = defaultPackageJsonFileName,
		overwriteProps,
		deleteProps,
		deleteChildProps,
		before,
		exports = DefaultValues.input,
		after
	} = arg || {};
	let pkg: PackageJson = JSON.parse(fs.readFileSync(input, 'utf8'));
	const bv = before?.(pkg);
	if (bv) pkg = bv;

	if (deleteProps) {
		exeDeleteProps(pkg, deleteProps);
	}
	if (deleteChildProps) {
		for (const [prop, pattern] of Object.entries(deleteChildProps)) {
			exeDeleteProps(pkg[prop], pattern);
		}
	}

	if (exports) {
		pkg = processExports(pkg, arg);
	}

	if (overwriteProps) {
		pkg = {...pkg, ...overwriteProps};
	}

	const av = after?.(pkg);
	if (av) pkg = av;

	return JSON.stringify(pkg, null, minify ? undefined : 2);
}

function exeDeleteProps(obj: any, pattern: RegExp) {
	for (const prop of Object.keys(obj)) {
		if (pattern.test(prop)) {
			delete obj[prop];
		}
	}
}


function processExports(pkg: PackageJson, arg: IPackageJsonArg) {
	const {exports: exp = {}} = arg || {};
	const exOpn = (Array.isArray(exp) || isString(exp) ? {input: exp} : exp) as IPackageJsonExport;
	const {input = DefaultValues.input} = exOpn;
	const inputRecord = formatInput({...exOpn, input} as any);
	const exports: Record<string, Record<'types' | 'import' | 'require', string>>  = {};
	const {
		formats = ['cjs', 'es', '.d.ts'],
		outputCodeDir = DefaultValues.outputCodeDir,
		'default': dft = 'index'
	}: IPackageJsonExport = exOpn;

	for (const k of Object.keys(inputRecord)) {
		const name = k === dft ? '.' : `./${k}`;
		exports[name] = formatExports(k, outputCodeDir, formats);
	}
	if (exports['.']) {
		const def = exports['.'];
		if (def.types) pkg.types = def.types;
		if (def.require) pkg.main = def.require;
		if (def.import) pkg.module = def.import;
	}
	const names = Object.keys(exports).sort()
	const newValue = pkg.exports = {};
	for (const name of names) {
		newValue[name] = exports[name];
	}
	return pkg;
}


function formatExports(file: string, outputCodeDir: string, formats: (ModuleFormat | ".d.ts")[]) {
	const result: any = {};
	for (const fmt of formats) {
		const output = `./${formatOutput(file, '', outputCodeDir, fmt)}`;
		if (fmt === '.d.ts') {
			result.types = output;
		} else if (isEsFormat(fmt)) {
			result.import = output;
		} else if (isCjsFormat(fmt)) {
			result.require = output;
		}
	}
	return result;
}
