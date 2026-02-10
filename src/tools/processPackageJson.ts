import {IPackageJsonArg, IPackageJsonExport} from "../type";
import {PackageJson} from "type-fest";
import fs from "fs";
import {isString} from "gs-base";
import {formatOutput} from "./formatOutput";
import {GsRollupDefaults} from "./GsRollupDefaults";
import {ModuleFormat} from "rollup";
import {isCjsFormat, isEsFormat} from "./isEsOrCjsFormat";
import {basename} from "node:path";

export const defaultPackageJsonFileName = 'package.json';

const defaultProcessPackageJsonArg: IPackageJsonArg = Object.freeze({deleteProps: /^(devDependencies|scripts)$/})
//
// console.log(processPackageJson())

export function processPackageJson(arg?: IPackageJsonArg) {
	const {
		minify,
		input = defaultPackageJsonFileName,
		overwriteProps,
		deleteProps,
		deleteChildProps,
		before,
		exports,
		after
	} = {...defaultProcessPackageJsonArg, ...arg};
	let pkg: PackageJson = {
		...{
			name: defaultName(),
			version: '0.0.0',
			license: 'MIT',
			author: {
				name: defaultName(),
			}
		},
		...JSON.parse(fs.readFileSync(input, 'utf8')),
	};
	const bv = before?.(pkg);
	if (bv) pkg = bv;

	if (deleteProps !== false) {
		exeDeleteProps(pkg, deleteProps);
	}
	if (deleteChildProps) {
		for (const [prop, pattern] of Object.entries(deleteChildProps)) {
			exeDeleteProps(pkg[prop], pattern);
		}
	}

	if (exports !== false) {
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
	const {exports: exp = {}, formatInput = GsRollupDefaults.formatInput} = arg || {};
	const exOpn = (Array.isArray(exp) || isString(exp) ? {input: exp} : exp) as IPackageJsonExport;
	const {input = GsRollupDefaults.input,} = exOpn;
	const {
		formats = ['cjs', 'es', '.d.ts'],
		outputCodeDir = GsRollupDefaults.outputCodeDir,
		'default': dft = 'index',
		includeInputDir = GsRollupDefaults.includeInputDir,
		includeInputSrc = GsRollupDefaults.includeInputSrc,
	}: IPackageJsonExport = exOpn;
	const inputRecord = formatInput({...exOpn, input, includeInputDir, includeInputSrc} as any);
	const exportsOut: Record<string, Record<'types' | 'import' | 'require', string>> = {};

	for (const k of Object.keys(inputRecord)) {
		const name = k === dft ? '.' : `./${k}`;
		exportsOut[name] = formatExports(k, outputCodeDir, formats);
	}
	if (exportsOut['.']) {
		const def = exportsOut['.'];
		if (def.types) pkg.types = def.types;
		if (def.require) pkg.main = def.require;
		if (def.import) pkg.module = def.import;
	}
	const names = Object.keys(exportsOut).sort()
	const newValue = pkg.exports = {};
	for (const name of names) {
		newValue[name] = exportsOut[name];
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

function defaultName() {
	try {
		return basename(process.cwd()).replace(/([a-zA-Z])_?([A-Z])/g, '$1-$2').toLowerCase()
	} catch {
		return 'package-name'
	}
}
