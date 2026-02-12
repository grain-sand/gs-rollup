import {IDefineItemArg, PostCodeModify} from "../type";
import {postCodeModify} from "../plugins";
import {isBoolean} from "gs-base";
import {RollupOptions} from "rollup";
import {defaultReplaceImportRole, GsRollupDefaults} from "./GsRollupDefaults";

export function itemAfterAddPlugin(options: RollupOptions[], arg?: IDefineItemArg): RollupOptions[] {
	const {
		replaceImport = GsRollupDefaults.replaceImport,
		addPlugins
	} = arg || {}

	if (replaceImport !== false) {
		const codeModifyArg = isBoolean(replaceImport) ? defaultReplaceImportRole : replaceImport;
		const plugin = postCodeModify(codeModifyArg as PostCodeModify);
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
