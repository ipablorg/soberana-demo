import { describe, expect, it } from 'vitest';

async function readSource(relativePath: string): Promise<string> {
  const fs = await import('fs');
  const path = await import('path');

  return fs.readFileSync(path.resolve(__dirname, relativePath), 'utf-8');
}

describe('use-rails source contract', () => {
  it('keeps pe_bank_transfer hidden outside sandbox runtime', async () => {
    const source = await readSource('../use-rails.ts');

    expect(source).toContain("import { isSandboxRuntime } from '@/shared/lib/runtime-sandbox';");
    expect(source).toContain("const sandboxRuntime = isSandboxRuntime();");
    expect(source).toContain('const hiddenRailsOutsideSandbox = sandboxRuntime');
    expect(source).toContain("? new Set<string>()");
    expect(source).toContain(": new Set(['pe_bank_transfer']);");
    expect(source).toContain('!hiddenRailsOutsideSandbox.has(r.code.toLowerCase())');
  });
});
