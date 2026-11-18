import { describe, expect, it } from 'vitest';

describe('KYCBanner source contract', () => {
  it('keeps the ToS CTA available for existing customers even when the current link is missing', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../KYCBanner.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain('? tosAccepted !== true');
    expect(source).not.toContain('? tosAccepted !== true && Boolean(tosLink)');
  });

  it('offers a manual refresh affordance for stale snapshot states', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../KYCBanner.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain('Refresh status');
    expect(source).toContain('needsManualRefresh');
  });

  it('keeps retryable terminal states actionable from the banner', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../KYCBanner.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain('Reintentar verificación');
    expect(source).toContain('Continuar verificación');
    expect(source).toContain('!needsKycRetry && !needsManualRefresh');
  });

  it('wires a support CTA when the snapshot exposes contact_support', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../KYCBanner.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain('needsSupport && supportHref');
    expect(source).toContain('Contact support');
    expect(source).toContain('href={supportHref}');
  });

  it('keeps provider workflow blockers visually separated from editable requirements', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../KYCBanner.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain('TyC pendientes');
    expect(source).toContain('needsSupport && supportHref');
    expect(source).not.toContain('pending workflow items are editable');
  });
});
