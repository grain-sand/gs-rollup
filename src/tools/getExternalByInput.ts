import {ExternalByInput, IDefineDtsArg} from "../type";
import {ExternalOption} from "rollup";
import {isFunction} from "gs-base";
import {GsRollupDefaults} from "./GsRollupDefaults";

export function getExternalByInput(currInput: string, inputEntries: [string, string][], arg?: IDefineDtsArg): ExternalOption | undefined {
	const {
		external = GsRollupDefaults.external,
		externalByInput,
		addExternal
	} = arg || {};
	if (externalByInput) {
		const ex = getByInput(currInput, externalByInput)
		if (ex) {
			return ex;
		}
	}
	if (isFunction(external)) {
		return external;
	}
	const result = Array.isArray(external) ? [...external] : [external] as (string | RegExp)[];
	if (inputEntries.length > 1) {
		const inputs = inputEntries
			.map(([, i]) => i)
			.filter(i => i !== currInput)
			.map(i => i.replace(/^src[\\/]|(?:[\\/]?index)?\.[tj]s$/g, ''))
			.filter(Boolean)
		if (inputs.length) {
			result.push(RegExp(`^[./].*(${inputs.join('|')})`))
		}
	}
	if (addExternal) {
		if (Array.isArray(addExternal)) {
			result.push(...addExternal)
		} else {
			result.push(addExternal);
		}
	}
	return result;
}

function getByInput(input: string, externalByInput: ExternalByInput): ExternalOption | undefined {
	if (isFunction(externalByInput)) {
		return externalByInput(input);
	}
	return externalByInput[externalByInput];
}
