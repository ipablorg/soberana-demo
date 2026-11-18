/**
 * Controlled-input helpers for page tests mounted with `mountPage`.
 *
 * React tracks input values through the native setter, so assigning
 * `element.value` directly is ignored; these go through the prototype setter
 * and dispatch the events React listens to.
 */

import { act } from 'react';

export function changeValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  act(() => {
    setter?.call(element, value);
    element.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

export function submitForm(form: HTMLFormElement): void {
  act(() => {
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });
}
