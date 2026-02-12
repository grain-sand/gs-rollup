export type IImportReplaceFn = (modulePath: string, currentFile: string) => string

export type CodeModifyFn = (code: string, currentFile: string) => string

export interface IImportReplaceRole {
	search: RegExp
	replace: string | ((substring: string, ...args: any[]) => string)
	ensureExtension?: boolean
}

export type ImportReplaceRole = IImportReplaceRole[] | IImportReplaceFn

export interface IPostCodeModify<RT extends ImportReplaceRole = ImportReplaceRole> {
	importReplace?: RT
	codeModify?: CodeModifyFn
}

export type PostCodeModify = IPostCodeModify | ImportReplaceRole
