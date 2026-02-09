import {readFileSync} from "node:fs";
import {PackageJson} from "type-fest";
import {InputOption, ModuleFormat} from "rollup";

export interface IDetectedOption {
	/**
	 * 仅包含 `string[]` 与 `Record<string,string>` 类型
	 * - 分析值逻辑,前一项无结果时使用后一项
	 *  1. 根据 `package.json` 中的 `file` `main` 、`exports` 、`types` 、排除 `outputBase`,`outputCodeDir` 的后续路径确定，值类型为 `Record<string,string>`
	 *  2. 上一项不存在时，查找 项目中所有 `index.ts` 文件, 值类型为 `string[]`
	 *  3. 以上都不存在时,默认值为 `["src/index.ts"]`
	 */
	input: InputOption;

	/**
	 * 默认为 `true`
	 * - 仅在 `package.json` 中
	 *  1. `exports` 中存在js定义，但不存在 `types` 时为 `false`
	 *  2. 存在 `main` 但不存在 `types` 时为 `false`
	 */
	types: boolean

	/**
	 * 根据 `package.json` 中的 `main` 与 `exports` 确定输入文件
	 * - 默认值为 `['cjs','es']`
	 */
	formats: ModuleFormat

	/**
	 * 根据 `package.json` 中的 `file` `main` 、`exports` 、`types` 的完全相同的第一个目录
	 * - 如果所有前缀皆不同 则值为 空字符串
	 * - 如果未存在定义，默认值 为 `dist`
	 */
	outputBase: string

	/**
	 * 根据 `package.json` 中的 `file` `main` 、`exports` 、`types` 的完全相同的第二个起的后续目录确定
	 * - 如果所有前缀皆不同 则值为 空字符串
	 * - 如果未存在定义，默认值 为 `lib`
	 */
	outputCodeDir: string

}

export function detectRollupOption(): IDetectedOption {

	try {
		const pkg: PackageJson = JSON.parse(readFileSync("package.json", "utf8"));

		if (pkg.exports) {
			return parseExports(pkg.exports, pkg);
		}

		// 如果没有 exports，使用 main 和 types 来确定配置
		const input = getDefaultInput();
		const types = shouldGenerateTypes(pkg);
		const formats = getFormatsFromPackageJson(pkg);
		const outputPaths = getOutputPathsFromPackageJson(pkg);

		return {
			input,
			types,
			formats,
			outputBase: outputPaths.outputBase,
			outputCodeDir: outputPaths.outputCodeDir
		};
	} catch {
		// 默认配置
		return {
			input: getDefaultInput(),
			types: true,
			formats: ['cjs', 'es'] as ModuleFormat,
			outputBase: 'dist',
			outputCodeDir: 'lib'
		};
	}
}

function parseExports(exports: PackageJson['exports'], pkg: PackageJson): IDetectedOption {
	const input = getDefaultInput();
	const types = shouldGenerateTypes(pkg);
	const formats = getFormatsFromPackageJson(pkg);
	const outputPaths = getOutputPathsFromPackageJson(pkg);

	return {
		input,
		types,
		formats,
		outputBase: outputPaths.outputBase,
		outputCodeDir: outputPaths.outputCodeDir
	};
}

/**
 * 获取默认输入文件路径
 */
function getDefaultInput(): InputOption {
	return ["src/index.ts"];
}

/**
 * 判断是否需要生成类型文件
 */
function shouldGenerateTypes(pkg: PackageJson): boolean {
	// 检查是否有 main 但没有 types
	if (pkg.main && !pkg.types) {
		return false;
	}

	// 检查 exports
	if (pkg.exports) {
		// 字符串形式的 exports
		if (typeof pkg.exports === 'string') {
			// 如果是字符串形式的 exports 且没有 types 字段，返回 false
			return !!pkg.types;
		}
		// 对象形式的 exports
		if (typeof pkg.exports === 'object') {
			for (const [key, value] of Object.entries(pkg.exports)) {
				if (typeof value === 'object' && value !== null && 'import' in value && 'types' in value) {
					continue;
				}
				// 如果找到一个没有 types 的 js 定义，返回 false
				if (key.endsWith('.js') || (typeof value === 'object' && value !== null && ('import' in value || 'require' in value))) {
					return false;
				}
			}
		}
	}

	return true;
}

/**
 * 从 package.json 中获取输出格式
 */
function getFormatsFromPackageJson(pkg: PackageJson): ModuleFormat {
	const formats: ModuleFormat[] = [];

	if (pkg.main) {
		formats.push('cjs');
	}

	if (pkg.module) {
		formats.push('es');
	}

	// 检查 exports
	if (pkg.exports) {
		if (typeof pkg.exports === 'object') {
			for (const [key, value] of Object.entries(pkg.exports)) {
				if (key === 'import' || (typeof value === 'object' && value !== null && 'import' in value)) {
					if (!formats.includes('es')) {
						formats.push('es');
					}
				}
				if (key === 'require' || (typeof value === 'object' && value !== null && 'require' in value)) {
					if (!formats.includes('cjs')) {
						formats.push('cjs');
					}
				}
			}
		}
	}

	// 默认返回 ['cjs', 'es']
	return (formats.length > 0 ? formats : ['cjs', 'es']) as ModuleFormat;
}

/**
 * 从 package.json 中获取输出路径
 */
function getOutputPathsFromPackageJson(pkg: PackageJson): { outputBase: string; outputCodeDir: string } {
	const paths: string[] = [];

	// 收集所有输出路径
	if (pkg.main) {
		paths.push(pkg.main);
	}

	if (pkg.module) {
		paths.push(pkg.module);
	}

	if (pkg.types) {
		paths.push(pkg.types);
	}

	if (pkg.bin) {
		if (typeof pkg.bin === 'string') {
			paths.push(pkg.bin);
		} else {
			for (const binPath of Object.values(pkg.bin)) {
				paths.push(binPath);
			}
		}
	}

	// 检查 exports
	if (pkg.exports) {
		collectExportsPaths(pkg.exports, paths);
	}

	if (paths.length === 0) {
		return {outputBase: 'dist', outputCodeDir: 'lib'};
	}

	/**
	 * 找到最长公共前缀目录，统一处理 Windows 和 Unix 风格的路径，移除 ./ 前缀
	 */
	const dirs = paths.map(path =>
		path
			.replace(/\\/g, '/')    // 统一路径分隔符
			.replace(/^\.\//, '')    // 移除 ./ 前缀
			.split('/')
			.slice(0, -1)
			.join('/')
	).filter(Boolean);
	if (dirs.length === 0) {
		return {outputBase: '', outputCodeDir: 'lib'};
	}

	// 找到最长公共前缀
	const commonPrefix = dirs.reduce((prev, curr) => {
		const prevParts = prev.split('/');
		const currParts = curr.split('/');
		const minLength = Math.min(prevParts.length, currParts.length);
		let commonParts: string[] = [];

		for (let i = 0; i < minLength; i++) {
			if (prevParts[i] === currParts[i]) {
				commonParts.push(prevParts[i]);
			} else {
				break;
			}
		}

		return commonParts.join('/');
	});

	// 确定 outputCodeDir
	if (commonPrefix === '') {
		return {outputBase: '', outputCodeDir: 'lib'};
	}

	// 从 commonPrefix 中提取 outputBase 和 outputCodeDir
	const parts = commonPrefix.split('/');
	if (parts.length <= 1) {
		return {outputBase: commonPrefix, outputCodeDir: parts.length === 1 ? '' : 'lib'};
	}

	return {outputBase: parts[0], outputCodeDir: parts.slice(1).join('/') || 'lib'};
}

/**
 * 递归收集 exports 中的所有路径
 */
function collectExportsPaths(exports: PackageJson['exports'], paths: string[]): void {
	if (typeof exports === 'string') {
		paths.push(exports);
	} else if (Array.isArray(exports)) {
		for (const exp of exports) {
			collectExportsPaths(exp, paths);
		}
	} else if (typeof exports === 'object' && exports !== null) {
		for (const value of Object.values(exports)) {
			collectExportsPaths(value, paths);
		}
	}
}
