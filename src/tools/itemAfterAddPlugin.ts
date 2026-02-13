import {IDefineItemArg, PostCodeModify} from "../type";
import {postCodeModify as postCodeModifyPlugin} from "../plugins";
import {isBoolean} from "gs-base";
import {RollupOptions} from "rollup";
import {defaultReplaceImportRole, GsRollupDefaults} from "./GsRollupDefaults";

export function itemAfterAddPlugin(options: RollupOptions[], arg?: IDefineItemArg): RollupOptions[] {
	const {
		postCodeModify = GsRollupDefaults.postCodeModify,
		addPlugins
	} = arg || {}

	if (postCodeModify !== false) {
		const codeModifyArg = isBoolean(postCodeModify) ? defaultReplaceImportRole : postCodeModify;
		const plugin = postCodeModifyPlugin(codeModifyArg as PostCodeModify);
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
