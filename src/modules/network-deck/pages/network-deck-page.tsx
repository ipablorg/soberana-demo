import { DeckLangProvider } from "../data/deck-lang-context";
import { NetworkSlideLayout } from "../layouts/network-slide-layout";
import { NetworkSlideRenderer } from "../components/network-slide-renderer";
import { NetworkTitleSlide } from "../components/slides/network-title-slide";
import { NetworkWhyNowSlide } from "../components/slides/network-why-now-slide";
import { NetworkProblemSlide } from "../components/slides/network-problem-slide";
import { NetworkModelSlide } from "../components/slides/network-platform-anatomy-slide";
import { NetworkTransferSlide } from "../components/slides/network-mechanics-slide";
import { NetworkProofSlide } from "../components/slides/network-live-infra-slide";
import { NetworkTractionTeamSlide } from "../components/slides/network-traction-team-slide";
import { NetworkFlywheelSlide } from "../components/slides/network-business-model-slide";
import { NetworkAlternativesSlide } from "../components/slides/network-alternatives-slide";
import { NetworkMarketSlide } from "../components/slides/network-market-slide";
import { NetworkSeatMapSlide } from "../components/slides/network-seat-map-slide";
import { NetworkJoinSlide } from "../components/slides/network-dual-safe-slide";
import { NetworkAskSlide } from "../components/slides/network-ask-slide";
import { NetworkClosingSlide } from "../components/slides/network-closing-slide";
import { NetworkRulebookAppendixSlide } from "../components/slides/network-consolidation-slide";

export default function NetworkDeckPage() {
  return (
    <DeckLangProvider>
      <NetworkSlideLayout>
        <NetworkSlideRenderer>
          <NetworkTitleSlide />
          <NetworkWhyNowSlide />
          <NetworkProblemSlide />
          <NetworkModelSlide />
          <NetworkTransferSlide />
          <NetworkProofSlide />
          <NetworkTractionTeamSlide />
          <NetworkFlywheelSlide />
          <NetworkAlternativesSlide />
          <NetworkMarketSlide />
          <NetworkSeatMapSlide />
          <NetworkJoinSlide />
          <NetworkAskSlide />
          <NetworkClosingSlide />
          <NetworkRulebookAppendixSlide />
        </NetworkSlideRenderer>
      </NetworkSlideLayout>
    </DeckLangProvider>
  );
}
