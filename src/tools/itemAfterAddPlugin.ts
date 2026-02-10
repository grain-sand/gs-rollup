import {IDefineDtsArg, ImportReplaceRole} from "../type";
import {importReplace} from "../plugins";
import {isBoolean} from "gs-base";
import {RollupOptions} from "rollup";
import {defaultReplaceImportRole, GsRollupDefaults} from "./GsRollupDefaults";

export function itemAfterAddPlugin(options: RollupOptions[], arg?: IDefineDtsArg): RollupOptions[] {
	const {
		replaceImport = GsRollupDefaults.replaceImport,
		addPlugins
	} = arg || {}

	if (replaceImport !== false) {
		const arg = isBoolean(replaceImport) ? defaultReplaceImportRole:replaceImport as  ImportReplaceRole;
		const plugin = importReplace(arg);
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
