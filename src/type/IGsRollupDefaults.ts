import {IDetectedOption} from "./IDetectedOption";
import {ExternalOption} from "rollup";
import {FormatInputFn, IDefineItemArg} from "./IDefineItemArg";
import {CopyRenameFn} from "./ICopyTarget";

export interface IGsRollupDefaults extends IDetectedOption, Pick<IDefineItemArg, 'includeInputDir' | 'includeInputSrc' | 'externalByInput' | 'replaceImport'> {
	external: ExternalOption
	formatInput?: FormatInputFn
	copyRename?: CopyRenameFn

	init(showPattern?: boolean): IDetectedOption
}
