import {ExternalOption, InputOption, ModuleFormat} from "rollup";
import {detectRollupOption} from "./detectRollupOption";
import {formatInput} from "./formatInput";
import {FormatInputFn, IDetectedOption, IGsRollupDefaults} from "../type";

export const GsRollupDefaults: Required<IGsRollupDefaults> = class {

	static external: ExternalOption = [/^node:|dynamic|(?:^[^/.]{2}.*[^.]{4}|\.(vue|scss))$/]

	static formatInput: FormatInputFn = formatInput
	
	static includeInputDir = false

	static includeInputSrc = false

	static #_detected?: IDetectedOption

	static get detected() {
		return this.#_detected || (this.#_detected = detectRollupOption());
	}

	static get input(): InputOption {
		return this.detected.input;
	}

	static set input(value: InputOption) {
		this.detected.input = value
	}

	static get types(): boolean {
		return this.detected.types;
	}

	static set types(value: boolean) {
		this.detected.types = value
	}

	static get formats(): ModuleFormat {
		return this.detected.formats;
	}

	static set formats(value: ModuleFormat) {
		this.detected.formats = value
	}

	static get outputBase(): string {
		return this.detected.outputBase;
	}

	static set outputBase(value: string) {
		this.detected.outputBase = value
	}

	static get outputCodeDir(): string {
		return this.detected.outputCodeDir;
	}

	static set outputCodeDir(value: string) {
		this.detected.outputCodeDir = value
	}


}
