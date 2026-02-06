import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import {RollupOptions} from 'rollup'
import {DefaultValues, defineDts, defineJs} from "./src";
import {logJson} from "gs-base";

DefaultValues.input = {
	index: 'src/index.ts',
	main: 'src/main.ts',
}

const dts = defineDts();
const js = defineJs({
	formats: [{
		format: 'esm',
		minify: true
	}, 'cjs'],
})
logJson(js, false)

export default <RollupOptions[]>[
	// ...dts
	...js
]
