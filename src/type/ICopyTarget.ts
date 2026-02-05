export interface ICopyTarget {

	readonly src: string | readonly string[];

	readonly dest: string | readonly string[];

	readonly rename?: string | ((name: string, extension: string, fullPath: string) => string);

	readonly transform?: (contents: Buffer, name: string) => any;
}
