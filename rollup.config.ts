import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import {RollupOptions} from 'rollup'
import {DefaultValues, defineDts} from "./src";
import {logJson} from "gs-base";

const input = 'src/index.ts'
const external = [/^node:/, /(?:^[^/.]+|\.(vue|scss))$/]
const outputBase = 'dist'
const outputLibDir = `${outputBase}/lib`

const plugins = [
	resolve(),
	esbuild({target: 'esnext', minifySyntax: true, charset: 'utf8', minify: false})
]

DefaultValues.input = {
	index: 'src/index.ts',
	main: 'src/main.ts',
}

const dts = defineDts();
logJson(dts, false)

export default <RollupOptions[]>[
	dts
	// {
	// 	input,
	// 	external,
	// 	output: [
	// 		{
	// 			dir: 'dist',
	// 			format: 'esm',
	// 			entryFileNames: '[name].js',
	// 			inlineDynamicImports: true
	// 		},
	// 		{
	// 			dir: 'dist',
	// 			format: 'cjs',
	// 			entryFileNames: '[name].cjs',
	// 			inlineDynamicImports: true
	// 		}
	// 	],
	// 	plugins,
	// }
]
