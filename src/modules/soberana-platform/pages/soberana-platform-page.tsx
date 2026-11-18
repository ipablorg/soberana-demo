import { useCallback } from 'react';
import { Separator } from '@/shared/components/ui/separator';
import { useLingui } from '@lingui/react/macro';
import { PlatformShowcaseLayout } from '../layouts/PlatformShowcaseLayout';
import { PlatformHero } from '../components/PlatformHero';
import { PlatformMetrics } from '../components/PlatformMetrics';
import { ComparisonTable } from '../components/ComparisonTable';
import { ProductModules } from '../components/ProductModules';
import { ProductDetailSection } from '../components/ProductDetailSection';
import { HowItWorks } from '../components/HowItWorks';
import { ClientBenefits } from '../components/ClientBenefits';
import { RegionalCoverage } from '../components/RegionalCoverage';
import { CTASection } from '../components/CTASection';

export default function SoberanaPlatformPage() {
  const { t } = useLingui();

  const scrollToSection = useCallback((anchor: string) => {
    const id = anchor.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleGetStarted = useCallback(() => scrollToSection('#cta'), [scrollToSection]);
  const handleViewProducts = useCallback(() => scrollToSection('#products'), [scrollToSection]);

  const handleBook = useCallback(() => {
    window.open(`mailto:sales@loopay.com?subject=${encodeURIComponent(t`Demo Request — Soberana Platform`)}`, '_blank');
  }, [t]);

  const handleContact = useCallback(() => {
    window.open(`mailto:sales@loopay.com?subject=${encodeURIComponent(t`Sales Inquiry — Soberana Platform`)}`, '_blank');
  }, [t]);

  return (
    <PlatformShowcaseLayout>
      <PlatformHero onGetStarted={handleGetStarted} onViewProducts={handleViewProducts} />

      <Separator />

      <PlatformMetrics />

      <Separator />

      <ComparisonTable />

      <Separator />

      <ProductModules />

      <ProductDetailSection />

      <Separator />

      <HowItWorks />

      <Separator />

      <ClientBenefits />

      <Separator />

      <RegionalCoverage />

      <Separator />

      <CTASection onBook={handleBook} onContact={handleContact} />
    </PlatformShowcaseLayout>
  );
}
