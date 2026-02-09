import {describe, it} from "vitest";
import {detectRollupOption, formatInput} from "../src";

describe('formatInput', () => {
	it('not include dir', async (): Promise<void> => {
		console.log(formatInput({
			input:detectRollupOption(/\.ts$/).input,
		}))
	})
	it('include dir', async (): Promise<void> => {
		console.log(formatInput({
			input:detectRollupOption(/\.ts$/).input,
			includeInputDir:true,
			includeInputSrc:false
		}))
	})
	it('include src', async (): Promise<void> => {
		console.log(formatInput({
			input:detectRollupOption(/\.ts$/).input,
			includeInputDir:true,
			includeInputSrc:true
		}))
	})
})
