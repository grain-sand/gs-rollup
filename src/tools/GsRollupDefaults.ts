import {ExternalOption, InputOption} from "rollup";
import {detectRollupOption} from "./detectRollupOption";
import {formatInput} from "./formatInput";
import {
	CopyRenameFn,
	DefineJsFormat,
	ExternalByInputFn,
	FormatInputFn,
	IDetectedOption,
	IGsRollupDefaults,
	PostCodeModify
} from "../type";
import {defaultExternalByInput} from "./defaultExternalByInput";

export const defaultReplaceImportRole = Object.freeze({
	search: /^(?:\.+\/)+([\w-$./]+(?:\.[cm]?[tj]s)?)$/,
	replace: './$1',
	ensureExtension: true
})

export const defaultCopyRename: CopyRenameFn = (_, $, full) => full

export const GsRollupDefaults: Required<IGsRollupDefaults> = class {

	static external: ExternalOption = [/^node:|dynamic|^[@\w][\w-]+(\/[\w-]+)?\w$/]

	static formatInput: FormatInputFn = formatInput

	static externalByInput: ExternalByInputFn = defaultExternalByInput

	static postCodeModify: boolean | PostCodeModify = [{...defaultReplaceImportRole}]

	static copyRename: CopyRenameFn = defaultCopyRename

	static includeInputDir = false

	static includeInputSrc = false

	static #_detected?: IDetectedOption

	static get isVue(): boolean {
		return this.detected.isVue;
	}

	static get detected() {
		return this.#_detected || this.init();
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

	static get jsFormats(): DefineJsFormat | DefineJsFormat[] {
		return this.detected.jsFormats;
	}

	static set jsFormats(value: DefineJsFormat | DefineJsFormat[]) {
		this.detected.jsFormats = value
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

	static init(showPattern?: boolean): IDetectedOption {
		return this.#_detected || (this.#_detected = detectRollupOption(undefined, showPattern));
	}


}
