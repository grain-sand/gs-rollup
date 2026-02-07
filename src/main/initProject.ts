import {existsSync, writeFileSync} from "node:fs";
import {generateConfig} from "./generateConfig";
import {serializeConfig} from "./serializeConfig";

export async function initProject() {

	const cfgPath = 'rollup.config.ts'
	if (existsSync(cfgPath)) return

	const generated = await generateConfig()
	const content = serializeConfig(generated)

	writeFileSync(cfgPath, content)
}
