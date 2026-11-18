/* @vitest-environment jsdom */

import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { mountPage, type MountedPage } from '@/test/dom-render';
import { OptionSelect } from '../option-select';

const selectValues: Array<string | undefined> = [];

vi.mock('@/shared/components/ui/select', () => ({
  Select: ({ value, children }: { value?: string; children: ReactNode }) => {
    selectValues.push(value);
    return <div>{children}</div>;
  },
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: ({ placeholder }: { placeholder: string }) => <span>{placeholder}</span>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

let page: MountedPage;

afterEach(() => {
  page?.unmount();
  selectValues.length = 0;
});

const OPTIONS = [{ value: 'COL', label: 'Colombia' }];

describe('OptionSelect', () => {
  it('stays controlled from the first render while nothing is picked', () => {
    page = mountPage(
      <OptionSelect
        id="country"
        value=""
        onChange={() => {}}
        options={OPTIONS}
        placeholder="País"
      />
    );

    expect(selectValues.length).toBeGreaterThan(0);
    expect(selectValues.every((value) => value !== undefined)).toBe(true);
    expect(selectValues[0]).toBe('');
    expect(page.text()).toContain('País');
  });

  it('passes the picked value through', () => {
    page = mountPage(
      <OptionSelect
        id="country"
        value="COL"
        onChange={() => {}}
        options={OPTIONS}
        placeholder="País"
      />
    );

    expect(selectValues.at(-1)).toBe('COL');
  });

  it('uses the empty option when the field is optional', () => {
    page = mountPage(
      <OptionSelect
        id="country"
        value=""
        onChange={() => {}}
        options={OPTIONS}
        placeholder="País"
        emptyLabel="Ninguno"
      />
    );

    expect(selectValues.at(-1)).toBe('__none__');
  });
});
