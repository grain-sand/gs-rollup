import {existsSync, writeFileSync} from "node:fs";
import {detectRollupOption} from "../tools";

const cfgPath = 'rollup.config.ts'

export async function initProject() {
	if (existsSync(cfgPath)) return
	const detectedOption = detectRollupOption();
	const out = [
		"import { RollupOptions } from 'rollup'",
		"import { defineJs, defineDts } from 'gs-rollup'",
		'',
		`const input = ${JSON.stringify(detectedOption.input)}`,
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
