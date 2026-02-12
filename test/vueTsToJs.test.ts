// noinspection TypeScriptUnresolvedReference,HtmlUnknownAttribute

import { describe, it, expect } from 'vitest';
import { vueTsToJs } from '../src';

describe('vueTsToJs', () => {
  it('should handle basic Vue component with script', () => {
    const code = `
<template>
  <div>Hello World</div>
</template>

<script lang="ts">
const msg = 'Hello';
export default {
  name: 'TestComponent'
};
</script>
`;

    const result = vueTsToJs(code);
    expect(result).toContain('<template>');
    expect(result).toContain('<div>Hello World</div>');
    expect(result).toContain('</template>');
    expect(result).toContain('<script>');
    expect(result).toContain('const msg = \'Hello\';');
    expect(result).toContain('export default {');
    expect(result).toContain('name: \'TestComponent\'');
    expect(result).toContain('};');
    expect(result).toContain('</script>');
  });

  it('should handle scriptSetup', () => {
    const code = `
<template>
  <div>{{ msg }}</div>
</template>

<script setup lang="ts">
const msg = 'Hello Setup';
</script>
`;

    const result = vueTsToJs(code);
    expect(result).toContain('<template>');
    expect(result).toContain('<div>{{ msg }}</div>');
    expect(result).toContain('</template>');
    expect(result).toContain('<script>');
    expect(result).toContain('const msg = \'Hello Setup\';');
    expect(result).toContain('</script>');
  });

  it('should handle Vue compilation option', () => {
    const code = `
<template>
  <div>{{ msg }}</div>
</template>

<script setup lang="ts">
const msg = 'Hello';
</script>
`;

    const result = vueTsToJs(code, { compile: 'vue', filename: 'TestComponent.vue' });
    expect(result).toContain('<template>');
    expect(result).toContain('<div>{{ msg }}</div>');
    expect(result).toContain('</template>');
    expect(result).toContain('<script>');
    expect(result).toContain('const msg = \'Hello\';');
    expect(result).toContain('</script>');
  });

  it('should handle esbuild compilation option', () => {
    const code = `
<!--suppress JSAnnotator -->
<script lang="ts">
const msg: string = 'Hello';
export default {
  name: 'TestComponent'
};
</script>
`;

    const result = vueTsToJs(code, { compile: 'esbuild' });
    expect(result).toContain('<script>');
    expect(result).toContain('const msg = "Hello";');
    expect(result).toContain('export default {');
    expect(result).toContain('name: "TestComponent"');
    expect(result).toContain('};');
    expect(result).toContain('</script>');
  });

  it('should handle script code modification', () => {
    const code = `
<script lang="ts">
const msg = 'Hello';
export default {
  name: 'TestComponent'
};
</script>
`;

    const result = vueTsToJs(code, {
      scriptCodeModify: {
        codeModify: (content) => content.replace('Hello', 'Modified Hello')
      }
    });
    expect(result).toContain('const msg = \'Modified Hello\';');
  });

  it('should handle Vue code modification', () => {
    const code = `
<template>
  <div>Hello</div>
</template>

<script lang="ts">
const msg = 'Hello';
</script>
`;

    const result = vueTsToJs(code, {
      vueCodeModify: (vueCode) => {
        if (vueCode.script) {
          vueCode.script.content = vueCode.script.content.replace('Hello', 'Modified Hello');
        }
        return vueCode;
      }
    });
    expect(result).toContain('const msg = \'Modified Hello\';');
  });

  it('should handle styles', () => {
    const code = `
<template>
  <div>Hello</div>
</template>

<style scoped>
.div {
  color: red;
}
</style>

<style lang="scss">
.global {
  margin: 0;
}
</style>
`;

    const result = vueTsToJs(code);
    expect(result).toContain('<template>');
    expect(result).toContain('</template>');
    expect(result).toContain('<style scoped>');
    expect(result).toContain('.div {');
    expect(result).toContain('color: red;');
    expect(result).toContain('</style>');
    expect(result).toContain('<style lang="scss">');
    expect(result).toContain('.global {');
    expect(result).toContain('margin: 0;');
    expect(result).toContain('</style>');
  });

  it('should handle component with only template', () => {
    const code = `
<template>
  <div>Hello</div>
</template>
`;

    const result = vueTsToJs(code);
    expect(result).toContain('<template>');
    expect(result).toContain('<div>Hello</div>');
    expect(result).toContain('</template>');
    expect(result).not.toContain('<script>');
  });

  it('should handle component with only script', () => {
    const code = `
<script lang="ts">
const msg = 'Original Hello';
export default {
  name: 'TestComponent'
};
</script>
`;

    const result = vueTsToJs(code);
    expect(result).toContain('<script>');
    expect(result).toContain('const msg = \'Original Hello\';');
    expect(result).toContain('export default {');
    expect(result).toContain('name: \'TestComponent\'');
    expect(result).toContain('};');
    expect(result).toContain('</script>');
  });

  it('should handle empty component', () => {
    const code = ``;
    const result = vueTsToJs(code);
    expect(result).toBe('');
  });
});
