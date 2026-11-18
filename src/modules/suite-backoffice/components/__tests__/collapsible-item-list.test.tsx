/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';

import { CollapsibleItemList } from '../collapsible-item-list';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let page: MountedPage;

afterEach(() => {
  page?.unmount();
});

const ITEMS = Array.from({ length: 46 }, (_, index) => `Dato ${index + 1}`);

describe('CollapsibleItemList (NF-6)', () => {
  it('shows the first 3 items and how many more there are', () => {
    page = mountPage(<CollapsibleItemList items={ITEMS} />);

    expect(page.container.querySelectorAll('li')).toHaveLength(3);
    expect(page.text()).toContain('Dato 3');
    expect(page.text()).not.toContain('Dato 4');
    expect(page.text()).toContain('y 43 más');
  });

  it('expands to every item and collapses back', () => {
    page = mountPage(<CollapsibleItemList items={ITEMS} />);

    page.click(page.findByText('button', 'y 43 más'));
    expect(page.container.querySelectorAll('li')).toHaveLength(46);

    page.click(page.findByText('button', 'Ver menos'));
    expect(page.container.querySelectorAll('li')).toHaveLength(3);
  });

  it('lists a short list whole, without a toggle', () => {
    page = mountPage(<CollapsibleItemList items={['A', 'B', 'C']} />);

    expect(page.container.querySelectorAll('li')).toHaveLength(3);
    expect(page.container.querySelector('button')).toBeNull();
  });
});
