import {defineJs, GsRollupDefaults} from "../../src";

GsRollupDefaults.external = []
GsRollupDefaults.outputBase = 'tmp'
GsRollupDefaults.outputCodeDir = 'scss'

const input = [
	'test/files/vue/index.ts',
]

export default {
	...defineJs({input})
}
