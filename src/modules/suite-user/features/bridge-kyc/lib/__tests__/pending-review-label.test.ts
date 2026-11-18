import { i18n } from '@lingui/core';
import { describe, expect, it } from 'vitest';

import { formatManualReviewItemLabel } from '../pending-review-label';

i18n.load('es', {});
i18n.activate('es');

describe('formatManualReviewItemLabel', () => {
  it('replaces the raw provider key "customer" with a human label', () => {
    const label = formatManualReviewItemLabel('customer', 'Customer');
    expect(label).not.toBe('Customer');
    expect(label).toBe('Revisión de los datos de tu cuenta');
  });

  it('humanizes the other bare provider keys of a manual review', () => {
    expect(formatManualReviewItemLabel('kyc', 'Kyc')).toBe('Revisión de tu identidad');
  });

  it('keeps the existing label for every other requirement', () => {
    expect(formatManualReviewItemLabel('bridge_review', 'Review in progress')).toBe(
      'Review in progress'
    );
    expect(
      formatManualReviewItemLabel('kyb_review', 'Business verification review in progress')
    ).toBe('Business verification review in progress');
  });
});
