import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'
import {RollupOptions} from 'rollup'

const input = 'src/index.ts'
const external = [/^node:/, /(?:^[^/.]+|\.(vue|scss))$/]
const outputBase = 'dist'
const outputLibDir = `${outputBase}/lib`

const plugins = [
	resolve(),
	esbuild({target: 'esnext', minifySyntax: true, charset: 'utf8', minify: false})
]

export default <RollupOptions[]>[
	{
		input,
		external,
		output: [{
			file: `${outputLibDir}/index.d.ts`,
			format: 'esm',
			sourcemap: false
		}],
		plugins: [
			dts({respectExternal: false, exclude: ['test/**/*.ts']}),
			copy({targets: [{src: '*.md', dest: 'dist'}]})
		],
	},
	{
		input,
		external,
		output: [{
			file: `${outputLibDir}/index.js`,
			format: 'esm',
			sourcemap: false
		}, {
			file: `${outputLibDir}/index.cjs`,
			format: 'cjs',
			sourcemap: false
		}],
		plugins,
	}
]