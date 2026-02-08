import {existsSync, writeFileSync} from "node:fs";
import {detectEntry} from "../tools";

const cfgPath = 'rollup.config.ts'

export async function initProject() {
	if (existsSync(cfgPath)) return
	const entry = detectEntry() || 'src/index.ts';
	const out = [
		"import { RollupOptions } from 'rollup'",
		"import { defineJs, defineDts } from 'gs-rollup'",
		'',
		`const input = [ '${entry.replace(/\\/g, '/')}' ]`,
		"",
		"export default <RollupOptions[]>[",
		"\t...defineDts({" ,
		"\t\tinput," ,
		"\t\tbuildPackageJson: {" ,
		"\t\t\tdeleteProps: /^(devDependencies|scripts)$/" ,
		"\t\t}" ,
		"\t}),",
		"\t...defineJs({input})",
		"]",
		"",
	];
	writeFileSync(cfgPath, out.join('\n'))
}
