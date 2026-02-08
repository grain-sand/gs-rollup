export function margeEsImport(code: string): string {
  // 正则表达式匹配 ES 导入语句，修复冒号路径截断问题
  const importRegex = /^\s*import\s+([\s\S]*?)\s+from\s+(['"])(.+?)\2\s*;?\s*$/gm;
  
  // 存储导入信息的映射，key 为模块路径，value 为对象包含所有导入类型
  const importMap = new Map<string, { 
    defaultImports: { name: string; lineIndex: number }[];
    namedImports: Set<string>;
    namespaceImports: { name: string; lineIndex: number }[];
    allImportLines: Set<number>;
  }>();
  
  // 存储所有行，包括空行
  const allLines = code.split('\n');
  
  // 第一步：收集所有导入信息并记录导入行的位置
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    // 重置正则表达式的 lastIndex
    importRegex.lastIndex = 0;
    // 尝试匹配导入语句
    const match = importRegex.exec(line);
    if (match) {
      const [, importContent, , modulePath] = match;
      
      // 获取或创建模块的导入信息
      if (!importMap.has(modulePath)) {
        importMap.set(modulePath, {
          defaultImports: [],
          namedImports: new Set<string>(),
          namespaceImports: [],
          allImportLines: new Set<number>()
        });
      }
      
      const moduleInfo = importMap.get(modulePath)!;
      // 记录所有导入行
      moduleInfo.allImportLines.add(i);
      
      // 解析导入内容
      if (importContent.startsWith('* as ')) {
        // 命名空间导入
        const namespaceName = importContent.slice(5).trim();
        moduleInfo.namespaceImports.push({ name: namespaceName, lineIndex: i });
      } else if (importContent.startsWith('{')) {
        // 只有命名导入
        const namedParts = importContent.slice(1, -1).split(',');
        namedParts.forEach(part => {
          const trimmedPart = part.trim();
          if (trimmedPart) {
            moduleInfo.namedImports.add(trimmedPart);
          }
        });
      } else if (importContent.includes(',')) {
        // 默认导入 + 命名导入
        const parts = importContent.split(',');
        const defaultImport = parts[0].trim();
        moduleInfo.defaultImports.push({ name: defaultImport, lineIndex: i });
        
        if (parts.length > 1) {
          const namedPart = parts[1].trim();
          if (namedPart.startsWith('{')) {
            const namedParts = namedPart.slice(1, -1).split(',');
            namedParts.forEach(part => {
              const trimmedPart = part.trim();
              if (trimmedPart) {
                moduleInfo.namedImports.add(trimmedPart);
              }
            });
          }
        }
      } else {
        // 只有默认导入
        moduleInfo.defaultImports.push({ name: importContent.trim(), lineIndex: i });
      }
    }
  }
  
  // 第二步：生成合并后的导入语句并记录需要保留的行
  const linesToKeep = new Map<number, string>();
  const linesToRemove = new Set<number>();
  
  for (const [modulePath, moduleInfo] of importMap.entries()) {
    // 收集所有导入行
    const importLines = Array.from(moduleInfo.allImportLines).sort((a, b) => a - b);
    
    if (importLines.length === 0) continue;
    
    // 检查是否有命名空间导入
    if (moduleInfo.namespaceImports.length > 0) {
      // 对于命名空间导入，保留所有命名空间导入行，并移除其他导入行
      for (const imp of moduleInfo.namespaceImports) {
        // 保留命名空间导入行
        linesToKeep.set(imp.lineIndex, `import * as ${imp.name} from '${modulePath}';`);
      }
      
      // 移除所有非命名空间导入行
      for (const lineIndex of importLines) {
        const isNamespaceImport = moduleInfo.namespaceImports.some(imp => imp.lineIndex === lineIndex);
        if (!isNamespaceImport) {
          linesToRemove.add(lineIndex);
        }
      }
    } 
    // 检查是否有多个不同名称的默认导入
    else if (moduleInfo.defaultImports.length > 1) {
      // 保留所有默认导入行，但只将命名导入添加到第一个默认导入中
      const namedImportsStr = Array.from(moduleInfo.namedImports).join(', ');
      
      // 为第一个默认导入行生成合并后的语句
      const firstDefaultImport = moduleInfo.defaultImports[0];
      let firstImportStmt = `import ${firstDefaultImport.name}`;
      
      if (moduleInfo.namedImports.size > 0) {
        firstImportStmt += `, { ${namedImportsStr} }`;
      }
      
      firstImportStmt += ` from '${modulePath}';`;
      linesToKeep.set(firstDefaultImport.lineIndex, firstImportStmt);
      
      // 为其他默认导入行生成简单的导入语句（不包含命名导入）
      for (let i = 1; i < moduleInfo.defaultImports.length; i++) {
        const imp = moduleInfo.defaultImports[i];
        const importStmt = `import ${imp.name} from '${modulePath}';`;
        linesToKeep.set(imp.lineIndex, importStmt);
      }
      
      // 移除所有非默认导入行
      for (const lineIndex of importLines) {
        const isDefaultImport = moduleInfo.defaultImports.some(imp => imp.lineIndex === lineIndex);
        if (!isDefaultImport) {
          linesToRemove.add(lineIndex);
        }
      }
    }
    // 普通情况，合并所有导入到第一行
    else {
      // 保留第一行作为基础，其他行标记为删除
      const firstLineIndex = importLines[0];
      for (let i = 1; i < importLines.length; i++) {
        linesToRemove.add(importLines[i]);
      }
      
      // 构建合并后的导入语句
      let importStmt = 'import ';
      const parts: string[] = [];
      
      // 添加默认导入（保留所有不同的默认导入）
      if (moduleInfo.defaultImports.length > 0) {
        parts.push(...moduleInfo.defaultImports.map(imp => imp.name));
      }
      
      // 添加命名导入
      if (moduleInfo.namedImports.size > 0) {
        const namedImportsStr = Array.from(moduleInfo.namedImports).join(', ');
        parts.push(`{ ${namedImportsStr} }`);
      }
      
      // 合并所有部分
      importStmt += parts.join(', ');
      importStmt += ` from '${modulePath}';`;
      
      // 记录要保留的行
      linesToKeep.set(firstLineIndex, importStmt);
    }
  }
  
  // 第三步：构建最终结果
  const result: string[] = [];
  
  for (let i = 0; i < allLines.length; i++) {
    // 如果该行需要删除，则跳过
    if (linesToRemove.has(i)) {
      continue;
    }
    
    // 如果该行是导入行且有合并后的语句，则使用合并后的语句
    if (linesToKeep.has(i)) {
      result.push(linesToKeep.get(i)!);
    } else {
      // 否则使用原始行
      result.push(allLines[i]);
    }
  }
  
  // 合并所有行并返回
  return result.join('\n');
}
