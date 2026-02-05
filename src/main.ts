#!/usr/bin/env node

import {spawn} from "node:child_process";
import {existsSync, writeFileSync} from "node:fs";
import {join, resolve} from "node:path";
import {createRequire} from "node:module";
import {Options} from "rollup-plugin-esbuild";
import {detectEntry} from "./fn/detectEntry";

type GeneratedConfig = {
	rollup: (import('rollup').RollupOptions & any)[]
	meta: {
		tsConfig: any
		esbuildOpts: any
		copyTargets: any
	}
}


const require = createRequire(import.meta.url);

/* ================= 参数标准化 ================= */

function normalizeArgs(argv: string[]) {

	const alias: Record<string, string> = {
		"-c": "--config",
		"-i": "--init",
		"-h": "--help"
	};

	const out: string[] = [];

	for (let i = 0; i < argv.length; i++) {

		let a = alias[argv[i]] || argv[i];

		if (a.startsWith("--config=")) {
			out.push("--config", a.split("=")[1]);
			continue;
		}

		if (a === "--config") {
			const v = argv[i + 1];
			if (v && !v.startsWith("-")) {
				out.push("--config", v);
				i++;
			} else out.push("--config");
			continue;
		}

		out.push(a);
	}

	return out;
}

function getConfigArg(args: string[]) {

	const i = args.indexOf("--config");

	if (i >= 0 && args[i + 1] && !args[i + 1].startsWith("-"))
		return args[i + 1];
}

function stripConfig(args: string[]) {

	const out: string[] = [];

	for (let i = 0; i < args.length; i++) {

		if (args[i] === "--config") {
			if (args[i + 1] && !args[i + 1].startsWith("-"))
				i++;
			continue;
		}

		out.push(args[i]);
	}

	return out;
}

/* ================= rollup spawn ================= */

function spawnRollup(args: string[] = [], useTS = false) {

	const bin = require.resolve("rollup/dist/bin/rollup");

	const nodeArgs: string[] = [];

	if (useTS)
		nodeArgs.push("--import", "tsx/esm");

	const child = spawn(
		process.execPath,
		[...nodeArgs, bin, ...args],
		{stdio: "inherit"}
	);

	child.on("exit", c => process.exit(c ?? 0));
}

/* ================= config 生成（唯一来源） ================= */

async function generateConfig(): Promise<GeneratedConfig> {

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


/* ================= JS → TS 序列化 ================= */

function serializeValue(v: any): string {

	if (v instanceof RegExp)
		return v.toString();

	if (typeof v === "string")
		return `'${v.replace(/\\/g, "/")}'`;

	if (Array.isArray(v))
		return `[${v.map(serializeValue).join(", ")}]`;

	if (typeof v === "object" && v !== null) {

		const body = Object.entries(v)
			.map(([k, val]) => `${k}: ${serializeValue(val)}`)
			.join(", ");

		return `{${body}}`;
	}

	return String(v);
}


function serializeConfig(gen: GeneratedConfig): string {

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

export default <RollupOptions[]>[
	{
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
	},
	{
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
	}
]
`.trim();
}


/* ================= 默认程序化构建 ================= */

async function runProgrammaticDefault() {

	const {rollup} = await import('rollup')
	const {rollup: configs} = await generateConfig()

	for (const cfg of configs) {

		const bundle = await rollup(cfg)
		const outputs = Array.isArray(cfg.output) ? cfg.output : [cfg.output]

		for (const out of outputs)
			await bundle.write(out)
	}
}


/* ================= init ================= */

async function initProject() {

	const cfgPath = 'rollup.config.ts'
	if (existsSync(cfgPath)) return

	const generated = await generateConfig()
	const content = serializeConfig(generated)

	writeFileSync(cfgPath, content)
}


/* ================= 主流程 ================= */

async function main() {

	const args = normalizeArgs(process.argv.slice(2));
	const has = (f: string) => args.includes(f);

	if (!args.length || has("--help")) {
		console.log("\nUse -i to initialize project.\n");
		spawnRollup(args);
		return;
	}

	if (has("--init")) {
		await initProject();
		return;
	}

	if (has("--config")) {

		const cfgArg = getConfigArg(args);
		const baseArgs = stripConfig(args);

		const tsCfg = join(process.cwd(), "rollup.config.ts");
		const jsCfg = join(process.cwd(), "rollup.config.js");

		if (!cfgArg) {

			if (existsSync(tsCfg)) {
				spawnRollup(["--config", tsCfg, ...baseArgs], true);
				return;
			}

			if (existsSync(jsCfg)) {
				spawnRollup(["--config", jsCfg, ...baseArgs], false);
				return;
			}

			await runProgrammaticDefault();
			return;
		}

		const cfg = resolve(cfgArg);

		if (existsSync(cfg))
			spawnRollup(args, cfg.endsWith(".ts"));
		else
			await runProgrammaticDefault();

		return;
	}

	spawnRollup(args);
}

main().catch(e => {
	console.error(e);
	process.exit(1);
});
