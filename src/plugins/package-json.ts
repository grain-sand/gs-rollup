import fs from 'node:fs';
import {FunctionPluginHooks, ModuleFormat, Plugin} from "rollup";
import {PackageJson} from "type-fest";
import {DefaultValues} from "../tools";

const defaultFileName = 'package.json';

export interface IPackageJsonExport {
	file: string | string[] | Record<string, string>
	format?: ModuleFormat
}

export type PackageJsonExport = string | string[] | IPackageJsonExport

export interface IPackageJsonArg {
	minify?: boolean
	outputBase?: string
	input?: string
	overwriteProps?: PackageJson
	deleteProps?: RegExp
	deleteChildProps?: Record<keyof PackageJson | string, RegExp>
	fn?: (pkg: PackageJson) => PackageJson | undefined
	exports?: PackageJsonExport
}

export function packageJson(arg?: IPackageJsonArg): Plugin {
	const {
		minify,
		outputBase = DefaultValues.outputBase,
		input = defaultFileName,
		overwriteProps,
		deleteProps
	} = arg || {};
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'package-json',
		generateBundle() {
			const pkg: PackageJson = JSON.parse(fs.readFileSync(new URL(input, import.meta.url), 'utf8'));
			// pkg.
			// deleteProps(pkg.scripts, /(?:src|dist)$/);
			// deleteProps(pkg.devDependencies, /rollup/);
			// deleteProps(pkg.dependencies, /^gs-/);
			const output = `${outputBase}${defaultFileName}`;
			if (minify) {
				fs.writeFileSync(output, JSON.stringify(pkg));
			} else {
				fs.writeFileSync(output, JSON.stringify(pkg, null, 2));
			}
		},
	}
}

function deleteProps(obj, pattern) {
	for (const prop of Object.keys(obj)) {
		if (pattern.test(prop)) {
			delete obj[prop];
		}
	}
}
