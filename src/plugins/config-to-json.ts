import {pathToFileURL} from "node:url";
import fs from "node:fs/promises";
import {FunctionPluginHooks, Plugin} from "rollup";
import {IConfigToJsonArg} from "../type";

const SUPPORTED = /\.(ts|js|json)$/;

export function configToJson(arg: IConfigToJsonArg = {}): Plugin {
	const entries = new Map<string, string>();
	const space = arg.minify ? undefined : 2;

	return <Plugin & Partial<FunctionPluginHooks>>{
		name: "config-to-json",

		buildStart(inputOptions) {
			const input =
				typeof inputOptions.input === "string"
					? {main: inputOptions.input}
					: inputOptions.input ?? {};

			for (const [name, file] of Object.entries(input) as any) {
				if (SUPPORTED.test(file)) {
					entries.set(name, file);
				}
			}
		},

		load(id: string) {
			if (!SUPPORTED.test(id)) return null;
			return "export default {};";
		},

		async generateBundle(outputOptions, bundle) {
			for (const [fileName, item] of Object.entries(bundle)) {
				if (item.type !== "chunk") continue;

				const entry = [...entries.values()][0]; // 单入口情形
				let data;

				if (entry.endsWith(".json")) {
					const raw = await fs.readFile(entry, "utf8");
					data = JSON.parse(raw);
				} else {
					const url =
						pathToFileURL(entry).href +
						`?t=${Date.now()}`;

					const mod = await import(url);
					data = mod.default ?? mod;
				}

				if (arg.transform) {
					data = await arg.transform(data, {
						name: fileName,
						file: entry
					});
				}

				const json = JSON.stringify(data, null, space);

				delete bundle[fileName];

				this.emitFile({
					type: "asset",
					fileName,
					source: json
				});
			}
		}
	};
}
