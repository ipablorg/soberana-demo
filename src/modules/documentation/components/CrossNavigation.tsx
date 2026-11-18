import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, ArrowLeft } from '@/shared/components/animated-icons';
import { cn } from '@/shared/lib/utils';

export interface NavItem {
  icon: string;
  title: string;
  description: string;
  href: string;
}

export interface CrossNavigationProps {
  items: NavItem[];
  backLabel?: string;
  backHref?: string;
  className?: string;
}

export function CrossNavigation({
  items,
  backLabel = '← Back to Soberana Docs',
  backHref = '/docs',
  className,
}: CrossNavigationProps) {
  return (
    <nav className={cn('mt-16 pt-10 border-t border-border/50', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, i) => (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
          >
            <Link
              to={item.href}
              className={cn(
                'group flex items-start gap-3 rounded-xl border border-border/40',
                'bg-card/60 backdrop-blur-md p-5',
                'transition-colors duration-150',
              )}
            >
              <span className="text-2xl shrink-0 leading-none mt-0.5">
                {item.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {item.title}
                  </h4>
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 -translate-x-1 transition-colors duration-150 group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  {item.description}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          to={backHref}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel}
        </Link>
      </div>
    </nav>
  );
}
