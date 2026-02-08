import {RollupOptions} from 'rollup'
import {defineJs, defineDts} from "./src";
import {logJson} from "gs-base";

const input = [
	'src/index.ts',
	'src/dts/index.ts',
	'src/type/index.ts',
	'src/plugins/index.ts',
	'src/core/index.ts',
	'src/tools/index.ts',
]

const dts = defineDts({input});
const js = defineJs({
	input,
	minify: true,
	outputCodeDir:'lib-min',
	formats: ['esm'],
})

const rollupOptions: RollupOptions[] = [
	// ...dts,
	...js
]
logJson(rollupOptions, false)

export default rollupOptions
