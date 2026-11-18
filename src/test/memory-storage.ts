/**
 * In-memory `Storage` for DOM tests.
 *
 * Node 25 ships an experimental `localStorage` global that shadows jsdom's and
 * has no methods unless `--localstorage-file` is passed, so any code that
 * touches `window.localStorage` needs `vi.stubGlobal('localStorage', memoryStorage())`.
 */
export function memoryStorage(): Storage {
  const data = new Map<string, string>();

  return {
    get length() {
      return data.size;
    },
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    removeItem: (key) => void data.delete(key),
    setItem: (key, value) => void data.set(key, String(value)),
  };
}
