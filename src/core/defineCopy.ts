import copy from "rollup-plugin-copy";
import {ICopyTarget} from "../type";
import {isObject} from "gs-base";
import {Plugin} from 'rollup'
import {GsRollupDefaults} from "../tools";

export function defineCopy(src: string | string[], dest?: string): Plugin
export function defineCopy(targets: ICopyTarget[], dest?: string): Plugin
export function defineCopy(srcOrTargets: any, dest: string = GsRollupDefaults.outputBase): Plugin {
	if (Array.isArray(srcOrTargets) && srcOrTargets.length && isObject(srcOrTargets[0])) {
		copy({
			targets: srcOrTargets.map((item: ICopyTarget) => ({...item, dest: item.dest || dest}))
		})
	}
	return copy({targets: [{src: srcOrTargets, dest}]})
}
