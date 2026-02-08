import {RollupOptions} from 'rollup'
import {defineJs, defineDts, importReplace} from './src';
import {logJson} from "gs-base";

const input = [
	'src/index.ts',
	'src/dts/index.ts',
	'src/type/index.ts',
	'src/plugins/index.ts',
	'src/core/index.ts',
	'src/tools/index.ts',
]

export default <RollupOptions[]>[
	...defineDts({
		input, buildPackageJson: {
			overwriteProps: {
				keywords: ['grain-sand', 'gs-rollup', 'rollup', '@types/rollup', '打包工具', 'build tool'],
				homepage: 'https://github.com/grain-sand/gs-rollup',
				repository: {
					type: 'git',
					url: 'https://github.com/grain-sand/gs-rollup.git'
				}
			},
			author: "grain-sand",
			license: "MIT",
			bin: {
				'gs-rollup': 'dist/bin/main'
			}
		}
	}),
	...defineJs({input}),
	...defineJs({
		input: {
			'gs-rollup': 'src/main/index.ts'
		},
		esbuild: {minify: true},
		outputCodeDir: 'bin',
		formats: [{
			format: 'cjs',
			extension: ''
		}],
		addExternal: /^[.\/].*\/(core|tools|plugins|type|dts)$/,
		addPlugins: [importReplace({
			search: /^(\.{2}\/)+/,
			replace: '../lib/'
		})],
	})
]

