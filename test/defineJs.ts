// noinspection ES6UnusedImports
// noinspection JSUnusedLocalSymbols

import {describe, it, expect} from "vitest";
import {logJson} from "gs-base";
import { defineJs} from "../src";
import {readFileSync} from "node:fs";
import {GsRollupDefaults} from "../src/tools";

describe('defineJs', () => {
	it('js default', async (): Promise<void> => {
		const result = defineJs();
		await logJson(result)
	})
	it('js mini', async (): Promise<void> => {
		const result = defineJs();
		await logJson(result)
	})
	it('js regex', async (): Promise<void> => {
		const [reg] = GsRollupDefaults.external as RegExp[];
		const pkg = JSON.parse(readFileSync("package.json", "utf8"));
		const names = ['./abc', '/src/def','src/index.ts','src/main.ts'];
		for (const n of [...names, ...Object.keys(pkg.dependencies), ...Object.keys(pkg.devDependencies)]) {
			console.log(n, reg.test(n))
		}
	})
})
