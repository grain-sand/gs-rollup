import {defineJs} from "../core";
import {GsRollupDefaults} from "../tools";

export async function runProgrammaticDefault() {
	const {rollup} = await import('rollup')
	GsRollupDefaults.init(true)
	const dts = [];
	try {
		const {defineDts} = await import('../dts')
		dts.push(...defineDts({
			buildPackageJson: {
				deleteProps: /^(devDependencies|scripts)$/
			}
		}))
	} catch (e) {
		if (/MODULE_NOT_FOUND|Cannot\s+find\s+module/i.test(e.code || e.message)) {
			console.warn(`\x1b[33mWarning\x1b[0m: Failed to load 'rollup-plugin-dts' or 'typescript'.\x1b[33m\n'*.d.ts' can not be generated.\x1b[0m\nPlease install them.`)
		} else {
			console.error(e)
		}
	}
	for (const cfg of [
		...dts,
		...defineJs()
	]) {
		const bundle = await rollup(cfg)
		const outputs = Array.isArray(cfg.output) ? cfg.output : [cfg.output]

		for (const out of outputs)
			await bundle.write(out)
	}
}
