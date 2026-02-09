export function normalizeArgs(argv: string[]) {

	const alias: Record<string, string> = {
		"-c": "--config",
		"-t": "--init",
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
