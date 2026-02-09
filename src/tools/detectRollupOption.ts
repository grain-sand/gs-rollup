import {InputOption, ModuleFormat} from "rollup";
import {IDetectedOption} from "../type";
import {packageJsonToRollup} from "../type/packageJsonToRollup";

const defaultInput: InputOption = ["src/index.ts"];

export function detectRollupOption(): IDetectedOption {

	// todo 1 尝试根据package.json中的信息分析
	try {
		const option = packageJsonToRollup();
		if (option) {
			return option;
		}
	} catch {
	}

	// todo 2 尝试根据项目中所有index.ts文件分析,最多分析2级目录


	// 默认配置
	return {
		input: defaultInput,
		types: true,
		formats: ['cjs', 'es'] as ModuleFormat,
		outputBase: 'dist',
		outputCodeDir: 'lib'
	};
}
