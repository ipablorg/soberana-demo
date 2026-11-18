function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function base64urlDecode(str: string): ArrayBuffer {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4;
  const padded2 = pad === 0 ? padded : padded + '='.repeat(4 - pad);
  const binary = atob(padded2);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes.buffer;
}

async function deriveKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    'PBKDF2',
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: encoder.encode('soberana-elements-v1'), iterations: 100000, hash: 'SHA-256' },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function encodeDeepLinkPayload(
  payload: Record<string, unknown>,
  secret: string,
): Promise<string> {
  if (secret.length < 16) throw new Error('DEEP_LINK_SECRET_TOO_SHORT');
  if (!isCryptoAvailable()) throw new Error('DEEP_LINK_REQUIRES_HTTPS');
  const key = await deriveKey(secret);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(JSON.stringify(payload));
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoded);
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  return base64urlEncode(combined.buffer);
}

export async function decodeDeepLinkPayload(
  encoded: string,
  secret: string,
): Promise<Record<string, unknown> | null> {
  try {
    if (!isCryptoAvailable()) return JSON.parse(atob(encoded)) as Record<string, unknown>;
    const combined = new Uint8Array(base64urlDecode(encoded));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const key = await deriveKey(secret);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
    return JSON.parse(new TextDecoder().decode(decrypted)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function buildDeepLinkUrl(widgetId: string, encodedPayload: string): string {
  return `https://cdn.soberana.io/embed/${widgetId}?p=${encodedPayload}`;
}

export function isCryptoAvailable(): boolean {
  return typeof globalThis !== 'undefined' &&
    typeof globalThis.crypto !== 'undefined' &&
    typeof globalThis.crypto.subtle !== 'undefined';
}

export function validateJsonPayload(raw: string): { valid: boolean; parsed?: Record<string, unknown>; error?: string } {
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
      return { valid: false, error: 'El payload debe ser un objeto JSON' };
    }
    return { valid: true, parsed };
  } catch {
    return { valid: false, error: 'JSON inválido' };
  }
}
