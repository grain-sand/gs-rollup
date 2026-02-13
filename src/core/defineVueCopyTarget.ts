import {ICopyTarget, ICopyTransformFn, IVueCopyTargetOption, IVueTsToJsOption} from "../type";
import {vueTsToJs} from "../tools";

export function defineVueCopyTarget(src: string, option?: IVueCopyTargetOption): ICopyTarget {
	const {dest, rename} = option || {};
	return {
		src,
		dest,
		rename,
		transform: defineVueCopyTransform(option),
	}
}

export function defineVueCopyTransform(option?: IVueTsToJsOption): ICopyTransformFn {
	return (contents: Buffer, name: string) => {
		return vueTsToJs(`${contents}`, {...option, filename: name})
	}
}
