import {IDefineOutputArg} from "../type";
import {OutputOptions} from "rollup";
import {isString} from "gs-base";
import {DefaultValues} from "./DefaultValues";

export function defineOutput(format: OutputOptions['format']): any;
export function defineOutput(arg: IDefineOutputArg): any;
export function defineOutput(arg: any): any {
	arg = isString(arg) ? {format: arg} : arg
	const {format}: IDefineOutputArg = arg;
	const file = arg.file || defineFile(arg);

}

function defineFile(arg: IDefineOutputArg) {
	const {format, dir, input = DefaultValues.input}: IDefineOutputArg = arg;

}
