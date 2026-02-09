import {PackageJson} from "type-fest";
import {readFileSync} from "node:fs";
import {IDetectedOption} from "../type";
import {ModuleFormat} from "rollup";

/**
 * 尝试根据package.json中的信息分析rollup配置
 * @returns 分析结果,如果未包含文件信息字段,则返回 `undefined`
 */
export function packageJsonToRollup(): IDetectedOption | undefined {
	const pkg: PackageJson = JSON.parse(readFileSync("package.json", "utf8"));

	// 收集所有文件路径
	const allPaths: string[] = [];

	// 收集 main、module、types、exports 中的路径
	if (pkg.main) {
		allPaths.push(pkg.main);
	}
	if (pkg.module) {
		allPaths.push(pkg.module);
	}
	if (pkg.types) {
		allPaths.push(pkg.types);
	}
	if (pkg.exports) {
		collectExportPaths(pkg.exports, allPaths);
	}

	// 如果没有任何文件路径信息，返回undefined
	if (allPaths.length === 0) {
		return undefined;
	}

	// 确定 types 值
	const hasTypes = pkg.types !== undefined || hasTypesInExports(pkg.exports);

	// 确定 formats 值
	const formats = determineFormats(pkg);

	// 确定 outputBase 和 outputCodeDir
	const {outputBase, outputCodeDir} = determineOutputDirs(allPaths);

	return {
		input: ["src/index.ts"], // 默认input，后续会被detectRollupOption的todo 2覆盖
		types: hasTypes,
		formats: formats as ModuleFormat,
		outputBase,
		outputCodeDir
	};
}

/**
 * 收集 exports 字段中的所有文件路径
 */
function collectExportPaths(exports: PackageJson["exports"], paths: string[]): void {
	if (typeof exports === "string") {
		paths.push(exports);
	} else if (exports && typeof exports === "object") {
		for (const key in exports) {
			const value = exports[key];
			if (typeof value === "string") {
				paths.push(value);
			} else if (value && typeof value === "object") {
				collectExportPaths(value, paths);
			}
		}
	}
}

/**
 * 检查 exports 字段中是否包含 types 定义
 */
function hasTypesInExports(exports: PackageJson["exports"]): boolean {
	if (typeof exports === "object" && exports !== null) {
		for (const key in exports) {
			const value = exports[key];
			if (key === "types" && typeof value === "string") {
				return true;
			}
			if (typeof value === "object" && value !== null) {
				if (hasTypesInExports(value)) {
					return true;
				}
			}
		}
	}
	return false;
}

/**
 * 根据 package.json 确定输出格式
 */
function determineFormats(pkg: PackageJson): string[] {
	const formats: string[] = [];

	if (pkg.main) {
		formats.push("cjs");
	}
	if (pkg.module) {
		formats.push("es");
	}
	if (pkg.exports) {
		const exportFormats = extractFormatsFromExports(pkg.exports);
		formats.push(...exportFormats);
	}

	// 如果没有确定的格式，使用默认格式
	if (formats.length === 0) {
		return ["cjs", "es"];
	}

	// 去重
	return [...new Set(formats)];
}

/**
 * 从 exports 字段中提取格式
 */
function extractFormatsFromExports(exports: PackageJson["exports"]): string[] {
	const formats: string[] = [];

	if (typeof exports === "object" && exports !== null) {
		for (const key in exports) {
			const value = exports[key];
			if (key === "require") {
				formats.push("cjs");
			} else if (key === "import") {
				formats.push("es");
			} else if (typeof value === "object" && value !== null) {
				const subFormats = extractFormatsFromExports(value);
				formats.push(...subFormats);
			}
		}
	}

	return formats;
}

/**
 * 确定 outputBase 和 outputCodeDir
 */
function determineOutputDirs(paths: string[]): { outputBase: string; outputCodeDir: string } {
	// 标准化路径，统一使用 / 分隔符
	const normalizedPaths = paths.map(path => path.replace(/\\/g, "/").replace(/^\.\//, ""));
	
	// 将路径分割为目录和文件名
	const pathParts = normalizedPaths.map(path => {
		const parts = path.split("/");
		return parts.slice(0, -1); // 移除文件名，只保留目录
	});

	// 如果路径只有文件名（没有目录），则无法确定输出目录
	if (pathParts.some(parts => parts.length === 0)) {
		return {outputBase: "", outputCodeDir: ""};
	}

	// 找到最长公共前缀目录
	const commonPrefix = findLongestCommonPrefix(pathParts);

	if (commonPrefix.length === 0) {
		// 当没有公共前缀目录时，尝试使用第一个路径的目录作为 outputCodeDir
		if (pathParts[0].length > 0) {
			return {outputBase: "", outputCodeDir: pathParts[0][0]};
		}
		return {outputBase: "", outputCodeDir: ""};
	}

	// 取第一个目录作为 outputBase
	const outputBase = commonPrefix[0];

	// 取剩下的目录作为 outputCodeDir
	const outputCodeDir = commonPrefix.slice(1).join("/");

	return {outputBase, outputCodeDir};
}

/**
 * 找到多个路径的最长公共前缀目录
 */
function findLongestCommonPrefix(paths: string[][]): string[] {
	if (paths.length === 0) {
		return [];
	}

	// 找到最短的路径长度
	const minLength = Math.min(...paths.map(p => p.length));

	if (minLength === 0) {
		return [];
	}

	let commonPrefix: string[] = [];

	// 逐目录比较
	for (let i = 0; i < minLength; i++) {
		const currentDir = paths[0][i];
		
		// 检查所有路径在当前位置是否有相同的目录
		if (paths.every(path => path[i] === currentDir)) {
			commonPrefix.push(currentDir);
		} else {
			break;
		}
	}

	return commonPrefix;
}
