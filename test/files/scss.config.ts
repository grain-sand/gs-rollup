import {defineJs, GsRollupDefaults, scssCompile} from "../../src";

GsRollupDefaults.external = []
GsRollupDefaults.outputBase = 'tmp'
GsRollupDefaults.outputCodeDir = 'scss'

const input = [
	'test/files/scss/index.ts',
]

export default defineJs({
	input,
	addPlugins: [
		scssCompile({
			src: 'test/files/scss/index.scss',
			dest: 'style.css',
		})
	],
})
