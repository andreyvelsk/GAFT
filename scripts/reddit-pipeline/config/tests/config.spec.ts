import { describe, expect, it } from 'vitest';

import { DEFAULT_MODELS } from '../../shared/lib/constants';
import { loadConfig } from '../index';

describe('loadConfig', () => {
  it('applies fallback defaults for an empty environment', () => {
    const config = loadConfig({});

    expect(config.reddit.subreddit).toBe('AynThor');
    expect(config.reddit.lookbackHours).toBe(24);
    expect(config.reddit.batchSize).toBe(10);
    expect(config.reddit.maxPosts).toBe(0);
    expect(config.reddit.dryRun).toBe(false);
    expect(config.models.filter).toBe(DEFAULT_MODELS.filter);
    expect(config.models.match).toBe(DEFAULT_MODELS.match);
    expect(config.models.create).toBe(DEFAULT_MODELS.create);
    expect(config.models.update).toBe(DEFAULT_MODELS.update);
    expect(config.openrouter.defaultModel).toBe(DEFAULT_MODELS.fallback);
    expect(config.openrouter.baseUrl).toBeUndefined();
    expect(config.pr.branch).toBe('reddit-pipeline/auto');
    expect(config.pr.base).toBe('main');
    expect(config.pr.labels).toEqual(['automation', 'reddit']);
  });

  it('reads and coerces values from the environment', () => {
    const config = loadConfig({
      OPENROUTER_API_KEY: 'secret',
      REDDIT_SUBREDDIT: 'TestSub',
      REDDIT_LOOKBACK_HOURS: '48',
      REDDIT_BATCH_SIZE: '5',
      REDDIT_MAX_POSTS: '2',
      REDDIT_DRY_RUN: 'true',
      REDDIT_FILTER_MODEL: 'custom/filter-model',
      PR_LABELS: 'automation, reddit , ',
    });

    expect(config.openrouter.apiKey).toBe('secret');
    expect(config.reddit.subreddit).toBe('TestSub');
    expect(config.reddit.lookbackHours).toBe(48);
    expect(config.reddit.batchSize).toBe(5);
    expect(config.reddit.maxPosts).toBe(2);
    expect(config.reddit.dryRun).toBe(true);
    expect(config.models.filter).toBe('custom/filter-model');
    expect(config.pr.labels).toEqual(['automation', 'reddit']);
  });

  it('treats blank values as unset', () => {
    const config = loadConfig({
      REDDIT_SUBREDDIT: '   ',
      REDDIT_LOOKBACK_HOURS: '',
      REDDIT_DRY_RUN: '',
    });

    expect(config.reddit.subreddit).toBe('AynThor');
    expect(config.reddit.lookbackHours).toBe(24);
    expect(config.reddit.dryRun).toBe(false);
  });

  it('throws a zod error for an invalid number', () => {
    expect(() => loadConfig({ REDDIT_LOOKBACK_HOURS: 'abc' })).toThrow();
  });

  it('throws a zod error for an invalid boolean', () => {
    expect(() => loadConfig({ REDDIT_DRY_RUN: 'maybe' })).toThrow();
  });
});
