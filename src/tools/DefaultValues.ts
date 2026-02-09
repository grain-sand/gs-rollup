import {ExternalOption, InputOption, ModuleFormat} from "rollup";
import {detectRollupOption} from "./detectRollupOption";
import {IDetectedOption} from "../type";

export class DefaultValues {

	static external: ExternalOption = [/^node:|dynamic|(?:^[^/.]{2}.*[^.]{4}|\.(vue|scss))$/]

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

}
