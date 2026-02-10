import {InputOption, ModuleFormat} from "rollup";
import {IDetectedOption} from "../type";
import {packageJsonToRollup} from "./packageJsonToRollup";
import fs from "fs";
import path from "path";

const defaultInput: InputOption = ["src/index.ts"];

export function detectRollupOption(pattern?: string | RegExp, showRegex?: boolean): IDetectedOption {

	// 尝试根据package.json中的信息分析
	try {
		const option = packageJsonToRollup();
		if (option) {
			return option;
		}
	} catch {
	}

	// 尝试根据项目中所有匹配模式的文件分析,最多分析2级子目录（即加上根目录应为3级）
	try {

		const indexFiles: string[] = [];

		// 读取.gitignore文件
		const gitignorePatterns = readGitignore();

		// 定义要跳过的目录
		const skipDirs = ['node_modules', 'dist', 'lib', ...gitignorePatterns];

		// 处理文件匹配模式
		let filePattern: RegExp;
		if (typeof pattern === 'string') {
			// 支持字符串格式的正则表达式，如 '/index\.ts$/i'
			if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
				const regexParts = pattern.match(/^\/(.*)\/([gimuy]*)$/);
				if (regexParts) {
					const [, regexPattern, flags] = regexParts;
					filePattern = new RegExp(regexPattern, flags);
				} else {
					filePattern = new RegExp(pattern);
				}
			} else {
				filePattern = new RegExp(pattern);
			}
		} else {
			filePattern = pattern || /index\.ts$/;
		}

		if (showRegex) {
			console.log(`Use pattern: \x1b[1;34m${filePattern}\x1b[0m scan directory .`);
		}

		// 递归扫描目录，遍历所有符合规则的目录
		scanDirectory('.', indexFiles, skipDirs, filePattern);

		// 如果找到匹配模式的文件，使用这些文件作为input
		if (indexFiles.length > 0) {
			return {
				input: indexFiles,
				types: true,
				formats: ['cjs', 'es'] as ModuleFormat,
				outputBase: 'dist',
				outputCodeDir: 'lib'
			};
		}
	} catch {
	}

	// 默认配置
	return {
		input: defaultInput,
		types: true,
		formats: ['cjs', 'es'] as ModuleFormat,
		outputBase: 'dist',
		outputCodeDir: 'lib'
	};
}

/**
 * 读取.gitignore文件并返回要忽略的目录和文件模式
 */
function readGitignore(): string[] {
	try {
		if (fs.existsSync('.gitignore')) {
			const content = fs.readFileSync('.gitignore', 'utf8');
			return content
				.split('\n')
				.filter(line => line.trim() && !line.startsWith('#'))
				.map(line => line.trim().replace(/\\/g, '/'));
		}
	} catch {
	}
	return [];
}

/**
 * 递归扫描目录中的匹配文件
 */
function scanDirectory(dir: string, indexFiles: string[], skipDirs: string[], pattern: RegExp): void {
	const files = fs.readdirSync(dir);

	for (const file of files) {
		const filePath = path.join(dir, file);
		const stat = fs.statSync(filePath);

		// 标准化路径用于比较
		const normalizedPath = filePath.replace(/\\/g, '/');

		if (stat.isFile() && pattern.test(normalizedPath)) {
			// 如果文件匹配模式，添加到结果中
			indexFiles.push(normalizedPath);
		} else if (stat.isDirectory()) {
			// 检查是否需要跳过该目录
			// 1. 跳过隐藏目录（以 . 开始）
			// 2. 跳过测试目录
			// 3. 检查 .gitignore 中的忽略规则
			const isHiddenDir = file.startsWith('.');
			const isTestDir = file === 'test' || file === 'tests';
			const shouldSkip = isHiddenDir || isTestDir || skipDirs.some(skipPattern => {
				// 简单的模式匹配，支持目录匹配
				if (skipPattern.endsWith('/')) {
					return normalizedPath === skipPattern.slice(0, -1) || normalizedPath.startsWith(skipPattern);
				}
				return normalizedPath === skipPattern;
			});
			if (!shouldSkip) {
				// 递归扫描子目录
				scanDirectory(filePath, indexFiles, skipDirs, pattern);
			}
		}
	}
}
