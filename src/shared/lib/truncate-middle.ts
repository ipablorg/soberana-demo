/**
 * Shortens long opaque identifiers (wallet ids, provider event ids, hashes) by
 * keeping the start and the end, which is what operators compare by eye.
 *
 * The value is returned untouched when the truncated form would not be
 * strictly shorter than the original, so short ids never gain an ellipsis.
 */

const ELLIPSIS = '…';

function toCount(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
}

export function truncateMiddle(
  value: string | null | undefined,
  head = 8,
  tail = 4,
): string {
  if (!value) return '';

  const headCount = toCount(head);
  const tailCount = toCount(tail);

  if (value.length <= headCount + tailCount + ELLIPSIS.length) return value;

  const start = value.slice(0, headCount);
  const end = tailCount > 0 ? value.slice(-tailCount) : '';

  return `${start}${ELLIPSIS}${end}`;
}
