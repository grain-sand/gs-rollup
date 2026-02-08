export interface IConfigToJsonContext {
	name: string
	file: string
}

export type ConfigToJsonTransform = (data: any, ctx: IConfigToJsonContext) => any | Promise<any>

export interface IConfigToJsonArg {
	transform?: ConfigToJsonTransform;
	minify?: boolean;
}
