export type CopyRenameFn = (name: string, extension: string, fullPath: string) => string;

export type ICopyTransformFn = (contents: Buffer, name: string) => Buffer | string;

export interface ICopyTarget {

	readonly src: string | readonly string[];

	readonly dest?: string | readonly string[];

	readonly rename?: string | CopyRenameFn;

	readonly transform?: ICopyTransformFn;
}
