import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

const source = readFileSync(resolve(__dirname, '../conversational-home.tsx'), 'utf-8');

describe('conversational home - open flow clearance under the mobile dock', () => {
  it('defines the clearance with the same offset <main> uses (dock height + safe-area inset)', () => {
    expect(source).toMatch(
      /const FLOW_DOCK_CLEARANCE\s*=\s*'max-md:pb-\[calc\(6rem\+env\(safe-area-inset-bottom\)\)\]'/
    );
  });

  it('applies it to the Receive/Send flow slot only while a flow is open', () => {
    expect(source).toMatch(/isFlowOpen && FLOW_DOCK_CLEARANCE/);
  });

  it('marks the document while a flow is open so the WhatsApp FAB steps aside on phones', () => {
    expect(source).toMatch(/setAttribute\('data-suite-flow-open', ''\)/);
    expect(source).toMatch(/removeAttribute\('data-suite-flow-open'\)/);
  });
});
