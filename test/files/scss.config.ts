import {defineJs, GsRollupDefaults} from "../../src";

GsRollupDefaults.external = []
GsRollupDefaults.outputBase = 'tmp'
GsRollupDefaults.outputCodeDir = 'scss'

const input = [
	'test/files/scss/index.ts',
]

const scssConfig = defineJs({input})

// console.log(JSON.stringify(scssConfig,null,2))

export default scssConfig
