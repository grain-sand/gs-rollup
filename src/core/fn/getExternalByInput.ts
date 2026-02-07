import {ExternalByInput, IDefineDtsArg} from "../../type";
import {ExternalOption} from "rollup";
import {DefaultValues} from "../DefaultValues";
import {isFunction} from "gs-base";

export function getExternalByInput(currInput: string, inputEntries: [string, string][], arg?: IDefineDtsArg): ExternalOption | undefined {
	const {
		external = DefaultValues.external,
		externalByInput
	} = arg || {};
	if (externalByInput) {
		const ex = getByInput(currInput, externalByInput)
		if (ex) {
			return ex;
		}
	}
	if (inputEntries.length < 2) {
		return external;
	}
	const inputs = inputEntries
		.map(([, i]) => i)
		.filter(i => i !== currInput)
		.map(i => i.replace(/^src[\\/]|(?:[\\/]?index)?\.[tj]s$/g, ''))
		.filter(Boolean)
	if (!inputs.length) {
		return external;
	}
	const regex = new RegExp(`^[./].*(${inputs.join('|')})`);
	if (Array.isArray(external)) {
		return [...external, regex]
	}
	if (external) {
		return [external as any, regex]
	}
	return regex;
}

function getByInput(input: string, externalByInput: ExternalByInput): ExternalOption | undefined {
	if (isFunction(externalByInput)) {
		return externalByInput(input);
	}
	return externalByInput[externalByInput];
}
