import {PostCodeModify} from "./IPostCodeModify";
import {SFCDescriptor} from "@vue/compiler-sfc";

export type VueTsToJsCompileMode = 'vue' | 'esbuild'

export interface IVueCode extends Pick<SFCDescriptor, 'template' | 'script' | 'styles'> {
}

export interface IVueTsToJsOption {

	filename?: string

	compile?: VueTsToJsCompileMode

	/**
	 * 如果设置了 `compile`, 将在 `compile` 之后执行
	 */
	scriptCodeModify?: PostCodeModify

	/**
	 * 最后执行
	 */
	vueCodeModify?: (code: IVueCode) => IVueCode
}
