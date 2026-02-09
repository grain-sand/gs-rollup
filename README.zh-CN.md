# gs-rollup [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

这是一个 rollup 的简单包装器，主要快速打包TS模块，大多数情况下可以零配置打包。会自动拷贝文档并重建 package.json 到打包目录。

[English](./README.md)

### 安装

```sh
npx yarn add -D gs-rollup
```

### 打包

```sh
gs-rollup -c
```

### 生成配置文件

```sh
gs-rollup -i
```

### 配置

```ts
import { RollupOptions } from 'rollup'
import { defineJs, defineDts } from 'gs-rollup'

// 如果是多入口，会自动互相排除引用
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
