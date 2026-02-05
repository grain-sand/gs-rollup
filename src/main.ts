#!/usr/bin/env node

import {join, resolve} from "node:path";
import {existsSync} from "node:fs";
import {normalizeArgs} from "./fn/normalizeArgs";
import {getConfigArg} from "./fn/getConfigArg";
import {stripConfig} from "./fn/stripConfig";
import {spawnRollup} from "./fn/spawnRollup";
import {runProgrammaticDefault} from "./fn/runProgrammaticDefault";
import {initProject} from "./fn/initProject";


/* ================= 主流程 ================= */

async function main() {

	const args = normalizeArgs(process.argv.slice(2));
	const has = (f: string) => args.includes(f);

	if (!args.length || has("--help")) {
		console.log("\nUse -i to initialize project.\n");
		spawnRollup(args);
		return;
	}

	if (has("--init")) {
		await initProject();
		return;
	}

	if (has("--config")) {

		const cfgArg = getConfigArg(args);
		const baseArgs = stripConfig(args);

		const tsCfg = join(process.cwd(), "rollup.config.ts");
		const jsCfg = join(process.cwd(), "rollup.config.js");

		if (!cfgArg) {

			if (existsSync(tsCfg)) {
				spawnRollup(["--config", tsCfg, ...baseArgs], true);
				return;
			}

			if (existsSync(jsCfg)) {
				spawnRollup(["--config", jsCfg, ...baseArgs], false);
				return;
			}

			await runProgrammaticDefault();
			return;
		}

		const cfg = resolve(cfgArg);

		if (existsSync(cfg))
			spawnRollup(args, cfg.endsWith(".ts"));
		else
			await runProgrammaticDefault();

		return;
	}

	spawnRollup(args);
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
