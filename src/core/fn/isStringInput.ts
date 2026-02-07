import {InputOption} from "rollup";
import {isString} from "gs-base";

export function isStringInput(input: InputOption) {
	return isString(input) || Array.isArray(input);
}
