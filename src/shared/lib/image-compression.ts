/**
 * Client-side image compression for KYC document capture (`kyc_method: "api"`).
 *
 * Resizes a captured/uploaded image to a bounded edge and re-encodes it as a
 * JPEG data URL to keep the base64 payload within backend limits. The pure
 * dimension math is split out so it can be unit-tested without a DOM.
 *
 * SECURITY: image bytes are sensitive PII. They live only in memory here and in
 * caller component state — never log them, never persist them to storage.
 */

export interface ScaledDimensions {
  width: number;
  height: number;
}

export interface CompressOptions {
  /** Longest-edge cap in pixels. */
  maxEdge?: number;
  /** JPEG quality between 0 and 1. */
  quality?: number;
}

const DEFAULT_MAX_EDGE = 1600;
const DEFAULT_QUALITY = 0.8;

/**
 * Computes the target dimensions for an image so its longest edge does not
 * exceed `maxEdge`, preserving aspect ratio. Images already within bounds are
 * returned unchanged.
 */
export function computeScaledDimensions(
  width: number,
  height: number,
  maxEdge: number
): ScaledDimensions {
  const longest = Math.max(width, height);
  if (longest <= maxEdge) {
    return { width, height };
  }
  const ratio = maxEdge / longest;
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
}

/** Removes a `data:...;base64,` prefix, returning the raw base64 payload. */
export function stripBase64Prefix(dataUrl: string): string {
  const commaIndex = dataUrl.indexOf(',');
  if (dataUrl.startsWith('data:') && commaIndex !== -1) {
    return dataUrl.slice(commaIndex + 1);
  }
  return dataUrl;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}

/**
 * Compresses an image file into a JPEG data URL bounded by `maxEdge`/`quality`.
 * Runs in the browser only (uses canvas).
 */
export async function compressImageToBase64(
  file: File,
  options: CompressOptions = {}
): Promise<string> {
  const maxEdge = options.maxEdge ?? DEFAULT_MAX_EDGE;
  const quality = options.quality ?? DEFAULT_QUALITY;

  const img = await loadImage(file);
  const { width, height } = computeScaledDimensions(img.naturalWidth, img.naturalHeight, maxEdge);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas 2D context unavailable');
  }
  ctx.drawImage(img, 0, 0, width, height);

  return canvas.toDataURL('image/jpeg', quality);
}
