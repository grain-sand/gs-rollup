import {spawn} from "node:child_process";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);

export function spawnRollup(args: string[] = [], useTS = false) {

	const bin = require.resolve("rollup/dist/bin/rollup");

	const nodeArgs: string[] = [];

	if (useTS) {
		nodeArgs.push("--import", "tsx/esm");
	}


	if (process.env.DEBUG) {
		nodeArgs.push('--inspect-brk', "--inspect-port=9229");
	}
	const allArgs = [...nodeArgs, bin, ...args];
	// console.log(allArgs)
	const child = spawn(
		process.execPath,
		allArgs,
		{stdio: "inherit"}
	);

	child.on("exit", c => process.exit(c ?? 0));
}
