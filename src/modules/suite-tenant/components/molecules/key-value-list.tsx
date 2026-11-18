import type { ReactNode } from 'react';

export interface KeyValueItem {
  label: string;
  value: ReactNode;
  /** Monospaced, tabular value (ids, amounts, keys). */
  mono?: boolean;
}

interface KeyValueListProps {
  items: readonly KeyValueItem[];
}

/** Label/value grid for detail cards. */
export function KeyValueList({ items }: KeyValueListProps) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="min-w-0 space-y-1">
          <dt className="text-xs font-medium text-muted-foreground">{item.label}</dt>
          <dd
            className={
              item.mono
                ? 'break-all font-mono text-sm tabular-nums text-foreground'
                : 'break-words text-sm text-foreground'
            }
          >
            {item.value ?? '—'}
          </dd>
        </div>
      ))}
    </dl>
  );
}
