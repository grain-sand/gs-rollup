import * as fs from "node:fs";
import {FunctionPluginHooks, LoadResult, Plugin} from 'rollup'

const defaultRawPattern = /(\?raw|\.te?xt)$/;

export interface IRawLoaderArg {
	/**
	 * 匹配的文件模式
	 * - 默认匹配?raw和.txt文件
	 */
	pattern?: RegExp

	/**
	 * 编码方式
	 * - 默认utf8
	 **/
	encoding?: BufferEncoding
}

export function rawLoader(arg?: IRawLoaderArg): Plugin {
	const {pattern = defaultRawPattern, encoding = 'utf8'}: IRawLoaderArg = arg || {};
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'raw-loader',
		load(id: string): LoadResult {
			if (pattern.test(id)) {
				const file = id.replace(/\?\w{1,5}$/, '');
				return `export default ${JSON.stringify(fs.readFileSync(file, encoding))};`;
			}
		}
	}
}

