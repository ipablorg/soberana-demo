/* @vitest-environment jsdom */

import { act, useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeValue } from '@/test/dom-input';
import { mountPage, type MountedPage } from '@/test/dom-render';

import {
  RecaudoSearchInput,
  RECAUDO_SEARCH_DEBOUNCE_MS,
} from '../recaudo-search-input';

vi.mock('@lingui/react', async () => import('@/test/lingui-react-mock'));

let page: MountedPage;
const onChange = vi.fn();
let setExternal: (value: string) => void = () => {};

function Harness() {
  const [value, setValue] = useState('');
  setExternal = setValue;

  return (
    <RecaudoSearchInput
      value={value}
      onChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

function input(): HTMLInputElement {
  const element = page.container.querySelector<HTMLInputElement>('input');
  if (!element) throw new Error('No input');
  return element;
}

function clearButton(): HTMLButtonElement | null {
  return page.container.querySelector<HTMLButtonElement>('button');
}

function press(key: string) {
  page.flush(() => {
    input().dispatchEvent(
      new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }),
    );
  });
}

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms);
  });
}

beforeEach(() => {
  vi.useFakeTimers();
  onChange.mockClear();
  page = mountPage(<Harness />);
});

afterEach(() => {
  page.unmount();
  vi.useRealTimers();
});

describe('RecaudoSearchInput', () => {
  it('is a labelled search field, not a combobox', () => {
    expect(input().type).toBe('search');
    expect(input().getAttribute('aria-label')).toBe('Buscar depósitos');
    expect(input().getAttribute('role')).toBeNull();
  });

  it('hints at what can be searched', () => {
    expect(input().placeholder).toBe(
      'Buscar por usuario, referencia, billetera, cliente…',
    );
  });

  it('uses the debounce of the other typed filters', () => {
    expect(RECAUDO_SEARCH_DEBOUNCE_MS).toBe(350);
  });

  it('limits the text to what the backend accepts', () => {
    expect(input().maxLength).toBe(100);
  });

  it('does not search on every keystroke, only after the debounce', () => {
    changeValue(input(), 'ana');
    advance(RECAUDO_SEARCH_DEBOUNCE_MS - 1);

    expect(onChange).not.toHaveBeenCalled();

    advance(1);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('ana');
  });

  it('restarts the debounce while the user keeps typing', () => {
    changeValue(input(), 'an');
    advance(300);
    changeValue(input(), 'ana@');
    advance(300);

    expect(onChange).not.toHaveBeenCalled();

    advance(50);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('ana@');
  });

  it('trims the typed text before applying it', () => {
    changeValue(input(), '  RC-ABC ');
    advance(RECAUDO_SEARCH_DEBOUNCE_MS);

    expect(onChange).toHaveBeenCalledWith('RC-ABC');
  });

  it('searches immediately on Enter, once', () => {
    changeValue(input(), 'ana');

    press('Enter');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('ana');

    advance(500);

    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('does not repeat a search that is already applied', () => {
    changeValue(input(), 'ana');
    advance(RECAUDO_SEARCH_DEBOUNCE_MS);
    onChange.mockClear();

    press('Enter');

    expect(onChange).not.toHaveBeenCalled();
  });

  describe('clearing', () => {
    it('shows no clear button while empty', () => {
      expect(clearButton()).toBeNull();
    });

    it('shows a labelled clear button once there is text', () => {
      changeValue(input(), 'ana');

      expect(clearButton()?.getAttribute('aria-label')).toBe(
        'Limpiar búsqueda',
      );
      expect(clearButton()?.type).toBe('button');
    });

    it('clears at once with the button, without waiting for the debounce', () => {
      changeValue(input(), 'ana');
      advance(RECAUDO_SEARCH_DEBOUNCE_MS);
      onChange.mockClear();

      page.click(clearButton() as HTMLButtonElement);

      expect(input().value).toBe('');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('');
      expect(clearButton()).toBeNull();
    });

    it('returns focus to the field after clearing with the button', () => {
      changeValue(input(), 'ana');

      page.click(clearButton() as HTMLButtonElement);

      expect(document.activeElement).toBe(input());
    });

    it('clears at once with Escape', () => {
      changeValue(input(), 'ana');
      advance(RECAUDO_SEARCH_DEBOUNCE_MS);
      onChange.mockClear();

      press('Escape');

      expect(input().value).toBe('');
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith('');
    });

    it('lets Escape pass through when there is nothing to clear', () => {
      const event = new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true,
      });

      page.flush(() => {
        input().dispatchEvent(event);
      });

      expect(event.defaultPrevented).toBe(false);
      expect(onChange).not.toHaveBeenCalled();
    });

    it('does not apply a search that was cleared before the debounce elapsed', () => {
      changeValue(input(), 'ana');
      advance(100);

      press('Escape');
      advance(500);

      expect(onChange).not.toHaveBeenCalledWith('ana');
    });
  });

  describe('when the filter changes from elsewhere', () => {
    it('follows a reset', () => {
      changeValue(input(), 'ana');
      advance(RECAUDO_SEARCH_DEBOUNCE_MS);

      page.flush(() => setExternal(''));

      expect(input().value).toBe('');

      advance(500);

      expect(onChange).toHaveBeenCalledTimes(1);
    });

    it('shows a value set from elsewhere without re-applying it', () => {
      page.flush(() => setExternal('RC-ABC'));

      expect(input().value).toBe('RC-ABC');

      advance(500);

      expect(onChange).not.toHaveBeenCalled();
    });

    it('keeps trailing whitespace the user is still typing', () => {
      changeValue(input(), 'ana ');
      advance(RECAUDO_SEARCH_DEBOUNCE_MS);

      expect(input().value).toBe('ana ');
    });
  });
});
