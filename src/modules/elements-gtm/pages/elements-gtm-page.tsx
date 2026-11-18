import { GtmLayout } from "../layouts/gtm-layout";
import { GtmRenderer } from "../components/gtm-renderer";
import { TitleSlide } from "../components/slides/title-slide";
import { ProblemSlide } from "../components/slides/problem-slide";
import { MarketSlide } from "../components/slides/market-slide";
import { SolutionSlide } from "../components/slides/solution-slide";
import { CompetitorsSlide } from "../components/slides/competitors-slide";
import { GTMStrategySlide } from "../components/slides/gtm-strategy-slide";
import { PartnersSlide } from "../components/slides/partners-slide";
import { PartnershipTiersSlide } from "../components/slides/partnership-tiers-slide";
import { ZentinelSlide } from "../components/slides/zentinel-slide";
import { TractionSlide } from "../components/slides/traction-slide";
import { BusinessModelSlide } from "../components/slides/business-model-slide";
import { RoadmapSlide } from "../components/slides/roadmap-slide";
import { ClosingSlide } from "../components/slides/closing-slide";

export default function ElementsGtmPage() {
  return (
    <GtmLayout>
      <GtmRenderer>
        <TitleSlide />
        <ProblemSlide />
        <MarketSlide />
        <SolutionSlide />
        <CompetitorsSlide />
        <GTMStrategySlide />
        <PartnersSlide />
        <PartnershipTiersSlide />
        <ZentinelSlide />
        <TractionSlide />
        <BusinessModelSlide />
        <RoadmapSlide />
        <ClosingSlide />
      </GtmRenderer>
    </GtmLayout>
  );
}
