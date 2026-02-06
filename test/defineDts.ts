// noinspection ES6UnusedImports
// noinspection JSUnusedLocalSymbols

import {describe, it, expect} from "vitest";
import {logJson} from "gs-base";
import {defineDts} from "../src";

describe('defineDts.ts', () => {
	it('define string', async (): Promise<void> => {
		const result = defineDts({copyMd: false});
		await logJson(result)
	})
	it('define array', async (): Promise<void> => {
		const result = defineDts({
			input: ['src/index.ts', 'src/main.ts', 'src-com/main.ts'],
			includeInputDir: true,
			includeInputSrc: true
		});
		await logJson(result)
	})
	it('define record', async (): Promise<void> => {
		const result = defineDts();
		await logJson(result)
	})
})
