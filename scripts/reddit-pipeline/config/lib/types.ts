import type { DecisionBackend } from '../../engines/decision';

/** OpenRouter connection settings. */
export interface OpenRouterConfig {
  apiKey: string;
  baseUrl: string | undefined;
  defaultModel: string;
}

/** Resolved model per agent. */
export interface AgentModelsConfig {
  filter: string;
  match: string;
  create: string;
  update: string;
  category: string;
}

/** System One (Jev) connection settings. */
export interface DecisionConfig {
  baseUrl: string;
  model: string;
}

/** Decision backend selected per agent (`jev` or `llm`). */
export interface AgentBackendConfig {
  filter: DecisionBackend;
  match: DecisionBackend;
  category: DecisionBackend;
}

/** Confidence thresholds (0..1) applied per agent. */
export interface ThresholdConfig {
  filter: number;
  match: number;
  category: number;
}

/**
 * Pipeline execution mode.
 *
 * - `review` — `fetch → prefilter → filter`, then record the relevant posts
 *   into the review ledger (no `match`/`create`/`update`).
 * - `full` — the full `fetch → filter → match → create/update` cycle.
 * - `approve` — fetch the approved posts by id (no prefilter/filter) and run
 *   `match → category → create/update`.
 */
export type PipelineMode = 'review' | 'full' | 'approve';

/** Reddit fetch / processing settings. */
export interface RedditConfig {
  subreddit: string;
  lookbackHours: number;
  batchSize: number;
  maxPosts: number;
  dryRun: boolean;

  /** Whether the deterministic prefilter runs before the filter agent. */
  prefilter: boolean;

  /** Pipeline execution mode. */
  mode: PipelineMode;
}

/** Pull request settings consumed by the CI workflow. */
export interface PullRequestConfig {
  branch: string;
  base: string;
  labels: string[];
}

/** GitHub API settings. */
export interface GitHubConfig {
  token: string;
}

/** Fully resolved, typed application configuration. */
export interface AppConfig {
  openrouter: OpenRouterConfig;
  decisions: DecisionConfig;
  backends: AgentBackendConfig;
  thresholds: ThresholdConfig;
  models: AgentModelsConfig;
  reddit: RedditConfig;
  pr: PullRequestConfig;
  github: GitHubConfig;
}
