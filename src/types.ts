export interface ProConItem {
  id: string;
  text: string;
  weight: number; // 1 (minor) to 5 (critical)
  category?: string;
}

export interface OptionProsCons {
  pros: ProConItem[];
  cons: ProConItem[];
}

export interface ProsConsResult {
  option1: OptionProsCons;
  option2: OptionProsCons;
}

export interface ComparisonCriterion {
  id: string;
  category: string;
  title: string;
  description: string;
  weight: number; // 1 to 5
  option1Score: number; // 1 to 10
  option1Note: string;
  option2Score: number; // 1 to 10
  option2Note: string;
}

export interface SWOTQuadrant {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface SWOTResult {
  option1: SWOTQuadrant;
  option2: SWOTQuadrant;
}

export interface DecisionVerdict {
  winner: 'option1' | 'option2' | 'tie';
  winnerTitle: string;
  confidenceScore: number; // 0 - 100%
  summary: string;
  keyDrivers: string[];
  tradeOffSummary: string;
  recommendedNextSteps: string[];
}

export interface AnalysisResult {
  id: string;
  createdAt: string;
  option1Title: string;
  option2Title: string;
  context?: string;
  prosCons: ProsConsResult;
  comparisonTable: ComparisonCriterion[];
  swot: SWOTResult;
  verdict: DecisionVerdict;
}

export type ActiveTab = 'all' | 'pros-cons' | 'comparison' | 'swot' | 'verdict';

export interface PresetExample {
  id: string;
  name: string;
  category: string;
  option1: string;
  option2: string;
  context: string;
}
