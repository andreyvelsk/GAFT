import { z } from 'zod';

import {
  DEFAULT_BATCH_SIZE,
  DEFAULT_LOOKBACK_HOURS,
  DEFAULT_MAX_POSTS,
  DEFAULT_MODELS,
  DEFAULT_PR_BASE,
  DEFAULT_PR_BRANCH,
  DEFAULT_PR_LABELS,
  DEFAULT_SUBREDDIT,
} from '../shared/lib/constants';
import type { AppConfig } from './lib/types';

/** Read an env var, treating missing/blank values as `undefined`. */
function envValue(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name];
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  return value;
}

/** Parse a boolean-ish env var, rejecting unknown values. */
const booleanFromEnv = z
  .string()
  .default('false')
  .transform((value) => value.trim().toLowerCase())
  .pipe(z.enum(['true', 'false', '1', '0', 'yes', 'no']))
  .transform((value) => value === 'true' || value === '1' || value === 'yes');

const envSchema = z.object({
  OPENROUTER_API_KEY: z.string().default(''),
  OPENROUTER_BASE_URL: z.string().default(''),
  OPENROUTER_DEFAULT_MODEL: z.string().default(''),
  REDDIT_FILTER_MODEL: z.string().default(''),
  REDDIT_MATCH_MODEL: z.string().default(''),
  REDDIT_CREATE_MODEL: z.string().default(''),
  REDDIT_UPDATE_MODEL: z.string().default(''),
  REDDIT_SUBREDDIT: z.string().default(DEFAULT_SUBREDDIT),
  REDDIT_LOOKBACK_HOURS: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_LOOKBACK_HOURS),
  REDDIT_BATCH_SIZE: z.coerce
    .number()
    .int()
    .positive()
    .default(DEFAULT_BATCH_SIZE),
  REDDIT_MAX_POSTS: z.coerce
    .number()
    .int()
    .nonnegative()
    .default(DEFAULT_MAX_POSTS),
  REDDIT_DRY_RUN: booleanFromEnv,
  PR_BRANCH: z.string().default(DEFAULT_PR_BRANCH),
  PR_BASE: z.string().default(DEFAULT_PR_BASE),
  PR_LABELS: z.string().default(DEFAULT_PR_LABELS.join(',')),
  GITHUB_TOKEN: z.string().default(''),
});

/** Use the env value when present, otherwise the fallback default. */
function resolveModel(value: string, fallback: string): string {
  return value === '' ? fallback : value;
}

/** Parse and validate the configuration from the given environment. */
export function loadConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const parsed = envSchema.parse({
    OPENROUTER_API_KEY: envValue(env, 'OPENROUTER_API_KEY'),
    OPENROUTER_BASE_URL: envValue(env, 'OPENROUTER_BASE_URL'),
    OPENROUTER_DEFAULT_MODEL: envValue(env, 'OPENROUTER_DEFAULT_MODEL'),
    REDDIT_FILTER_MODEL: envValue(env, 'REDDIT_FILTER_MODEL'),
    REDDIT_MATCH_MODEL: envValue(env, 'REDDIT_MATCH_MODEL'),
    REDDIT_CREATE_MODEL: envValue(env, 'REDDIT_CREATE_MODEL'),
    REDDIT_UPDATE_MODEL: envValue(env, 'REDDIT_UPDATE_MODEL'),
    REDDIT_SUBREDDIT: envValue(env, 'REDDIT_SUBREDDIT'),
    REDDIT_LOOKBACK_HOURS: envValue(env, 'REDDIT_LOOKBACK_HOURS'),
    REDDIT_BATCH_SIZE: envValue(env, 'REDDIT_BATCH_SIZE'),
    REDDIT_MAX_POSTS: envValue(env, 'REDDIT_MAX_POSTS'),
    REDDIT_DRY_RUN: envValue(env, 'REDDIT_DRY_RUN'),
    PR_BRANCH: envValue(env, 'PR_BRANCH'),
    PR_BASE: envValue(env, 'PR_BASE'),
    PR_LABELS: envValue(env, 'PR_LABELS'),
    GITHUB_TOKEN: envValue(env, 'GITHUB_TOKEN'),
  });

  return {
    openrouter: {
      apiKey: parsed.OPENROUTER_API_KEY,
      baseUrl:
        parsed.OPENROUTER_BASE_URL === ''
          ? undefined
          : parsed.OPENROUTER_BASE_URL,
      defaultModel: resolveModel(
        parsed.OPENROUTER_DEFAULT_MODEL,
        DEFAULT_MODELS.fallback,
      ),
    },
    models: {
      filter: resolveModel(parsed.REDDIT_FILTER_MODEL, DEFAULT_MODELS.filter),
      match: resolveModel(parsed.REDDIT_MATCH_MODEL, DEFAULT_MODELS.match),
      create: resolveModel(parsed.REDDIT_CREATE_MODEL, DEFAULT_MODELS.create),
      update: resolveModel(parsed.REDDIT_UPDATE_MODEL, DEFAULT_MODELS.update),
    },
    reddit: {
      subreddit: parsed.REDDIT_SUBREDDIT,
      lookbackHours: parsed.REDDIT_LOOKBACK_HOURS,
      batchSize: parsed.REDDIT_BATCH_SIZE,
      maxPosts: parsed.REDDIT_MAX_POSTS,
      dryRun: parsed.REDDIT_DRY_RUN,
    },
    pr: {
      branch: parsed.PR_BRANCH,
      base: parsed.PR_BASE,
      labels: parsed.PR_LABELS.split(',')
        .map((label) => label.trim())
        .filter((label) => label.length > 0),
    },
    github: {
      token: parsed.GITHUB_TOKEN,
    },
  };
}

/** Configuration resolved from the current process environment. */
export const config: AppConfig = loadConfig();
