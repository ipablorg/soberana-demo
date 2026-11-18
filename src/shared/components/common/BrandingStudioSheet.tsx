import { motion, AnimatePresence } from 'framer-motion';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/shared/components/ui/sheet';
import { BrandingStudioForm } from './BrandingStudioForm';
import { BrandingPreviewWidget } from './BrandingPreviewWidget';
import { useBrandingTheme } from '@/shared/hooks/use-branding-theme';
import { Sparkles } from '@/shared/components/animated-icons';
import { useLingui } from '@lingui/react/macro';

interface BrandingStudioSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * BrandingStudioSheet
 * 
 * Side drawer containing the White-Label Branding Studio.
 * Displays configuration form and live preview side-by-side (desktop) or stacked (mobile).
 */
export function BrandingStudioSheet({ open, onOpenChange }: BrandingStudioSheetProps) {
  const { config, isLoading } = useBrandingTheme();
  const { t } = useLingui();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl lg:max-w-4xl overflow-y-auto"
      >
        <SheetHeader className="space-y-3 pb-6 border-b border-border">
          <SheetTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            {t`Branding Studio`}
          </SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">
            {t`Customize your brand appearance for the end-user view. Upload your logo, define your app name, and choose your brand colors with live preview.`}
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-muted-foreground">{t`Loading configuration...`}</p>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key="branding-content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="mt-6 space-y-8"
            >
              {/* Desktop: Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Form */}
                <div className="space-y-6">
                  <div className="rounded-lg bg-card/50 backdrop-blur-sm border border-border p-6">
                    <BrandingStudioForm onSave={() => onOpenChange(false)} />
                  </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="space-y-6">
                  <motion.div
                    layout
                    className="sticky top-6 rounded-lg bg-card/50 backdrop-blur-sm border border-border p-6"
                  >
                    <BrandingPreviewWidget config={config} />
                  </motion.div>
                </div>
              </div>

              {/* Information Banner */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="rounded-xl bg-muted/50 border border-border p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <h4 className="text-sm font-semibold text-foreground">
                      {t`White-Label Architecture`}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {t`These settings apply exclusively to the End-User View that your customers will see. The Backoffice Admin Panel maintains its own independent theme. All changes are stored locally and can be reset at any time.`}
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </SheetContent>
    </Sheet>
  );
}

