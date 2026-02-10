export type CopyRenameFn = (name: string, extension: string, fullPath: string) => string;

export interface ICopyTarget {

	readonly src: string | readonly string[];

	readonly dest?: string | readonly string[];

	readonly rename?: string | CopyRenameFn;

	readonly transform?: (contents: Buffer, name: string) => any;
}
