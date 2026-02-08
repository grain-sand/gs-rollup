import {describe, it, expect} from 'vitest';
import {margeEsImport} from '../src/tools/margeEsImport';

describe('margeEsImport', () => {
	it('should merge multiple imports from the same module', () => {
		const code = `
import foo from './module1';
import { bar } from './module1';
import { baz } from './module1';

console.log(foo, bar, baz);
`;

		const expected = `
import foo, { bar, baz } from './module1';

console.log(foo, bar, baz);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should merge named imports with aliases', () => {
		const code = `
import { foo as foo1 } from './module2';
import { bar } from './module2';
import { foo as foo2 } from './module2';

console.log(foo1, bar, foo2);
`;

		const expected = `
import { foo as foo1, bar, foo as foo2 } from './module2';

console.log(foo1, bar, foo2);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should handle different modules separately', () => {
		const code = `
import foo from './module1';
import { bar } from './module2';
import { baz } from './module1';

console.log(foo, bar, baz);
`;

		const expected = `
import foo, { baz } from './module1';
import { bar } from './module2';

console.log(foo, bar, baz);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should handle mixed default and named imports', () => {
		const code = `
import foo from './module1';
import { bar } from './module1';
import baz from './module2';
import { qux, quux } from './module2';

console.log(foo, bar, baz, qux, quux);
`;

		const expected = `
import foo, { bar } from './module1';
import baz, { qux, quux } from './module2';

console.log(foo, bar, baz, qux, quux);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should preserve non-import lines', () => {
		const code = `
// This is a comment
import foo from './module1';
const x = 1;
import { bar } from './module1';
console.log(x, foo, bar);
`;

		const expected = `
// This is a comment
import foo, { bar } from './module1';
const x = 1;
console.log(x, foo, bar);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should handle imports without semicolons', () => {
		const code = `
import foo from './module1'
import { bar } from './module1'

console.log(foo, bar)
`;

		const expected = `
import foo, { bar } from './module1';

console.log(foo, bar)
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should handle imports with whitespace variations', () => {
		const code = `
import   foo   from   './module1';
import {  bar  ,  baz  } from './module1';

console.log(foo, bar, baz);
`;

		const expected = `
import foo, { bar, baz } from './module1';

console.log(foo, bar, baz);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should handle imports with special characters', () => {
		const code = `
import fs$1 from 'node:fs/promises';
import { readFile } from 'node:fs/promises';
import fs$2 from 'node:fs/promises';

console.log(fs$1, fs$2, readFile);
`;

		const expected = `
import fs$1, { readFile } from 'node:fs/promises';
import fs$2 from 'node:fs/promises';

console.log(fs$1, fs$2, readFile);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should handle namespace imports', () => {
		const code = `
import * as fs from 'node:fs';
import { readFileSync } from 'node:fs';
import * as path from 'path';

console.log(fs, readFileSync, path);
`;

		const expected = `
import * as fs from 'node:fs';
import * as path from 'path';

console.log(fs, readFileSync, path);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should handle mixed namespace and default imports', () => {
		const code = `
import * as fs from 'node:fs';
import fsPromises from 'node:fs/promises';
import { readFileSync } from 'node:fs';

console.log(fs, fsPromises, readFileSync);
`;

		const expected = `
import * as fs from 'node:fs';
import fsPromises from 'node:fs/promises';

console.log(fs, fsPromises, readFileSync);
`;

		expect(margeEsImport(code)).toBe(expected);
	});

	it('should handle multiple imports in a single line (minified code)', () => {
		const code = `import foo from './module1';import { bar } from './module1';import baz from './module2';import { qux } from './module2';console.log(foo, bar, baz, qux);`;

		const expected = `import foo, { bar } from './module1';import baz, { qux } from './module2';console.log(foo, bar, baz, qux);`;

		expect(margeEsImport(code)).toBe(expected);
	});
});
