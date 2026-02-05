export function stripConfig(args: string[]) {

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
