import {RollupOptions} from 'rollup'
import {defineJs, defineDts, importReplace} from "./src";
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
	// minify: true,
	// outputCodeDir:'lib-min',
	formats: ['esm','cjs'],
})
const js2 = defineJs({
	input:['src/main/index.ts'],
	// minify: true,
	outputCodeDir:'bin',
	formats: ['cjs'],
	addExternal:/^[.\/].*\/(core|tools|plugins|type|dts)$/,
	addPlugins:[importReplace({
		search:/^(\.{2}\/)+/,
		replace:'../lib/'
	})]
})

const rollupOptions: RollupOptions[] = [
	// ...dts,
	// ...js,
	...js2
]
logJson(rollupOptions, false)

export default rollupOptions
