/* @vitest-environment jsdom */

import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';
import { installCommandPolyfills } from '@/test/dom-polyfills';

import { FacetedFilter } from '../faceted-filter';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

installCommandPolyfills();

const OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'COMPLETED', label: 'Aprobado' },
  { value: 'REJECTED', label: 'Rechazado' },
  { value: 'FAILED', label: 'Revertido' },
];

const CUSTOM = {
  toValue: (text: string) => text.trim().toUpperCase(),
  label: (text: string) => `Usar «${text.trim().toUpperCase()}»`,
};

let page: MountedPage;

type HarnessProps = Partial<Parameters<typeof FacetedFilter>[0]> & {
  initial?: string[];
  onChangeSpy?: (next: string[]) => void;
};

function Harness({ initial = [], onChangeSpy, ...props }: HarnessProps) {
  const [selected, setSelected] = useState<string[]>(initial);

  return (
    <FacetedFilter
      variant="toolbar"
      title="Estado"
      options={OPTIONS}
      selected={selected}
      onChange={(next) => {
        onChangeSpy?.(next);
        setSelected(next);
      }}
      {...props}
    />
  );
}

function mount(props: HarnessProps = {}) {
  page = mountPage(<Harness {...props} />);
  return page;
}

function trigger(): HTMLButtonElement {
  const button = page.container.querySelector<HTMLButtonElement>('button');
  if (!button) throw new Error('No trigger');
  return button;
}

function open() {
  page.click(trigger());
}

function labelOf(node: Element): string {
  return (node.textContent ?? '').replace('Seleccionado', '').trim();
}

function optionLabels(): string[] {
  return Array.from(document.body.querySelectorAll('[role="option"]')).map(
    labelOf,
  );
}

function option(label: string): HTMLElement {
  const match = Array.from(
    document.body.querySelectorAll<HTMLElement>('[role="option"]'),
  ).find((node) => labelOf(node) === label);
  if (!match) throw new Error(`No option ${label}`);
  return match;
}

function searchInput(): HTMLInputElement {
  const input = document.body.querySelector<HTMLInputElement>('input[cmdk-input]');
  if (!input) throw new Error('No search input');
  return input;
}

function pressEscape() {
  page.flush(() => {
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
  });
}

afterEach(() => {
  page?.unmount();
  document.body.innerHTML = '';
});

describe('FacetedFilter (toolbar)', () => {
  it('shows only the title while nothing is selected', () => {
    mount();

    expect(trigger().textContent).toBe('Estado');
  });

  it('shows the selected labels as badges next to the title', () => {
    mount({ multiple: true, initial: ['COMPLETED', 'REJECTED'] });

    expect(trigger().textContent).toContain('Aprobado');
    expect(trigger().textContent).toContain('Rechazado');
  });

  it('collapses three or more selections into a count', () => {
    mount({ multiple: true, initial: ['PENDING', 'COMPLETED', 'REJECTED'] });

    expect(trigger().textContent).toContain('3 seleccionados');
    expect(trigger().textContent).not.toContain('Aprobado');
  });

  it('shows the empty label when it is active with nothing selected', () => {
    mount({ active: true, emptyLabel: 'Todos' });

    expect(trigger().textContent).toContain('Todos');
  });

  it('lists every option when opened', () => {
    mount();
    open();

    expect(optionLabels()).toEqual([
      'Pendiente',
      'Aprobado',
      'Rechazado',
      'Revertido',
    ]);
  });

  it('applies a multiple selection immediately and keeps the list open', () => {
    const spy = vi.fn();
    mount({ multiple: true, initial: ['PENDING'], onChangeSpy: spy });
    open();

    page.click(option('Aprobado'));

    expect(spy).toHaveBeenLastCalledWith(['PENDING', 'COMPLETED']);
    expect(optionLabels()).toHaveLength(4);
    expect(option('Aprobado').textContent).toContain('Seleccionado');
  });

  it('unselects a selected option in a multiple facet', () => {
    const spy = vi.fn();
    mount({
      multiple: true,
      initial: ['PENDING', 'COMPLETED'],
      onChangeSpy: spy,
    });
    open();

    page.click(option('Pendiente'));

    expect(spy).toHaveBeenLastCalledWith(['COMPLETED']);
  });

  it('applies a single selection immediately and closes the list', () => {
    const spy = vi.fn();
    mount({ onChangeSpy: spy });
    open();

    page.click(option('Rechazado'));

    expect(spy).toHaveBeenLastCalledWith(['REJECTED']);
    expect(document.body.querySelector('[role="option"]')).toBeNull();
  });

  it('filters the options as the user types', () => {
    mount();
    open();

    changeValue(searchInput(), 'apro');

    expect(optionLabels()).toEqual(['Aprobado']);
  });

  it('says so when nothing matches', () => {
    mount();
    open();

    changeValue(searchInput(), 'zzz');

    expect(optionLabels()).toEqual([]);
    expect(document.body.textContent).toContain('Sin resultados');
  });

  it('offers to use free-typed text when a custom value is allowed', () => {
    const spy = vi.fn();
    mount({
      title: 'Moneda',
      options: [{ value: 'USDC', label: 'USDC' }],
      custom: CUSTOM,
      onChangeSpy: spy,
    });
    open();

    changeValue(searchInput(), 'eur');
    page.click(option('Usar «EUR»'));

    expect(spy).toHaveBeenLastCalledWith(['EUR']);
  });

  it('does not offer the custom value when it already exists as an option', () => {
    mount({ options: [{ value: 'USDC', label: 'USDC' }], custom: CUSTOM });
    open();

    changeValue(searchInput(), 'usdc');

    expect(optionLabels()).toEqual(['USDC']);
  });

  it('keeps a selected value that is not among the options', () => {
    mount({ initial: ['EUR'] });

    expect(trigger().textContent).toContain('EUR');
  });

  it('clears a clearable selection from the list', () => {
    const spy = vi.fn();
    mount({ clearable: true, initial: ['FAILED'], onChangeSpy: spy });
    open();

    page.click(option('Limpiar filtro'));

    expect(spy).toHaveBeenLastCalledWith([]);
  });

  it('closes with Escape and returns focus to the trigger', async () => {
    mount();
    open();
    expect(optionLabels().length).toBeGreaterThan(0);

    pressEscape();
    // Radix restores focus in a timeout once the popover has unmounted.
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(document.body.querySelector('[role="option"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});

describe('FacetedFilter (column header)', () => {
  function classTokens(element: Element): string[] {
    return (element.getAttribute('class') ?? '').split(/\s+/);
  }

  it('renders the column title itself as the trigger, with no icon', () => {
    mount({ variant: 'column' });

    expect(trigger().textContent).toBe('Estado');
    expect(trigger().querySelector('svg')).toBeNull();
    expect(trigger().type).toBe('button');
  });

  it('shows a header label that differs from the filter title, keeping the filter in the accessible name', () => {
    mount({ variant: 'column', title: 'Moneda', triggerLabel: 'Monto' });

    expect(trigger().textContent).toBe('Monto');
    expect(trigger().getAttribute('aria-label')).toBe('Filtrar por Moneda');
  });

  it('is a labelled dialog trigger that reports whether it is open', () => {
    mount({ variant: 'column' });

    expect(trigger().getAttribute('aria-label')).toBe('Filtrar por Estado');
    expect(trigger().getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');

    open();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
  });

  it('reads as clickable text: pointer cursor, hover colour and a 150 ms colour transition', () => {
    mount({ variant: 'column' });

    const tokens = classTokens(trigger());

    expect(tokens).toContain('cursor-pointer');
    expect(tokens).toContain('hover:text-foreground');
    expect(tokens).toContain('transition-colors');
    expect(tokens).toContain('duration-150');
    expect(tokens).not.toContain('transition-all');
  });

  it('shows no active indicator while the filter is off', () => {
    mount({ variant: 'column' });

    expect(trigger().getAttribute('data-active')).toBe('false');
    expect(trigger().querySelector('[aria-hidden="true"]')).toBeNull();
    expect(classTokens(trigger())).not.toContain('text-foreground');
  });

  it('flags an active filter with a dot, a stronger label and its accessible name', () => {
    mount({ variant: 'column', active: true });

    const dot = trigger().querySelector('[aria-hidden="true"]');

    expect(trigger().getAttribute('aria-label')).toBe(
      'Filtrar por Estado (filtro activo)',
    );
    expect(trigger().getAttribute('data-active')).toBe('true');
    expect(classTokens(trigger())).toContain('text-foreground');
    expect(dot).not.toBeNull();
    expect(classTokens(dot as Element)).toContain('bg-primary');
    expect(trigger().querySelector('svg')).toBeNull();
    expect(trigger().textContent).toBe('Estado');
  });

  it('opens the same option list and edits the selection', () => {
    const spy = vi.fn();
    mount({ variant: 'column', multiple: true, onChangeSpy: spy });
    open();

    page.click(option('Revertido'));

    expect(spy).toHaveBeenLastCalledWith(['FAILED']);
  });

  it('closes with Escape and returns focus to the title', async () => {
    mount({ variant: 'column' });
    open();
    expect(optionLabels().length).toBeGreaterThan(0);

    pressEscape();
    await new Promise((resolve) => setTimeout(resolve, 20));

    expect(document.body.querySelector('[role="option"]')).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });
});
