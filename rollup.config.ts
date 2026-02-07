import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import {RollupOptions} from 'rollup'
import {DefaultValues, defineDts, defineJs} from "./src";
import {logJson} from "gs-base";

const input = [
	'src/index.ts',
	'src/dts/index.ts',
	'src/type/index.ts',
	'src/core/index.ts',
	'src/plugins/index.ts',
]

const dts = defineDts({input});
const js = defineJs({
	input,
	formats: [{
		format: 'esm',
		minify: true
	}, 'cjs'],
})

const rollupOptions: RollupOptions[] = [
	...dts
	// ...js
]
logJson(rollupOptions, false)

export default rollupOptions
