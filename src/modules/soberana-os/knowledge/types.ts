export type RichBlockType =
  | 'flow-diagram'
  | 'state-timeline'
  | 'metric-cards'
  | 'step-list'
  | 'tool-grid'
  | 'info-cards'
  | 'risk-grid'
  | 'conversation';

export interface FlowNode {
  icon: string;
  label: string;
  sublabel?: string;
}

export interface MetricData {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export interface StepData {
  icon: string;
  title: string;
  description: string;
}

export interface ToolData {
  icon: string;
  name: string;
  description: string;
  example: string;
}

export interface InfoCardData {
  icon: string;
  title: string;
  description: string;
  metric?: string;
}

export interface RiskPairData {
  risk: string;
  riskDescription: string;
  safeguard: string;
  safeguardDescription: string;
}

export interface ChatBubbleData {
  role: 'user' | 'sovy';
  content: string;
}

export interface TimelineStateData {
  label: string;
  status: 'completed' | 'active' | 'pending';
}

export interface RichBlock {
  type: RichBlockType;
  data: FlowNode[] | MetricData[] | StepData[] | ToolData[] | InfoCardData[] | RiskPairData[] | ChatBubbleData[] | TimelineStateData[];
  position: 'before' | 'after';
  label?: string;
}

export interface KnowledgeEntry {
  id: string;
  topic: 'vaults' | 'sovy' | 'manifesto' | 'general';
  subtopic?: string;
  question: string;
  questionEs: string;
  aliases: string[];
  keywords: string[];
  response: string;
  responseEs: string;
  richBlocks?: RichBlock[];
  richBlocksEs?: RichBlock[];
  followUps: string[];
  depth: 'beginner' | 'intermediate' | 'technical';
}

export interface ConversationMessage {
  id: string;
  role: 'user' | 'soberana';
  content: string;
  timestamp: Date;
  suggestions?: string[];
  richBlocks?: RichBlock[];
  isTyping?: boolean;
}

export interface OsChatState {
  messages: ConversationMessage[];
  isTyping: boolean;
  currentTopic: string | null;
  sendMessage: (text: string) => void;
  selectSuggestion: (id: string) => void;
  reset: () => void;
}
