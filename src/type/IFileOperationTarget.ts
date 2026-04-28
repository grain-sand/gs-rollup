export interface IFileOperationTarget {

	src: string | string[];

	dest?: string | string[];

	rename?: (fullPath: string) => string;

	transform?: (code: string, file: string) => any;

}

export interface IFileOperationValidTarget extends Omit<IFileOperationTarget, 'src' | 'dest'> {

	src: string[];

	dest: string[];
}

export type FileOperationTarget = string | IFileOperationTarget;
export type FileOperationOption = FileOperationTarget | FileOperationTarget[];
