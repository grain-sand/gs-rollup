import {Options} from "rollup-plugin-esbuild";
import {detectEntry} from "../impl/fn/detectEntry";
import {GeneratedConfig} from "./types";

export async function generateConfig(): Promise<GeneratedConfig> {

	const entry = detectEntry()

	const dts = (await import('rollup-plugin-dts')).default
	const esbuild = (await import('rollup-plugin-esbuild')).default
	const resolvePlugin = (await import('@rollup/plugin-node-resolve')).default
	const copy = (await import('rollup-plugin-copy')).default

	const external = [
		/^node:/,
		/(?:^[^/.]+|\.(vue|scss))$/
	]

	const tsConfig = {
		respectExternal: false,
		exclude: ['test/**/*.ts']
	}

	const esbuildOpts: Options = {
		target: 'esnext',
		minifySyntax: true,
		charset: 'utf8',
		minify: false
	}

	const copyTargets = [
		{src: '*.md', dest: 'dist'}
	]

	const plugins = [
		resolvePlugin(),
		esbuild(esbuildOpts)
	]

	return {
		rollup: [
			{
				input: entry,
				external,
				output: [{
					file: 'dist/lib/index.d.ts',
					format: 'esm',
					sourcemap: false
				}],
				plugins: [
					dts(tsConfig),
					copy({targets: copyTargets})
				]
			},
			{
				input: entry,
				external,
				output: [
					{
						file: 'dist/lib/index.js',
						format: 'esm',
						sourcemap: false
					},
					{
						file: 'dist/lib/index.cjs',
						format: 'cjs',
						sourcemap: false
					}
				],
				plugins
			}
		],
		meta: {
			tsConfig,
			esbuildOpts,
			copyTargets
		}
	}
}
