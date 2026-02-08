export type IImportReplaceFn = (modulePath: string, currentFile: string) => string

export interface IImportReplaceRole {
	search: RegExp
	replace: string | ((substring: string, ...args: any[]) => string)
	ensureExtension?: boolean
}

export type ImportReplaceRole = IImportReplaceRole | IImportReplaceRole[] | IImportReplaceFn
