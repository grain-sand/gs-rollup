export function getConfigArg(args: string[]) {

	const i = args.indexOf("--config");

	if (i >= 0 && args[i + 1] && !args[i + 1].startsWith("-"))
		return args[i + 1];
}
