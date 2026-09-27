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
}

/** Reddit fetch / processing settings. */
export interface RedditConfig {
  subreddit: string;
  lookbackHours: number;
  batchSize: number;
  maxPosts: number;
  dryRun: boolean;
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
  models: AgentModelsConfig;
  reddit: RedditConfig;
  pr: PullRequestConfig;
  github: GitHubConfig;
}
