export async function computeSriHash(content: string): Promise<string> {
  if (!globalThis.crypto?.subtle) return '';
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await globalThis.crypto.subtle.digest('SHA-256', data);
  const base64 = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
  return `sha256-${base64}`;
}

export function isSriSupported(): boolean {
  return typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.subtle !== 'undefined' &&
    globalThis.isSecureContext === true;
}

export function truncateSriHash(hash: string, maxLen = 32): string {
  if (!hash) return '';
  const alg = hash.split('-')[0] ?? '';
  const body = hash.split('-')[1] ?? '';
  if (body.length <= maxLen) return hash;
  return `${alg}-${body.slice(0, maxLen)}…`;
}

export const SDK_VERSION = '1.0.0';

export function getElementsCdnUrl(): string {
  return import.meta.env.VITE_ELEMENTS_CDN_URL || '';
}

export function getElementsSriHash(): string {
  return import.meta.env.VITE_ELEMENTS_SRI_HASH || '';
}
