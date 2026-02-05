import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve';
import copy from 'rollup-plugin-copy'

const input = 'src/index.ts'    //这里改为自动确定

const external = []

const tsConfig = {
	respectExternal: false,
	exclude: ["test/**/*.ts"],
}


const plugins = [
	resolve(),
	esbuild({
		target: 'es2022',
		minifySyntax: true,
		charset: 'utf8',
		minify: false
	}),
];

export default [
	{
		input,
		external,
		output: [
			{
				file: 'dist/lib/index.d.ts',
				format: 'esm',
				sourcemap: false,
			},
		],
		plugins: [
			dts(tsConfig),
			copy({
				targets: [
					{src: '*.md', dest: 'dist'},
				]
			})
		],
	},
	{
		input,
		external,
		output: [
			{
				file: 'dist/lib/index.js',
				format: 'esm',
				sourcemap: false,
			},
			{
				file: 'dist/lib/index.cjs',
				format: 'cjs',
				sourcemap: false,
			},
		],
		plugins,
	},
	{
		input,
		output: {
			file: 'dist/lib/index.web.js',
			format: 'esm',
			sourcemap: false,
		},
		plugins: [...plugins,
		]
	},
];


