import {RollupOptions} from 'rollup'
import {defineDts, defineJs, importReplace} from './src';

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
		input,
		buildPackageJson: {
			deleteProps: /^(devDependencies|scripts)$/,
			overwriteProps: {
				bin: './bin/main.cjs'
			}
		}
	}),
	...defineJs({input}),
	...defineJs({
		input: 'src/main/index.ts',
		esbuild: {minify: true},
		outputCodeDir: 'bin',
		formats: ['cjs'],
		addExternal: /^[.\/].*\/(core|tools|plugins|type|dts)$/,
		addPlugins: [importReplace({
			search: /^(?:\.{2}\/)+/,
			replace: '../lib/',
			ensureExtension: true
		})],
	})
]

