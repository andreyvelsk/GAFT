import type { ModelUsage } from '../../../shared/lib/types';

/** Backend that resolves typed decisions. */
export type DecisionBackend = 'jev' | 'llm';

/** Yes/no question with optional descriptions of both outcomes. */
export interface NoulQuestion {
  type: 'noul';
  instructions: string;
  criteria?: { true: string; false: string };
}

/** Question that selects between named alternatives. */
export interface ChoiceQuestion {
  type: 'choice';
  instructions: string;
  criteria: Record<string, string>;
}

/** Question that assigns a score against an ordered rubric. */
export interface ScoreQuestion {
  type: 'score';
  instructions: string;
  criteria: string[];
}

/** Any question understood by the decision port. */
export type DecisionQuestion = NoulQuestion | ChoiceQuestion | ScoreQuestion;

/** Yes/no answer carrying a calibrated probability. */
export interface NoulAnswer {
  type: 'noul';
  noul: number;
}

/** Answer that selected one of the offered alternatives. */
export interface ChoiceAnswer {
  type: 'choice';
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

/** Answer that assigned a score, optionally with a rubric legend. */
export interface ScoreAnswer {
  type: 'score';
  score: number;
  confidence: number;
  probabilities: Record<string, number>;
  legend?: Record<string, string>;
}

/** Any answer returned by the decision port. */
export type DecisionAnswer = NoulAnswer | ChoiceAnswer | ScoreAnswer;

/** A single decision request: the state plus named questions. */
export interface DecisionRequest {
  state: unknown;
  questions: Record<string, DecisionQuestion>;
}

/**
 * Token and cost usage of a decision request. Shares the shape of
 * {@link ModelUsage}: `cost` is optional because the LLM backend only reports
 * tokens (its cost is estimated later from the model price).
 */
export type DecisionUsage = ModelUsage;

/** Answers keyed by question name, with model and usage metadata. */
export interface DecisionResult {
  answers: Record<string, DecisionAnswer>;
  model: string;
  usage?: DecisionUsage;
}

/** Capability that answers typed questions about a given state. */
export interface DecisionPort {
  decide(request: DecisionRequest): Promise<DecisionResult>;
}
