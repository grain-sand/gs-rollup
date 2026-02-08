import {defineDts} from "../dts";
import {defineJs} from "../core";

export async function runProgrammaticDefault() {
	const {rollup} = await import('rollup')
	for (const cfg of [
		...defineDts({
			buildPackageJson: {
				deleteProps:/^(devDependencies|scripts)$/
			}
		}),
		...defineJs()
	]) {
		const bundle = await rollup(cfg)
		const outputs = Array.isArray(cfg.output) ? cfg.output : [cfg.output]

		for (const out of outputs)
			await bundle.write(out)
	}
}
