import type { MatchDecision } from '../../../agents/match';
import type { Logger, ReportEntry } from '../../../shared/lib/types';
import type { ProjectCategory } from '../../../../../lib/categories';

/** Agent selected from the CLI of the comparison harness. */
export type AgentKind = 'filter' | 'match' | 'category';

/** Parsed CLI arguments of the comparison harness. */
export interface CliArgs {
  /** Agent to compare (`filter` by default). */
  agent: AgentKind;

  /** Fixed Jev threshold; when omitted a sweep over the grid is performed. */
  threshold?: number;

  /** Maximum number of fixture cases to process. */
  limit?: number;
}

/** Run options shared by every comparison function. */
export interface CompareRunOptions {
  /** Fixed Jev threshold; when omitted the threshold sweep runs. */
  threshold?: number;

  /** Maximum number of fixture cases to load. */
  limit?: number;

  /** Pause between external calls, in milliseconds (defaults to 200). */
  delayMs?: number;

  /** Structured logger (defaults to stdout). */
  logger?: Logger;
}

/** A ground-truth fixture case together with its loaded report entry. */
export interface LoadedCase {
  /** Normalized post entry. */
  entry: ReportEntry;

  /** Expected relevance verdict of the fixture. */
  expected: boolean;

  /** Optional human note from the fixture. */
  note?: string;
}

/** A single labelled prediction used to compute binary metrics. */
export interface LabeledPrediction {
  /** Post id. */
  id: string;

  /** Ground-truth relevance. */
  expected: boolean;

  /** Predicted relevance. */
  predicted: boolean;
}

/** Confusion matrix for binary relevance (positive = relevant). */
export interface ConfusionMatrix {
  /** Expected relevant and predicted relevant. */
  tp: number;

  /** Expected not relevant but predicted relevant. */
  fp: number;

  /** Expected not relevant and predicted not relevant. */
  tn: number;

  /** Expected relevant but predicted not relevant. */
  fn: number;
}

/** Aggregated quality metrics of one backend or threshold. */
export interface BackendMetrics {
  /** Confusion matrix behind the metrics. */
  matrix: ConfusionMatrix;

  /** Share of correct predictions (0 when empty). */
  accuracy: number;

  /** Precision (`tp / (tp + fp)`, 0 when undefined). */
  precision: number;

  /** Recall (`tp / (tp + fn)`, 0 when undefined). */
  recall: number;

  /** Harmonic mean of precision and recall (0 when undefined). */
  f1: number;
}

/** A calibrated probability together with its ground-truth label. */
export interface ProbabilityPoint {
  /** Post id. */
  id: string;

  /** Ground-truth relevance. */
  expected: boolean;

  /** Calibrated probability of relevance (0..1). */
  probability: number;
}

/** Metrics of a single threshold of the sweep. */
export interface ThresholdScore extends BackendMetrics {
  /** Threshold the metrics were computed at. */
  threshold: number;
}

/** One row of the `filter` comparison. */
export interface FilterRow {
  /** Post id. */
  id: string;

  /** Ground-truth relevance. */
  expected: boolean;

  /** Jev relevance verdict at the run threshold. */
  jevRelevant: boolean;

  /** Jev calibrated probability, when available. */
  jevProbability?: number;

  /** LLM relevance verdict. */
  llmVerdict: boolean;

  /** Whether the Jev verdict matches the expectation. */
  jevMatches: boolean;

  /** Whether the LLM verdict matches the expectation. */
  llmMatches: boolean;
}

/** Full result of the `filter` comparison. */
export interface FilterComparison {
  /** Per-post rows. */
  rows: FilterRow[];

  /** Jev backend metrics. */
  jev: BackendMetrics;

  /** LLM backend metrics. */
  llm: BackendMetrics;

  /** Share of posts where Jev and LLM agree. */
  agreement: number;

  /** Threshold sweep over the saved probabilities (only without `--threshold`). */
  sweep?: ThresholdScore[];

  /** Optimal threshold by accuracy (first, then F1, then lower threshold). */
  bestByAccuracy?: ThresholdScore;

  /** Optimal threshold by F1 (first, then accuracy, then lower threshold). */
  bestByF1?: ThresholdScore;
}

/** One row of the `match` comparison. */
export interface MatchRow {
  /** Post id. */
  id: string;

  /** Jev decision. */
  jev: MatchDecision;

  /** LLM decision. */
  llm: MatchDecision;

  /** Whether both backends produced the same `action` + `slug`. */
  agree: boolean;
}

/** Full result of the `match` comparison. */
export interface MatchComparison {
  /** Per-post rows. */
  rows: MatchRow[];

  /** Share of posts where Jev and LLM agree. */
  agreement: number;
}

/** One row of the `category` comparison. */
export interface CategoryRow {
  /** Post id. */
  id: string;

  /** Jev category. */
  jev: ProjectCategory;

  /** LLM category. */
  llm: ProjectCategory;

  /** Whether both backends produced the same category. */
  agree: boolean;
}

/** Full result of the `category` comparison. */
export interface CategoryComparison {
  /** Per-post rows. */
  rows: CategoryRow[];

  /** Share of posts where Jev and LLM agree. */
  agreement: number;
}
