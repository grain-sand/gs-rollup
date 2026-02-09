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
