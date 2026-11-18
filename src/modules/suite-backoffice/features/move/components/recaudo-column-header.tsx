/**
 * Cell wrapper for a deposit-table column whose title is its own filter button.
 * It only aligns the button; the title and the filter live in the facet.
 */

import type { ReactNode } from 'react';

import { cn } from '@/shared/lib/utils';

interface RecaudoColumnHeaderProps {
  /** The column's `variant="column"` facet. */
  filter: ReactNode;
  align?: 'left' | 'right';
}

export function RecaudoColumnHeader({
  filter,
  align = 'left',
}: RecaudoColumnHeaderProps) {
  return (
    <div className={cn('flex items-center', align === 'right' && 'justify-end')}>
      {filter}
    </div>
  );
}
