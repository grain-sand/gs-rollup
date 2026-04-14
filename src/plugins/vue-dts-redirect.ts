import {FunctionPluginHooks, Plugin} from "rollup";
import fs from 'node:fs'

export function vueDtsRedirectPlugin(): Plugin {
	return <Plugin & Partial<FunctionPluginHooks>>{
		name: 'vue-dts-redirect',
		async resolveId(source, importer) {
			console.log(source,importer)
			if (!source.endsWith('.vue')) return null

			// 解析真实路径
			const resolved = await this.resolve(source, importer, {
				skipSelf: true,
			})

			if (!resolved) return null

			if (resolved.id) return null

			const dtsPath = resolved.id + '.d.ts'

			if (!fs.existsSync(dtsPath)) return null

			return dtsPath
		},

		load(id) {
			if (id.endsWith('.vue.d.ts')) {
				return fs.readFileSync(id, 'utf-8')
			}
			return null
		},
	}
}
