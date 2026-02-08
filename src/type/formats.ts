export const esFormats = ['es', 'esm', 'module'] as const

export const cjsFormats = ['cjs', 'commonjs'] as const

export type EsFormat = typeof esFormats[number]

export type CjsFormat = typeof cjsFormats[number]

export type EsOrCjsFormat = EsFormat | CjsFormat
