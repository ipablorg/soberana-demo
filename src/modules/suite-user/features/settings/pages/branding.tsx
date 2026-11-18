import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from '@/shared/components/animated-icons';
import { Button } from '@/shared/components/ui/button';
import { BrandingStudioForm } from '@/shared/components/common/BrandingStudioForm';
import { BrandingPreviewWidget } from '@/shared/components/common/BrandingPreviewWidget';
import { useBrandingTheme } from '@/shared/hooks/use-branding-theme';
import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';

/**
 * Branding Studio Page
 * 
 * Dedicated page for white-label branding customization.
 * Allows merchants to configure their brand appearance for end-users.
 */
export default function Branding() {
  const { config, isLoading } = useBrandingTheme();
  const navigate = useNavigate();
  const { t } = useLingui();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/suite/dashboard')}
              className="h-9 w-9"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
                <Sparkles className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-heading text-foreground">{t`Branding Studio`}</h1>
                <p className="text-sm text-muted-foreground">
                  {t`Customize your brand appearance`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-muted-foreground">{t`Loading configuration...`}</p>
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column: Form */}
                <div className="space-y-6">
                  <div className="rounded-xl bg-card border border-border p-6 shadow-sm">
                    <BrandingStudioForm />
                  </div>
                </div>

                {/* Right Column: Live Preview */}
                <div className="space-y-6">
                  <motion.div
                    layout
                    className="sticky top-6 rounded-xl bg-card border border-border p-6 shadow-sm"
                  >
                    <BrandingPreviewWidget config={config} />
                  </motion.div>
                </div>
              </div>

              {/* Additional Help Section */}
              <div className="mt-8 rounded-xl bg-muted/50 border border-border p-6">
                <h3 className="text-sm font-semibold text-foreground mb-3">
                  💡 {t`Design Tips`}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-muted-foreground">
                  <div>
                    <strong className="text-foreground">{t`Contrast:`}</strong> {t`Ensure text is readable on selected backgrounds.`}
                  </div>
                  <div>
                    <strong className="text-foreground">{t`Consistency:`}</strong> {t`Use colors from your brand guidelines.`}
                  </div>
                  <div>
                    <strong className="text-foreground">{t`Professionalism:`}</strong> {t`Blues and greens convey trust in fintech.`}
                  </div>
                  <div>
                    <strong className="text-foreground">{t`Logo:`}</strong> {t`Use transparent PNG for best results (200x50px recommended).`}
                  </div>
                  <div>
                    <strong className="text-foreground">{t`Preview:`}</strong> {t`All changes are reflected instantly in the preview.`}
                  </div>
                  <div>
                    <strong className="text-foreground">{t`Save:`}</strong> {t`Don't forget to click "Save Changes" when finished.`}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

