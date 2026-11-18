import type { ReactNode } from 'react';

interface SectionHeaderProps {
  /** Bold declarative fragment, e.g. "Customers." */
  title: string;
  /** Lighter explanatory fragment. */
  subtitle?: string;
  /** Primary action of the page (one at most). */
  action?: ReactNode;
}

/** Two-tone page header (Soberana UX): bold title + muted explanation, optional action. */
export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <h1 className="text-2xl tracking-tight lg:text-3xl">
        <span className="font-semibold text-foreground">{title}</span>
        {subtitle ? (
          <>
            {' '}
            <span className="font-normal text-muted-foreground">{subtitle}</span>
          </>
        ) : null}
      </h1>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
