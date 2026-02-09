import {PackageJson} from "type-fest";
import {readFileSync} from "node:fs";
import {IDetectedOption} from "../type";

/**
 * 尝试根据package.json中的信息分析rollup配置
 * @returns 分析结果,如果未包含文件信息字段,则返回 `undefined`
 */
export function packageJsonToRollup(): IDetectedOption | undefined {
	const pkg: PackageJson = JSON.parse(readFileSync("package.json", "utf8"));
	// todo 1 收集 package.json 中的所有文件定义信息
	// todo 2 确定 outputBase
	// todo 3 确定 outputCodeDir
	// todo 4 确定 formats
	// todo 5 确定 types
	// todo 6 确定 input
	return
}
