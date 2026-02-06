import {ExternalOption, InputOption} from "rollup";
import {detectEntry} from "./fn/detectEntry";
import {join} from "node:path";

export class DefaultValues {

	static #input?: InputOption

	static outputBase = 'dist'

	static codeDir = 'lib'

	static external: ExternalOption = [/^node:/, /(?:^[^/.]+|\.(vue|scss))$/]

	static get fullCodeDir(): string {
		return join(this.outputBase, this.codeDir)
	}

	static get input(): InputOption {
		return this.#input || (this.#input = detectEntry())
	}

	static set input(value: InputOption) {
		this.#input = value
	}
}
