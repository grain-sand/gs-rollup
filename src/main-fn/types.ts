export type GeneratedConfig = {
	rollup: (import('rollup').RollupOptions & any)[]
	meta: {
		tsConfig: any
		esbuildOpts: any
		copyTargets: any
	}
}
