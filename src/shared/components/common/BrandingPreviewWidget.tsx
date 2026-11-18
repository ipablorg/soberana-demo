import { CreditCard, Wallet } from '@/shared/components/animated-icons';
import { motion } from 'framer-motion';
import { BrandingConfig } from '@/shared/hooks/use-branding-theme';
import soberanaLogoCompact from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 1.png';
import soberanaLogoWide from '@/shared/assets/soberana_logos/SOBERANA By Loopay blanco 2.png';
import { useLingui } from '@lingui/react/macro';

interface BrandingPreviewWidgetProps {
  config: BrandingConfig;
}

/**
 * BrandingPreviewWidget
 * 
 * Live preview of how the merchant's branding will appear to end-users.
 * Displays a User Wallet card with customized logo, app name, and colors.
 * Uses scoped CSS variables to prevent global theme contamination.
 */
export function BrandingPreviewWidget({ config }: BrandingPreviewWidgetProps) {
  const { logo, appName, colors } = config;
  const { t } = useLingui();

  // Create scoped CSS variables for this preview only
  const previewStyles = {
    '--preview-primary': colors.primary,
    '--preview-accent': colors.accent,
    '--preview-surface': colors.surface,
  } as React.CSSProperties;

  return (
    <div className="branding-preview-wrapper w-full" style={previewStyles}>
      {/* Preview Label */}
      <div className="mb-4">
        <span className="text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
          {t`Live Preview`}
        </span>
        <p className="mt-1 text-sm text-muted-foreground">
          {t`This is how your customers will see it`}
        </p>
      </div>

      {/* Wallet Card Preview */}
      <motion.div
        layout
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-xl border border-border/50 backdrop-blur-xl shadow-sm"
        style={{
          background: `color-mix(in oklch, var(--preview-surface) 50%, transparent)`,
        }}
      >
        {/* Gradient Overlay */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `linear-gradient(135deg, 
              color-mix(in oklch, var(--preview-primary) 30%, transparent) 0%, 
              color-mix(in oklch, var(--preview-accent) 20%, transparent) 100%)`,
          }}
        />

        {/* Card Content */}
        <div className="relative p-6 space-y-6">
          {/* Header: Logo + App Name */}
          <div className="flex items-center gap-3">
            <motion.div
              key={logo || 'default'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="shrink-0"
            >
              {logo ? (
                <img 
                  src={logo} 
                  alt={appName}
                  className="h-10 w-auto object-contain"
                />
                ) : (
                <>
                  <img src={soberanaLogoCompact} alt="Soberana" className="h-10 w-auto object-contain dark:hidden" />
                  <img src={soberanaLogoWide} alt="Soberana" className="h-10 w-auto object-contain hidden dark:block" />
                </>
              )}
            </motion.div>
            <motion.div
              key={appName}
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-lg font-bold text-foreground">
                {appName}
              </h3>
              <p className="text-xs text-muted-foreground">{t`Digital Wallet`}</p>
            </motion.div>
          </div>

          {/* Balance Section */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{t`Available Balance`}</span>
            </div>
            <motion.div
              layout
              className="text-4xl font-bold font-mono tabular-nums"
              style={{ color: `var(--preview-primary)` }}
            >
              $12,450.00
            </motion.div>
          </div>

          {/* Card Info */}
          <div 
            className="rounded-xl p-4 backdrop-blur-sm"
            style={{
              background: `color-mix(in oklch, var(--preview-accent) 10%, transparent)`,
              border: `1px solid color-mix(in oklch, var(--preview-accent) 30%, transparent)`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-muted-foreground">{t`Primary Card`}</span>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <div className="text-sm font-mono text-foreground">
                •••• •••• •••• 4242
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{t`Valid Thru`}</span>
                <span className="font-mono">12/28</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              className="rounded-lg px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors duration-150"
              style={{
                background: `var(--preview-primary)`,
              }}
            >
              {t`Send Money`}
            </button>
            <button
              className="rounded-lg px-4 py-2.5 text-sm font-medium transition-colors duration-150"
              style={{
                background: `color-mix(in oklch, var(--preview-accent) 15%, transparent)`,
                color: `var(--preview-accent)`,
                border: `1px solid color-mix(in oklch, var(--preview-accent) 30%, transparent)`,
              }}
            >
              {t`Request`}
            </button>
          </div>
        </div>

        {/* Bottom Accent Bar */}
        <div 
          className="h-1.5"
          style={{
            background: `linear-gradient(90deg, 
              var(--preview-primary) 0%, 
              var(--preview-accent) 100%)`,
          }}
        />
      </motion.div>

      {/* Preview Footer Note */}
      <div className="mt-4 rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
        <strong className="text-foreground">{t`Note:`}</strong> {t`This preview shows how your brand will appear in the customer-facing wallet interface. Changes are applied instantly.`}
      </div>
    </div>
  );
}

