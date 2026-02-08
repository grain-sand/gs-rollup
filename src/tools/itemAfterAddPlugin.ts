import {IDefineDtsArg} from "../type";
import {importReplace} from "../plugins";
import {isBoolean} from "gs-base";
import {RollupOptions} from "rollup";

export function itemAfterAddPlugin(options: RollupOptions[], arg?: IDefineDtsArg): RollupOptions[] {
	const {
		processImport,
		addPlugins
	} = arg || {}

	if (processImport || options.length > 1) {
		const plugin = importReplace(isBoolean(processImport) ? undefined : processImport as any);
		for (const item of options) {
			item.plugins = [...(item.plugins || []), plugin];
		}
	}
	if (addPlugins?.length) {
		for (const item of options) {
			item.plugins = [...(item.plugins || []), ...addPlugins];
		}
	}
	return options;
}
