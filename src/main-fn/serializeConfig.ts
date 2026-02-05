import {GeneratedConfig} from "./types";
import {serializeValue} from "./serializeValue";

export function serializeConfig(gen: GeneratedConfig): string {

	const configs = gen.rollup
	const meta = gen.meta

	const entry = configs[0].input.replace(/\\/g, "/");

	const external = serializeValue(configs[0].external);

	const dtsOpts = serializeValue(meta.tsConfig);
	const copyTargets = serializeValue(meta.copyTargets);
	const esbuildOpts = serializeValue(meta.esbuildOpts);

	const outDts = configs[0].output[0];
	const outJs = configs[1].output[0];
	const outCjs = configs[1].output[1];

	return `
import dts from 'rollup-plugin-dts'
import esbuild from 'rollup-plugin-esbuild'
import resolve from '@rollup/plugin-node-resolve'
import copy from 'rollup-plugin-copy'
import {RollupOptions} from 'rollup'

const input = '${entry}'
const external = ${external}
const outputBase = 'dist'
const outputLibDir = \`\${outputBase}/lib\`

const plugins = [
	resolve(),
	esbuild(${esbuildOpts})
]

export default <RollupOptions[]>[{
	input,
	external,
	output: [{
		file: \`\${outputLibDir}/index.d.ts\`,
		format: '${outDts.format}',
		sourcemap: ${outDts.sourcemap}
	}],
	plugins: [
		dts(${dtsOpts}),
		copy({targets: ${copyTargets}})
	],
}, {
	input,
	external,
	output: [{
		file: \`\${outputLibDir}/index.js\`,
		format: '${outJs.format}',
		sourcemap: ${outJs.sourcemap}
	}, {
		file: \`\${outputLibDir}/index.cjs\`,
		format: '${outCjs.format}',
		sourcemap: ${outCjs.sourcemap}
	}],
	plugins,
}]
`.trim();
}
