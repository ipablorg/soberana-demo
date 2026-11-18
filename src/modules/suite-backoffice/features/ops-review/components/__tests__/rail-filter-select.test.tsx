/* @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { RailFilterSelect } from '../rail-filter-select';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));
vi.mock('@lingui/react/macro', async () => import('@/test/lingui-react-mock'));

const optionSelectProps = vi.fn();

vi.mock('../../../../components/option-select', () => ({
  OptionSelect: (props: Record<string, unknown>) => {
    optionSelectProps(props);
    return <div data-testid="option-select" />;
  },
}));

vi.mock('../../../platform-config/hooks/use-catalog-options', () => ({
  useRailOptions: () => ({
    rails: [
      { value: 'co_breb', label: 'Bre-B (co_breb) · COP', currency: 'COP' },
      { value: 'us_ach', label: 'ACH (us_ach) · USD', currency: 'USD' },
    ],
    currencies: [],
    failed: false,
  }),
}));

let page: MountedPage;
afterEach(() => page?.unmount());

describe('RailFilterSelect', () => {
  it('offers the catalog rails with an "all rails" option instead of free text', () => {
    page = mountPage(<RailFilterSelect id="rail" value="" onChange={() => undefined} />);

    const props = optionSelectProps.mock.calls[0][0] as {
      options: { value: string }[];
      emptyLabel: string;
    };
    expect(props.options.map((option) => option.value)).toEqual(['co_breb', 'us_ach']);
    expect(props.emptyLabel).toBe('Todos los rieles');
    expect(page.container.querySelector('input')).toBeNull();
  });
});
