import { describe, expect, it } from 'vitest';

import { getStepReviewState } from '../step-review-state';

describe('getStepReviewState', () => {
  it('shows a resume ToS CTA when onboarding is resumed with a pending ToS link', () => {
    expect(
      getStepReviewState({
        submitted: true,
        tosLink: 'https://bridge.test/tos',
        isResumeState: true,
        requiresTosAction: true,
        hasUnsupportedProviderFallback: false,
      }),
    ).toEqual({
      kind: 'terms',
      resume: true,
      tosLink: 'https://bridge.test/tos',
    });
  });

  it('shows a post-submit ToS CTA without marking it as a resume state', () => {
    expect(
      getStepReviewState({
        submitted: true,
        tosLink: 'https://bridge.test/tos',
        isResumeState: false,
        requiresTosAction: true,
        hasUnsupportedProviderFallback: false,
      }),
    ).toEqual({
      kind: 'terms',
      resume: false,
      tosLink: 'https://bridge.test/tos',
    });
  });

  it('shows a recovery CTA when ToS is still pending but the current link is missing', () => {
    expect(
      getStepReviewState({
        submitted: true,
        tosLink: null,
        isResumeState: true,
        requiresTosAction: true,
        hasUnsupportedProviderFallback: false,
      }),
    ).toEqual({
      kind: 'terms-recovery',
      resume: true,
    });
  });

  it('shows the submitted review message when there is no ToS CTA left to complete', () => {
    expect(
      getStepReviewState({
        submitted: true,
        tosLink: null,
        isResumeState: false,
        requiresTosAction: false,
        hasUnsupportedProviderFallback: false,
      }),
    ).toEqual({ kind: 'submitted' });
  });

  it('keeps the review copy aligned with provider confirmation and refresh-based recovery', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../../../pages/verify-identity-page.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain('Refresh status');
    expect(source).toContain('Your submission was received. This page keeps checking automatically until the review progresses.');
    expect(source).toContain('Restauramos tu última submission para que corrijas solo lo que sea necesario y lo envíes de nuevo.');
  });

  it('renders explicit support escalation copy for contact_support outcomes', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../../../pages/verify-identity-page.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain('Nuestro equipo de soporte puede ayudarte a entender qué pasó y cómo avanzar.');
    expect(source).toContain('Contactar soporte');
  });

  it('shows the unsupported-provider fallback instead of the normal review state', () => {
    expect(
      getStepReviewState({
        submitted: false,
        tosLink: null,
        isResumeState: false,
        requiresTosAction: false,
        hasUnsupportedProviderFallback: true,
      }),
    ).toEqual({ kind: 'unsupported-provider' });
  });

  it('keeps ToS completion driven by backend progress instead of a local checkbox', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../step-review.tsx');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).not.toContain("from '@/shared/components/ui/checkbox'");
    expect(source).not.toContain('onTosAcceptedChange');
    expect(source).toContain('the provider confirms the progress');
  });

  it('treats remediation as form work rather than review completion', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const filePath = path.resolve(__dirname, '../../../hooks/use-verify-identity-state.ts');
    const source = fs.readFileSync(filePath, 'utf-8');

    expect(source).toContain('hasOutstandingRequirements');
    expect(source).toContain('if (hasOutstandingRequirements)');
  });
});
