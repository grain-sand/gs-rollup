import {FunctionPluginHooks, Plugin} from "rollup";
import {IPackageJsonArg} from "../type";
import {defaultPackageJsonFileName, DefaultValues, processPackageJson} from "../tools";
import fs from "fs";
import {join} from "node:path";

export function packageJson(arg?: IPackageJsonArg): Plugin {
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'package-json',
		generateBundle() {
			const {outputBase = DefaultValues.outputBase} = arg||{};
			fs.writeFileSync(join(outputBase, defaultPackageJsonFileName), processPackageJson(arg));
		},
	}
}
