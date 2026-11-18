/**
 * Soberana Vaults — Main Page
 * Assembles all 12 sections in order.
 * Route: /docs/soberana-vaults
 */

import { HeroSection } from '../components/HeroSection';
import { WhatIsVaultSection } from '../components/WhatIsVaultSection';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { StrategyEngineSection } from '../components/StrategyEngineSection';
import { TechStackSection } from '../components/TechStackSection';
import { LiveDashboardSection } from '../components/LiveDashboardSection';
import { JourneyTimeline } from '../components/JourneyTimeline';
import { TechnicalDeepDive } from '../components/TechnicalDeepDive';
import { GrowthProjection } from '../components/GrowthProjection';
import { RisksSafeguards } from '../components/RisksSafeguards';
import { FeesBreakdown } from '../components/FeesBreakdown';
import { FaqSection } from '../components/FaqSection';

export default function SoberanaVaultsPage() {
  return (
    <div className="space-y-24 pb-24">
      <HeroSection />
      <WhatIsVaultSection />
      <HowItWorksSection />
      <StrategyEngineSection />
      <TechStackSection />
      <LiveDashboardSection />
      <JourneyTimeline />
      <TechnicalDeepDive />
      <GrowthProjection />
      <RisksSafeguards />
      <FeesBreakdown />
      <FaqSection />
    </div>
  );
}
