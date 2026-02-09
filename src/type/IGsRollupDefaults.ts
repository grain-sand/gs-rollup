import {IDetectedOption} from "./IDetectedOption";
import {ExternalOption} from "rollup";
import {FormatInputFn} from "./IDefineItemArg";
import {IDefineArg} from "./IDefineArg";

export interface IGsRollupDefaults extends IDetectedOption, Pick<IDefineArg, 'includeInputDir' | 'includeInputSrc'> {
	external: ExternalOption
	formatInput?: FormatInputFn
}
