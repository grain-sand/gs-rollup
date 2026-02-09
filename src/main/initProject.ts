import {existsSync, writeFileSync} from "node:fs";
import {detectRollupOption} from "../tools";

const cfgPath = 'rollup.config.ts'
const tsCfgPath = 'tsconfig.json'

const tsConfig = {
	compilerOptions: {
		esModuleInterop: true,
		experimentalDecorators: true,
		preserveConstEnums: true,
		module: "ESNext",
		moduleResolution: "bundler",
		sourceMap: false,
		target: "ESNext",
		lib: ["ESNext", "DOM"],
		allowJs: true
	}
}

export async function initProject() {
	try {
		writeCfg()
	} catch (e) {
		console.error('init project failed', e)
	}
	writeTsCfg()
}

function writeTsCfg() {
	if (existsSync(tsCfgPath)) return
	writeFileSync(tsCfgPath, JSON.stringify(tsConfig, null, 2))
}

function writeCfg() {
	if (existsSync(cfgPath)) return
	const detectedOption = detectRollupOption();
	const out = [
		"import { RollupOptions } from 'rollup'",
		"import {defineJs, defineDts, GsRollupDefaults as Defaults} from 'gs-rollup'",
		'',
		"Defaults.outputBase = 'dist'",
		"Defaults.outputCodeDir = 'lib'",
		'',
		`const input = ${JSON.stringify(detectedOption.input, null, 2)}`,
		"",
		"export default <RollupOptions[]>[",
	]

	if (detectedOption.types) {
		out.push(...[
			"\t...defineDts({",
			"\t\tinput,",
			"\t\tbuildPackageJson: {",
			"\t\t\tdeleteProps: /^(devDependencies|scripts)$/",
			"\t\t}",
			"\t}),",
		])
	}
	if (detectedOption.formats?.length) {
		out.push(...[
			`\t...defineJs({input,formats: ${JSON.stringify(detectedOption.formats)}})`,
		])
	}

	out.push(...[
		"]",
		"",
	])

	writeFileSync(cfgPath, out.join('\n'))
}
