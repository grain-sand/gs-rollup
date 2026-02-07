import {generateConfig} from "./generateConfig";

export async function runProgrammaticDefault() {

	const {rollup} = await import('rollup')
	const {rollup: configs} = await generateConfig()

	for (const cfg of configs) {

		const bundle = await rollup(cfg)
		const outputs = Array.isArray(cfg.output) ? cfg.output : [cfg.output]

		for (const out of outputs)
			await bundle.write(out)
	}
}
