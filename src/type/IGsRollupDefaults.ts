import {IDetectedOption} from "./IDetectedOption";
import {ExternalOption} from "rollup";
import {FormatInputFn, IDefineItemArg} from "./IDefineItemArg";

export interface IGsRollupDefaults extends IDetectedOption, Pick<IDefineItemArg, 'includeInputDir' | 'includeInputSrc' | 'externalByInput'> {
	external: ExternalOption
	formatInput?: FormatInputFn

	init(showPattern?: boolean): IDetectedOption
}
