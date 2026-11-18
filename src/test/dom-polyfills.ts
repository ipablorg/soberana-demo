/**
 * jsdom lacks the layout APIs `cmdk` (Command lists) touches. Call once at the
 * top of a jsdom test file that renders a Command / faceted filter.
 */

export function installCommandPolyfills(): void {
  const globals = globalThis as {
    ResizeObserver?: unknown;
  };

  if (!globals.ResizeObserver) {
    globals.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    };
  }

  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}
