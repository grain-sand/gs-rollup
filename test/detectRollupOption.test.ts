// noinspection TypeScriptUnresolvedReference

import {beforeEach, describe, expect, it, vi} from 'vitest';
import {detectRollupOption} from '../src/tools';
import {readFileSync} from 'node:fs';

// Mock the fs module
vi.mock('node:fs', () => ({
  readFileSync: vi.fn(),
}));

describe('detectRollupOption', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
  });

  it('should return default configuration when package.json does not exist', () => {
    // Mock readFileSync to throw an error
    (readFileSync as vi.Mock).mockImplementation(() => {
      throw new Error('File not found');
    });

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: expect.arrayContaining(['cjs', 'es']),
      outputBase: 'dist',
      outputCodeDir: 'lib',
    });
  });

  it('should return default configuration when package.json is empty', () => {
    // Mock readFileSync to return an empty JSON
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({}));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: expect.arrayContaining(['cjs', 'es']),
      outputBase: 'dist',
      outputCodeDir: 'lib',
    });
  });

  it('should detect configuration from main and types fields', () => {
    // Mock readFileSync to return a package.json with main and types fields
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      main: 'dist/cjs/index.js',
      types: 'dist/cjs/index.d.ts',
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: ['cjs'],
      outputBase: 'dist',
      outputCodeDir: 'cjs',
    });
  });

  it('should detect configuration from main without types', () => {
    // Mock readFileSync to return a package.json with main but no types
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      main: 'dist/cjs/index.js',
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: false,
      formats: ['cjs'],
      outputBase: 'dist',
      outputCodeDir: 'cjs',
    });
  });

  it('should detect configuration from main and module fields', () => {
    // Mock readFileSync to return a package.json with main and module fields
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      main: 'dist/cjs/index.js',
      module: 'dist/es/index.js',
      types: 'dist/index.d.ts',
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: expect.arrayContaining(['cjs', 'es']),
      outputBase: 'dist',
      outputCodeDir: '',
    });
  });

  it('should detect configuration from simple exports field', () => {
    // Mock readFileSync to return a package.json with exports field
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      exports: {
        '.': {
          import: './dist/es/index.js',
          require: './dist/cjs/index.js',
          types: './dist/index.d.ts',
        },
      },
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: expect.arrayContaining(['cjs', 'es']),
      outputBase: 'dist',
      outputCodeDir: '',
    });
  });

  it('should detect configuration from complex exports field', () => {
    // Mock readFileSync to return a package.json with complex exports field
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      exports: {
        '.': {
          import: './dist/lib/es/index.js',
          require: './dist/lib/cjs/index.js',
          types: './dist/lib/index.d.ts',
        },
        './utils': {
          import: './dist/lib/es/utils.js',
          require: './dist/lib/cjs/utils.js',
          types: './dist/lib/utils.d.ts',
        },
      },
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: expect.arrayContaining(['cjs', 'es']),
      outputBase: 'dist',
      outputCodeDir: 'lib',
    });
  });

  it('should handle exports without types', () => {
    // Mock readFileSync to return a package.json with exports but no types
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      exports: {
        '.': {
          import: './dist/es/index.js',
          require: './dist/cjs/index.js',
        },
      },
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: false,
      formats: expect.arrayContaining(['cjs', 'es']),
      outputBase: 'dist',
      outputCodeDir: '',
    });
  });

  it('should handle single export path', () => {
    // Mock readFileSync to return a package.json with single export path
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      exports: './dist/index.js',
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: false,
      formats: ['cjs', 'es'],
      outputBase: 'dist',
      outputCodeDir: '',
    });
  });

  it('should handle different output directories', () => {
    // Mock readFileSync to return a package.json with different output directories
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      main: 'lib/index.js',
      module: 'es/index.js',
      types: 'types/index.d.ts',
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: ['cjs', 'es'],
      outputBase: '',
      outputCodeDir: 'lib',
    });
  });

  it('should handle deep output paths', () => {
    // Mock readFileSync to return a package.json with deep output paths
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      main: 'packages/core/dist/cjs/index.js',
      module: 'packages/core/dist/es/index.js',
      types: 'packages/core/dist/index.d.ts',
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: ['cjs', 'es'],
      outputBase: 'packages',
      outputCodeDir: 'core/dist',
    });
  });

  it('should handle Windows-style paths', () => {
    // Mock readFileSync to return a package.json with Windows-style paths
    (readFileSync as vi.Mock).mockReturnValue(JSON.stringify({
      main: 'dist\\cjs\\index.js',
      module: 'dist\\es\\index.js',
      types: 'dist\\index.d.ts',
    }));

    const result = detectRollupOption();

    expect(result).toEqual({
      input: ['src/index.ts'],
      types: true,
      formats: ['cjs', 'es'],
      outputBase: 'dist',
      outputCodeDir: '',
    });
  });
});
