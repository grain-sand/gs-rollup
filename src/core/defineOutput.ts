import {IDefineOutputOption} from "../type";
import {OutputOptions} from "rollup";
import {DefaultValues, formatOutput} from "../tools";

export function defineOutput(file: string, arg: IDefineOutputOption): OutputOptions {
	let {
		overwriteProps,
		format,
		extension,
		outputCodeDir = DefaultValues.outputCodeDir,
		outputBase = DefaultValues.outputBase
	} = arg;
	return {
		format,
		file: formatOutput(file, outputBase, outputCodeDir, format, extension),
		...overwriteProps,
	}
}
