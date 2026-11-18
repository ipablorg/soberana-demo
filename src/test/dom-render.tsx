/**
 * Minimal React DOM test harness.
 *
 * The project has no @testing-library/react dependency, so page tests mount
 * through `react-dom/client` directly (same approach as
 * `verify-identity-page.test.tsx`). This module just removes the boilerplate.
 *
 * Only usable from a `/* @vitest-environment jsdom *\/` test file.
 */

import type { ReactElement } from 'react';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

export interface MountedPage {
  container: HTMLElement;
  unmount: () => void;
  /** Runs `fn` inside `act` so React flushes state updates before asserting. */
  flush: (fn: () => void) => void;
  /** All rendered text, whitespace-collapsed, for substring assertions. */
  text: () => string;
  /** First element whose trimmed text content matches `label` exactly. */
  findByText: <T extends Element>(selector: string, label: string) => T;
  click: (element: Element) => void;
}

export function mountPage(element: ReactElement): MountedPage {
  const container = document.createElement('div');
  document.body.appendChild(container);

  let root: Root;
  act(() => {
    root = createRoot(container);
    root.render(element);
  });

  const flush = (fn: () => void) => {
    act(() => {
      fn();
    });
  };

  return {
    container,
    flush,
    text: () => (container.textContent ?? '').replace(/\s+/g, ' ').trim(),
    findByText: <T extends Element>(selector: string, label: string): T => {
      const match = Array.from(container.querySelectorAll(selector)).find(
        (node) => (node.textContent ?? '').trim() === label,
      );

      if (!match) {
        throw new Error(
          `No <${selector}> with text "${label}". Rendered: ${container.textContent}`,
        );
      }

      return match as unknown as T;
    },
    click: (target: Element) => {
      act(() => {
        target.dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });
    },
    unmount: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}
