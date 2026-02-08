import {ExternalOption, InputOption} from "rollup";
import {detectEntry} from "./index";

export class DefaultValues {

	static #input?: InputOption

	static outputBase = 'dist'

	static outputCodeDir = 'lib'

	static external: ExternalOption = [/^node:|dynamic|(?:^[^/.]{2}.*[^.]{4}|\.(vue|scss))$/]

	static get input(): InputOption {
		return this.#input || (this.#input = detectEntry())
	}

	static set input(value: InputOption) {
		this.#input = value
	}
}
