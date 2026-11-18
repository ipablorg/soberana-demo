import { TypewriterText } from './TypewriterText';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  actions?: React.ReactNode;
  /** Inline status next to the title, e.g. a pending-items counter badge. */
  titleAccessory?: React.ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  actions,
  titleAccessory,
}: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex-1 space-y-1">
        <h1 className="text-2xl lg:text-3xl tracking-tight">
          <span className="font-semibold text-foreground">{title}.</span>
          {titleAccessory && (
            <span className="mx-2 inline-flex align-middle text-sm tracking-normal">
              {titleAccessory}
            </span>
          )}
          {' '}
          <span className="font-normal text-muted-foreground">
            <TypewriterText text={subtitle} speed={30} className="inline" />
          </span>
        </h1>
      </div>
      {actions && <div className="ml-4 shrink-0">{actions}</div>}
    </div>
  );
}
