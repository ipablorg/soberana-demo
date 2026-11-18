/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { ReviewStatusBadge } from '../review-status-badge';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let page: MountedPage | null = null;

afterEach(() => {
  page?.unmount();
  page = null;
});

describe('ReviewStatusBadge', () => {
  it('shows "En revision" for an IN_REVIEW beneficiary', () => {
    page = mountPage(<ReviewStatusBadge beneficiary={{ review_status: 'IN_REVIEW' }} />);
    expect(page.text()).toBe('En revisión');
  });

  it('shows "Aprobado" for an APPROVED beneficiary', () => {
    page = mountPage(<ReviewStatusBadge beneficiary={{ review_status: 'APPROVED' }} />);
    expect(page.text()).toBe('Aprobado');
  });

  it('shows "Rechazado" and exposes the reason as a tooltip title', () => {
    page = mountPage(
      <ReviewStatusBadge beneficiary={{ review_status: 'REJECTED', review_reason: 'Routing number invalido' }} />,
    );
    expect(page.text()).toBe('Rechazado');
    const badge = page.container.querySelector('[data-review-kind="rejected"]');
    expect(badge?.getAttribute('title')).toBe('Routing number invalido');
  });

  it('falls back to the legacy verification_status', () => {
    page = mountPage(<ReviewStatusBadge beneficiary={{ verification_status: 'VERIFIED' }} />);
    expect(page.text()).toBe('Aprobado');
  });

  it('does not put a title on a badge that has no reason', () => {
    page = mountPage(<ReviewStatusBadge beneficiary={{ review_status: 'IN_REVIEW' }} />);
    expect(page.container.querySelector('[data-review-kind="in_review"]')?.hasAttribute('title')).toBe(false);
  });
});
