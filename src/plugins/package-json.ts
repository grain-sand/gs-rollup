import {FunctionPluginHooks, Plugin} from "rollup";
import {IPackageJsonArg} from "../type";
import {defaultPackageJsonFileName, GsRollupDefaults, processPackageJson} from "../tools";
import fs from "fs";
import {join} from "node:path";

export function packageJson(arg?: IPackageJsonArg): Plugin {
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'package-json',
		generateBundle() {
			const {outputBase = GsRollupDefaults.outputBase} = arg || {};
			fs.mkdirSync(outputBase, {recursive: true});
			fs.writeFileSync(join(outputBase, defaultPackageJsonFileName), processPackageJson(arg));
		},
	}
}
