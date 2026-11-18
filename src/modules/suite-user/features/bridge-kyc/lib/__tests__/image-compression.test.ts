import { describe, it, expect } from 'vitest';

import { computeScaledDimensions, stripBase64Prefix } from '../image-compression';

/**
 * Tests for the pure helpers of image compression. The canvas/DOM pipeline in
 * `compressImageToBase64` is exercised at runtime in the browser; here we cover
 * the deterministic dimension math and the data-URL prefix handling.
 */

describe('computeScaledDimensions', () => {
  it('returns the source size unchanged when it is within the max edge', () => {
    expect(computeScaledDimensions(800, 600, 1600)).toEqual({
      width: 800,
      height: 600,
    });
  });

  it('scales down a landscape image to the max edge, preserving aspect ratio', () => {
    expect(computeScaledDimensions(3200, 2400, 1600)).toEqual({
      width: 1600,
      height: 1200,
    });
  });

  it('scales down a portrait image to the max edge, preserving aspect ratio', () => {
    expect(computeScaledDimensions(2400, 3200, 1600)).toEqual({
      width: 1200,
      height: 1600,
    });
  });

  it('rounds dimensions to whole pixels', () => {
    const { width, height } = computeScaledDimensions(1000, 333, 500);
    expect(Number.isInteger(width)).toBe(true);
    expect(Number.isInteger(height)).toBe(true);
    expect(width).toBe(500);
  });
});

describe('stripBase64Prefix', () => {
  it('removes a data-URL prefix', () => {
    expect(stripBase64Prefix('data:image/jpeg;base64,AAAA')).toBe('AAAA');
  });

  it('returns the input unchanged when there is no prefix', () => {
    expect(stripBase64Prefix('AAAA')).toBe('AAAA');
  });
});
