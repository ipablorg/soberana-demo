/**
 * A list that shows its first items and a "y N más" toggle for the rest, so a
 * long provider checklist (KiraFin asks ~46 items) never stretches a table row
 * or clips its neighbours.
 */

import { useState } from 'react';
import { Trans } from '@lingui/react/macro';

interface CollapsibleItemListProps {
  items: readonly string[];
  /** Items shown while collapsed. */
  visible?: number;
}

export function CollapsibleItemList({ items, visible = 3 }: CollapsibleItemListProps) {
  const [expanded, setExpanded] = useState(false);
  const hidden = Math.max(items.length - visible, 0);
  const shown = expanded || hidden === 0 ? items : items.slice(0, visible);

  return (
    <div className="min-w-0 space-y-1">
      <ul className="list-disc space-y-0.5 pl-4 text-xs">
        {shown.map((item, index) => (
          <li key={`${index}-${item}`} className="break-words">
            {item}
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <button
          type="button"
          className="text-xs font-medium text-primary underline-offset-2 hover:underline"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? <Trans>Ver menos</Trans> : <Trans>y {hidden} más</Trans>}
        </button>
      ) : null}
    </div>
  );
}
