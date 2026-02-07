import {RollupOptions} from 'rollup'
import {defineJs, defineDts} from "./src";
import {logJson} from "gs-base";

const input = [
	'src/index.ts',
	'src/dts/index.ts',
	'src/type/index.ts',
	'src/core/index.ts'
]

const dts = defineDts({input});
const js = defineJs({
	input,
	// minify: true,
	formats: ['esm', 'cjs'],
})

const rollupOptions: RollupOptions[] = [
	...dts,
	...js
]
logJson(rollupOptions, false)

export default rollupOptions
