import { describe, expect, it } from 'vitest';

describe('TransactionGuard source contract', () => {
  it('routes kyc review blockers to the verification flow with an explicit CTA', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../TransactionGuard.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain("reason === 'kyc_review_required'");
    expect(source).toContain("onNavigate('/suite/verify-identity')");
    expect(source).toContain('Open verification');
  });
});
