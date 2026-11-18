/**
 * Files kept as they are (no re-encoding), as base64 data URIs: the type and
 * size check, and the read. Used by `DocumentCapture` in file mode (provider
 * requirement uploads accept PDF, PNG and JPEG up to 10 MB).
 *
 * SECURITY: file bytes are sensitive. They live only in memory and in caller
 * state — never log them, never persist them to storage.
 */

export type FileCheckError = 'type' | 'size';

/** Why a file cannot be kept, or null when it fits `accept` and `maxBytes`. */
export function checkFile(
  file: { type: string; size: number },
  accept: readonly string[],
  maxBytes: number
): FileCheckError | null {
  if (!accept.includes(file.type)) return 'type';
  if (file.size > maxBytes) return 'size';
  return null;
}

/** Reads the file as a `data:<mime>;base64,…` URI. */
export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Unexpected file reader result'));
    };
    reader.onerror = () => reject(reader.error ?? new Error('File read failed'));
    reader.readAsDataURL(file);
  });
}
