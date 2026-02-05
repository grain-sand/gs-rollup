import {existsSync, readdirSync, readFileSync} from "node:fs";
import {join} from "node:path";

export function detectEntry(): string {
	try {
		const pkg = JSON.parse(readFileSync("package.json", "utf8"));
		for (const k of ["exports", "module", "main"]) {
			const v = pkg[k];

			if (typeof v === "string" && existsSync(v))
				return v;
		}
	} catch {
	}

	const list = [
		"src/index.ts",
		"src/main.ts",
		"src/index.js",
		"index.ts"
	];

	for (const p of list)
		if (existsSync(p)) return p;

	if (existsSync("src")) {

		const files = readdirSync("src")
			.filter(f => /\.(ts|js)$/.test(f));

		if (files.length === 1)
			return join("src", files[0]);
	}

	return "src/index.ts";
}
