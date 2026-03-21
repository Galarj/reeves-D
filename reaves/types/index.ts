// REAVES — TypeScript interfaces for all data models

export interface TrustFactors {
  peer_reviewed: boolean;
  citation_count: number;
  author_hindex: number;
  recency_years: number;
  open_access: boolean;
}

export interface BiasFlag {
  bias_detected: boolean;
  bias_type: 'funding' | 'ideological' | 'publication' | 'geographic' | 'none';
  bias_note: string | null;
  severity: 'low' | 'medium' | 'high' | 'none';
  criteria?: string[];
}

export interface Source {
  id: string;
  title: string;
  authors: string;
  year: number;
  journal: string;
  trust_score: number;
  trust_factors: TrustFactors;
  trust_reason: string;
  abstract: string;
  doi: string;
  bias?: BiasFlag;
  saved?: boolean;
  simplified_abstract?: string;
}

export interface ResearchGap {
  gap: string;
  angle: string;
}

export interface SearchResult {
  sources: Source[];
  synthesis: string;
  agreements: string[];
  conflicts: string[];
  research_gaps: ResearchGap[];
}

export interface ClarifierResponse {
  ambiguous: boolean;
  clarifier_question: string;
  options: string[];
  refined_queries: string[];
}

export interface ThesisAngle {
  thesis: string;
  stance: string;
  supporting_sources: string[];
  gap_it_fills: string;
}

export interface ThesisResponse {
  angles: ThesisAngle[];
}

export type CitationFormat = 'APA' | 'MLA' | 'Chicago';

export interface NotebookEntry {
  id: string;
  source: Source;
  tag: string;
  user_note: string;
  saved_at: string;
  citation_format: CitationFormat;
}

export interface Notebook {
  id: string;
  name: string;
  description: string;
  entries: NotebookEntry[];
  created_at: string;
  updated_at: string;
}

export interface FollowUpMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface JargonResponse {
  simplified: string;
}

export interface ComparisonRow {
  metric: string;
  paper1: string;
  paper2: string;
  paper3?: string;
}

export interface CompareResponse {
  rows: ComparisonRow[];
}

export interface EvidenceResponse {
  answer: string;
  evidence_snippet: string | null;
  confidence_score: number;
  location_context: string;
  status: 'success' | 'no_evidence_found';
}
