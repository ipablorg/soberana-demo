/* ============================================================
   Soberana Network — Investor Deck content types
   Shared between EN and ES files. Keep keys identical.
   ============================================================ */

export interface TitleContent {
  kicker: string;
  headline: string;
  positioning: string;
  oneLiner: string;
  number: string;
  numberLabel: string;
  contactHint: string;
}

export interface WhyNowDeal {
  year: string;
  amount: string;
  deal: string;
  source: string;
}

export interface WhyNowContent {
  sectionLabel: string;
  headline: string;
  deals: WhyNowDeal[];
  emptyLabel: string;
  emptyValue: string;
  regChips: string[];
}

export interface ProblemContent {
  sectionLabel: string;
  headline: string;
  nodeLabel: string;
  costChips: string[];
  perCorridorLabel: string;
}

export interface ModelMember {
  label: string;
  country: string;
}

export interface ModelContent {
  sectionLabel: string;
  headline: string;
  precedentLead: string;
  hubLabel: string;
  hubSub: string;
  hubDetail: string;
  ownRingLabel: string;
  members: ModelMember[];
  keepLabel: string;
  keepChips: string[];
  gainLabel: string;
  gainChips: string[];
}

export interface TransferLane {
  label: string;
  actor: string;
  sub: string;
}

export interface TransferContent {
  sectionLabel: string;
  headline: string;
  lanes: TransferLane[];
  stampLabel: string;
}

export interface ProofRail {
  market: string;
  rails: string;
}

export interface ProofStat {
  value: string;
  label: string;
}

export interface ProofContent {
  sectionLabel: string;
  headline: string;
  number: string;
  numberLabel: string;
  rails: ProofRail[];
  nextChip: string;
  nextSub: string;
  stats: ProofStat[];
  clientsLabel: string;
  clients: string[];
}

export interface FounderCard {
  name: string;
  role: string;
  bio: string;
  proofChip: string;
  photo: string;
}

export interface FoundersContent {
  sectionLabel: string;
  headline: string;
  founders: FounderCard[];
  /** @deprecated use founder.photo — kept for closing-slide back-compat */
  photoDiego: string;
  /** @deprecated use founder.photo — kept for closing-slide back-compat */
  photoCarlos: string;
  /** e.g. "30+ people building Soberana." — shown as a chip below the grid */
  teamNote: string;
  awardNote: string;
}

export interface FlywheelContent {
  sectionLabel: string;
  headline: string;
  centerTitle: string;
  centerWords: string[];
  steps: string[];
  note: string;
}

export type HarveyCell = "full" | "half" | "empty" | "bad" | "dot" | "seat";

export interface AlternativesRow {
  label: string;
  sublabel?: string;
  cells: HarveyCell[];
}

export interface AlternativesContent {
  sectionLabel: string;
  headline: string;
  columns: string[];
  rows: AlternativesRow[];
  closingChip: string;
}

export interface MarketCircle {
  value: string;
  year: string;
  source: string;
}

export interface RegionalChip {
  label: string;
  value: string;
}

export interface MarketContent {
  sectionLabel: string;
  headline: string;
  circles: MarketCircle[];
  regionalChips: RegionalChip[];
}

export interface SeatRow {
  market: string;
  rails: string;
  taken: boolean;
  dim?: boolean;
}

export interface SeatRoute {
  tag: string;
  title: string;
  detail: string;
}

export interface SeatsContent {
  sectionLabel: string;
  headline: string;
  seats: SeatRow[];
  honestLine: string;
  routes: SeatRoute[];
}

export interface JoinStep {
  n: string;
  title: string;
  detail: string;
}

export interface Commitment {
  title: string;
  precedent: string;
}

export interface JoinContent {
  sectionLabel: string;
  headline: string;
  steps: JoinStep[];
  commitmentsLabel: string;
  commitments: Commitment[];
  publishesLabel: string;
  publishes: string;
  applyCta: string;
  applyMailto: string;
}

export interface FundSlice {
  label: string;
  pct: number;
}

export interface Milestone {
  period: string;
  milestone: string;
}

export interface AskContent {
  sectionLabel: string;
  headline: string;
  terms: string;
  fundsLabel: string;
  funds: FundSlice[];
  milestonesLabel: string;
  milestones: Milestone[];
  edgeLine: string;
  contactCta: string;
  docsCta: string;
}

export interface ClosingContent {
  sectionLabel: string;
  headline: string;
  edgeLine: string;
  contactEmail: string;
  docsUrl: string;
  disclaimer: string;
}

export interface RulebookCommitment {
  title: string;
  body: string;
  precedent: string;
}

export interface RulebookAppendixContent {
  sectionLabel: string;
  headline: string;
  commitmentsTitle: string;
  commitments: RulebookCommitment[];
  whoQualifiesTitle: string;
  whoQualifies: string[];
  publishesTitle: string;
  publishes: string[];
  note: string;
}

export interface NetworkDeckContent {
  title: TitleContent;
  whyNow: WhyNowContent;
  problem: ProblemContent;
  model: ModelContent;
  transfer: TransferContent;
  proof: ProofContent;
  founders: FoundersContent;
  flywheel: FlywheelContent;
  alternatives: AlternativesContent;
  market: MarketContent;
  seats: SeatsContent;
  join: JoinContent;
  ask: AskContent;
  closing: ClosingContent;
  rulebookAppendix: RulebookAppendixContent;
}
