# gs-rollup [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



This is a simple wrapper for rollup, mainly used for quickly packaging TypeScript modules. It can be used with zero configuration in most cases. It will automatically copy documentation and rebuild package.json to the packaging directory.

[中文](./README.zh-CN.md)

### Installation

```sh
npx yarn add -D gs-rollup
```


### Build

```sh
gs-rollup -c
```

### Generate Configuration File

```sh
gs-rollup -i
```

### Configuration

```ts
import { RollupOptions } from 'rollup'
import { defineJs, defineDts } from 'gs-rollup'

// If it's a multi-entry, it will automatically exclude mutual references
const input = [ 'src/index.ts' ]

export default <RollupOptions[]>[  
	...defineDts({
		input,
		buildPackageJson: {
			deleteProps:/^(devDependencies|scripts)$/
		}
	}),
	...defineJs({input})
]
```
