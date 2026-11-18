import { useEffect } from 'react';
import { useBrandingStore } from '@/shared/stores/useBrandingStore';

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const colors = useBrandingStore((s) => s.config.colors);
  const appName = useBrandingStore((s) => s.config.appName);

  useEffect(() => {
    const root = document.documentElement;

    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--ring', colors.primary);
    root.style.setProperty('--sidebar-primary', colors.primary);
    root.style.setProperty('--sidebar-accent', colors.primary);
    root.style.setProperty('--sidebar-ring', colors.primary);

    root.style.setProperty('--accent-brand', colors.accent);

    root.style.setProperty(
      '--gradient-border',
      `linear-gradient(135deg, hsl(${colors.primary}) 0%, hsl(${colors.accent}) 100%)`
    );
    root.style.setProperty(
      '--gradient-brand',
      `linear-gradient(135deg, hsl(${colors.primary} / 0.1) 0%, hsl(${colors.accent} / 0.1) 100%)`
    );
  }, [colors]);

  useEffect(() => {
    if (appName && appName !== 'Loopay') {
      document.title = document.title.replace(/Loopay/g, appName);
    }
  }, [appName]);

  return <>{children}</>;
}
