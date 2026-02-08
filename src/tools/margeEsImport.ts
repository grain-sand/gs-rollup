// 主函数：合并ES模块导入语句
export function margeEsImport(code: string): string {
	// 检查是否是单行代码（minified）
	if (!code.includes('\n')) {
		return processSingleLine(code);
	}

	// 将代码按行分割
	const lines = code.split('\n');
	const resultLines: string[] = [];

	// 按模块路径分组的导入信息
	const moduleImports = new Map<string, {
		defaultImports: string[];
		namedImports: string[];
		namespaceImport: string | undefined;
		isProcessed: boolean;
	}>();

	// 第一遍：收集导入语句信息
	for (const line of lines) {
		const trimmedLine = line.trim();
		if (!trimmedLine.startsWith('import ')) {
			continue;
		}

		// 解析导入语句
		const importInfo = parseImportStatement(line);
		if (!importInfo) {
			// 如果解析失败，跳过该行
			continue;
		}

		const { modulePath, type, name, namedImports } = importInfo;

		// 初始化模块导入信息
		if (!moduleImports.has(modulePath)) {
			moduleImports.set(modulePath, {
				defaultImports: [],
				namedImports: [],
				namespaceImport: undefined,
				isProcessed: false
			});
		}

		const moduleInfo = moduleImports.get(modulePath)!;

		// 根据导入类型添加到对应的数组
		if (type === 'default') {
			moduleInfo.defaultImports.push(name);
		} else if (type === 'named') {
			moduleInfo.namedImports.push(...namedImports);
		} else if (type === 'namespace') {
			moduleInfo.namespaceImport = name;
		}
	}

	// 第二遍：构建结果，处理导入语句和非导入语句
	let inImportBlock = false;
	const processedModules = new Set<string>();

	for (const line of lines) {
		const trimmedLine = line.trim();

		// 检查是否是导入语句
		if (trimmedLine.startsWith('import ')) {
			const importInfo = parseImportStatement(line);
			if (!importInfo) {
				// 解析失败的导入语句，直接保留
				resultLines.push(line);
				continue;
			}

			const { modulePath } = importInfo;
			const moduleInfo = moduleImports.get(modulePath)!;

			// 如果这个模块的导入还没有处理过
			if (!processedModules.has(modulePath)) {
				// 生成合并后的导入语句
				const mergedImport = generateMergedImport(modulePath, moduleInfo);
				if (mergedImport) {
					resultLines.push(...mergedImport.split('\n'));
				}
				processedModules.add(modulePath);
			}

			inImportBlock = true;
		} else {
			// 非导入语句
			resultLines.push(line);
			inImportBlock = false;
		}
	}

	// 重建代码字符串，确保每行末尾的换行符正确
	return resultLines.join('\n');
}

// 解析导入语句
function parseImportStatement(line: string): {
	modulePath: string;
	type: 'default' | 'named' | 'namespace';
	name: string;
	namedImports?: string[];
} | null {
	// 跳过模板字符串中的导入语句
	if (line.includes('`')) {
		return null;
	}

	// 匹配命名空间导入
	const namespaceRegex = /^\s*import\s+\*\s+as\s+([\w$]+)\s+from\s+(['"])([^'"]+)\2\s*;?\s*$/;
	const namespaceMatch = namespaceRegex.exec(line);
	if (namespaceMatch) {
		return {
			modulePath: namespaceMatch[3],
			type: 'namespace',
			name: `* as ${namespaceMatch[1]}` // 保留完整的命名空间导入语法
		};
	}

	// 匹配默认导入 + 命名导入
	const defaultAndNamedRegex = /^\s*import\s+([\w$]+)\s*,\s*\{([^}]*)}\s+from\s+(['"])([^'"]+)\3\s*;?\s*$/;
	const defaultAndNamedMatch = defaultAndNamedRegex.exec(line);
	if (defaultAndNamedMatch) {
		const namedImports = defaultAndNamedMatch[2].split(',')
			.map(name => name.trim())
			.filter(Boolean);
		return {
			modulePath: defaultAndNamedMatch[4],
			type: 'named',
			name: defaultAndNamedMatch[1],
			namedImports
		};
	}

	// 匹配仅命名导入
	const namedOnlyRegex = /^\s*import\s*\{([^}]*)}\s+from\s+(['"])([^'"]+)\2\s*;?\s*$/;
	const namedOnlyMatch = namedOnlyRegex.exec(line);
	if (namedOnlyMatch) {
		const namedImports = namedOnlyMatch[1].split(',')
			.map(name => name.trim())
			.filter(Boolean);
		return {
			modulePath: namedOnlyMatch[3],
			type: 'named',
			name: '',
			namedImports
		};
	}

	// 匹配仅默认导入
	const defaultOnlyRegex = /^\s*import\s+([\w$]+)\s+from\s+(['"])([^'"]+)\2\s*;?\s*$/;
	const defaultOnlyMatch = defaultOnlyRegex.exec(line);
	if (defaultOnlyMatch) {
		return {
			modulePath: defaultOnlyMatch[3],
			type: 'default',
			name: defaultOnlyMatch[1]
		};
	}

	return null;
}

// 生成合并后的导入语句
function generateMergedImport(modulePath: string, info: {
	defaultImports: string[];
	namedImports: string[];
	namespaceImport: string | undefined;
	isProcessed: boolean;
}): string {
	// 如果有命名空间导入，直接返回该导入语句
	if (info.namespaceImport) {
		return `import ${info.namespaceImport} from '${modulePath}';`;
	}

	let result = '';
	const importParts: string[] = [];

	// 添加默认导入（只保留第一个）
	if (info.defaultImports.length > 0) {
		importParts.push(info.defaultImports[0]);
	}

	// 添加命名导入
	if (info.namedImports.length > 0) {
		importParts.push(`{ ${info.namedImports.join(', ')} }`);
	}

	// 生成合并后的导入语句
	if (importParts.length > 0) {
		result = `import ${importParts.join(', ')} from '${modulePath}';`;
	}

	// 如果有多个默认导入，添加额外的导入语句
	for (let i = 1; i < info.defaultImports.length; i++) {
		result += `\nimport ${info.defaultImports[i]} from '${modulePath}';`;
	}

	return result;
}

// 处理单行中的多个导入语句（minified code）
function processSingleLine(code: string): string {
	// 查找所有导入语句的位置
	const importRegex = /import\s+(?:\*\s+as\s+[\w$]+|[\w$]+|\{[^}]*})\s+from\s+(['"])([^'"]+)\1\s*;?/g;
	const importMatches: Array<{start: number; end: number; stmt: string}> = [];

	let match;
	while ((match = importRegex.exec(code)) !== null) {
		importMatches.push({
			start: match.index,
			end: match.index + match[0].length,
			stmt: match[0]
		});
	}

	if (importMatches.length === 0) {
		return code;
	}

	// 按模块路径分组的导入信息
	const moduleImports = new Map<string, {
		defaultImports: string[];
		namedImports: string[];
		namespaceImport: string | undefined;
	}>();

	// 解析所有导入语句
	for (const { stmt } of importMatches) {
		const importInfo = parseImportStatement(stmt);
		if (!importInfo) {
			continue;
		}

		const { modulePath, type, name, namedImports } = importInfo;

		// 初始化模块导入信息
		if (!moduleImports.has(modulePath)) {
			moduleImports.set(modulePath, {
				defaultImports: [],
				namedImports: [],
				namespaceImport: undefined
			});
		}

		const moduleInfo = moduleImports.get(modulePath)!;

		// 根据导入类型添加到对应的数组
		if (type === 'default') {
			moduleInfo.defaultImports.push(name);
		} else if (type === 'named') {
			if (name) {
				moduleInfo.defaultImports.push(name);
			}
			if (namedImports) {
				moduleInfo.namedImports.push(...namedImports);
			}
		} else if (type === 'namespace') {
			moduleInfo.namespaceImport = name;
		}
	}

	// 构建结果字符串
	let result = '';

	// 按出现顺序处理导入模块
	const processedModules = new Set<string>();

	// 先添加导入语句前的内容
	if (importMatches.length > 0) {
		result += code.slice(0, importMatches[0].start);
	}

	// 处理导入语句
	for (const { stmt } of importMatches) {
		// 解析当前导入语句以获取模块路径
		const importInfo = parseImportStatement(stmt);
		if (!importInfo) {
			// 如果解析失败，直接添加该语句
			result += stmt;
			continue;
		}

		const { modulePath } = importInfo;

		// 如果这个模块的导入还没有处理过
		if (!processedModules.has(modulePath)) {
			// 生成合并后的导入语句
			const moduleInfo = moduleImports.get(modulePath)!;
			const mergedImport = generateMergedImport(modulePath, {
				...moduleInfo,
				isProcessed: false
			});

			if (mergedImport) {
				result += mergedImport;
			}
			processedModules.add(modulePath);
		}
	}

	// 添加导入语句后的内容
	if (importMatches.length > 0) {
		const lastImport = importMatches[importMatches.length - 1];
		result += code.slice(lastImport.end);
	}

	return result;
}
