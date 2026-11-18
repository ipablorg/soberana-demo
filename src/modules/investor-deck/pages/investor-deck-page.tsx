import { DeckLangProvider } from "../data/deck-lang-context";
import { SlideLayout } from "../layouts/SlideLayout";
import { SlideRenderer } from "../components/SlideRenderer";
import { TitleSlide } from "../components/slides/TitleSlide";
import { ProblemSlide } from "../components/slides/ProblemSlide";
import { InflationSlide } from "../components/slides/InflationSlide";
import { MonetarySovereigntySlide } from "../components/slides/MonetarySovereigntySlide";
import { DevaluationProductsSlide } from "../components/slides/DevaluationProductsSlide";
import { MarketOpportunitySlide } from "../components/slides/MarketOpportunitySlide";
import { CompetitorsExitsSlide } from "../components/slides/CompetitorsExitsSlide";
import { AsiaOpportunitySlide } from "../components/slides/AsiaOpportunitySlide";
import { SolutionOverviewSlide } from "../components/slides/SolutionOverviewSlide";
import { ProductArchitectureSlide } from "../components/slides/ProductArchitectureSlide";
import { VaultsOverviewSlide } from "../components/slides/VaultsOverviewSlide";
import { VaultsDeepDiveSlide } from "../components/slides/VaultsDeepDiveSlide";
import { ZentinelOverviewSlide } from "../components/slides/ZentinelOverviewSlide";
import { ZentinelDeepDiveSlide } from "../components/slides/ZentinelDeepDiveSlide";
import { ClientsSlide } from "../components/slides/ClientsSlide";
import { BusinessModelSlide } from "../components/slides/BusinessModelSlide";
import { TractionSlide } from "../components/slides/TractionSlide";
import { UseOfFundsSlide } from "../components/slides/UseOfFundsSlide";
import { AskSlide } from "../components/slides/AskSlide";
import { ClosingSlide } from "../components/slides/ClosingSlide";

export default function InvestorDeckPage() {
  return (
    <DeckLangProvider>
      <SlideLayout>
        <SlideRenderer>
          <TitleSlide />
          <ProblemSlide />
          <InflationSlide />
          <MonetarySovereigntySlide />
          <DevaluationProductsSlide />
          <MarketOpportunitySlide />
          <CompetitorsExitsSlide />
          <AsiaOpportunitySlide />
          <SolutionOverviewSlide />
          <ProductArchitectureSlide />
          <VaultsOverviewSlide />
          <VaultsDeepDiveSlide />
          <ZentinelOverviewSlide />
          <ZentinelDeepDiveSlide />
          <ClientsSlide />
          <BusinessModelSlide />
          <TractionSlide />
          <UseOfFundsSlide />
          <AskSlide />
          <ClosingSlide />
        </SlideRenderer>
      </SlideLayout>
    </DeckLangProvider>
  );
}
