import * as fs from "node:fs";
import {FunctionPluginHooks, LoadResult, Plugin} from 'rollup'

export function rawPlugin(encoding: BufferEncoding = 'utf8'): Plugin {
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'raw-plugin',
		load(id: string): LoadResult {
			if (id.endsWith('?raw')) {
				const file = id.slice(0, -4);
				return `export default ${JSON.stringify(fs.readFileSync(file, encoding))};`;
			}
		}
	}
}

