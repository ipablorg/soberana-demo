import { t } from '@lingui/core/macro';

/**
 * Labels of the pending items shown while a verification waits on review.
 * KYC is a manual review now, so a bare provider key (`customer`, `kyc`) must
 * never reach the screen as raw English: it gets a Spanish label, and any
 * other requirement keeps the label the shared formatter already produced.
 */
export function formatManualReviewItemLabel(key: string, fallback: string): string {
  switch (key) {
    case 'customer':
      return t`Revisión de los datos de tu cuenta`;
    case 'kyc':
      return t`Revisión de tu identidad`;
    default:
      return fallback;
  }
}
