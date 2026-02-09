import {IDefineOutputOption} from "../type";
import {OutputOptions} from "rollup";
import {GsRollupDefaults, formatOutput} from "../tools";

export function defineOutput(file: string, arg: IDefineOutputOption): OutputOptions {
	let {
		overwriteProps,
		format,
		extension,
		outputCodeDir = GsRollupDefaults.outputCodeDir,
		outputBase = GsRollupDefaults.outputBase
	} = arg;
	return {
		format,
		file: formatOutput(file, outputBase, outputCodeDir, format, extension),
		...overwriteProps,
	}
}
