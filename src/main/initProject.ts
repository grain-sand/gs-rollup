import {existsSync, writeFileSync} from "node:fs";
import {detectRollupOption} from "../tools";

const cfgPath = 'rollup.config.ts'
const tsCfgPath = 'tsconfig.json'

const tsConfig = {
	compilerOptions: {
		allowJs: true,
		baseUrl: "./",
		esModuleInterop: true,
		experimentalDecorators: true,
		forceConsistentCasingInFileNames: true,
		lib: ["ESNext", "DOM"],
		module: "ESNext",
		moduleResolution: "Bundler",
		noEmit: true,
		preserveConstEnums: true,
		skipLibCheck: true,
		sourceMap: false,
		strict: false,
		target: "ESNext",
	}
}

export async function initProject(args: string[]) {
	try {
		writeCfg(args)
	} catch (e) {
		console.error('init project failed', e)
	}
	writeTsCfg()
}

function writeTsCfg() {
	if (existsSync(tsCfgPath)) {
		console.log('\x1b[32mtsconfig.json already exists\x1b[0m')
		return
	}
	writeFileSync(tsCfgPath, JSON.stringify(tsConfig, null, 2))
}

function writeCfg(args: string[]) {
	if (existsSync(cfgPath)) {
		console.log('\x1b[32mrollup.config.ts already exists\x1b[0m')
	}
	const pattern = args.length > 1 ? args.pop() : undefined;
	const detectedOption = detectRollupOption(pattern, true);
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
