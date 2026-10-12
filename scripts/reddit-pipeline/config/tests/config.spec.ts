import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DECISIONS_BASE_URL,
  DEFAULT_DECISIONS_MODEL,
  DEFAULT_MODELS,
} from '../../shared/lib/constants';
import { loadConfig } from '../index';

describe('loadConfig', () => {
  it('applies fallback defaults for an empty environment', () => {
    const config = loadConfig({});

    expect(config.reddit.subreddit).toBe('AynThor');
    expect(config.reddit.lookbackHours).toBe(24);
    expect(config.reddit.batchSize).toBe(10);
    expect(config.reddit.maxPosts).toBe(0);
    expect(config.reddit.dryRun).toBe(false);
    expect(config.reddit.mode).toBe('review');
    expect(config.models.filter).toBe(DEFAULT_MODELS.filter);
    expect(config.models.match).toBe(DEFAULT_MODELS.match);
    expect(config.models.create).toBe(DEFAULT_MODELS.create);
    expect(config.models.update).toBe(DEFAULT_MODELS.update);
    expect(config.models.category).toBe(DEFAULT_MODELS.category);
    expect(config.openrouter.defaultModel).toBe(DEFAULT_MODELS.fallback);
    expect(config.openrouter.baseUrl).toBeUndefined();
    expect(config.decisions.baseUrl).toBe(DEFAULT_DECISIONS_BASE_URL);
    expect(config.decisions.model).toBe(DEFAULT_DECISIONS_MODEL);
    expect(config.backends).toEqual({
      filter: 'llm',
      match: 'llm',
      category: 'llm',
    });
    expect(config.thresholds).toEqual({
      filter: 0.8,
      match: 0.8,
      category: 0.8,
    });
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

  it('reads the pipeline mode from the environment', () => {
    expect(loadConfig({ REDDIT_MODE: 'full' }).reddit.mode).toBe('full');
    expect(loadConfig({ REDDIT_MODE: 'approve' }).reddit.mode).toBe('approve');
    expect(loadConfig({ REDDIT_MODE: '   ' }).reddit.mode).toBe('review');
  });

  it('throws a zod error for an invalid pipeline mode', () => {
    expect(() => loadConfig({ REDDIT_MODE: 'bogus' })).toThrow();
  });

  it('throws a zod error for an invalid number', () => {
    expect(() => loadConfig({ REDDIT_LOOKBACK_HOURS: 'abc' })).toThrow();
  });

  it('throws a zod error for an invalid boolean', () => {
    expect(() => loadConfig({ REDDIT_DRY_RUN: 'maybe' })).toThrow();
  });

  it('parses explicit backend and threshold values', () => {
    const config = loadConfig({
      REDDIT_FILTER_BACKEND: 'jev',
      REDDIT_MATCH_BACKEND: 'llm',
      REDDIT_CATEGORY_BACKEND: 'jev',
      REDDIT_FILTER_THRESHOLD: '0.65',
      REDDIT_MATCH_THRESHOLD: '0.5',
      REDDIT_CATEGORY_THRESHOLD: '0.9',
    });

    expect(config.backends).toEqual({
      filter: 'jev',
      match: 'llm',
      category: 'jev',
    });
    expect(config.thresholds).toEqual({
      filter: 0.65,
      match: 0.5,
      category: 0.9,
    });
  });

  it('coerces a string threshold into a number', () => {
    const config = loadConfig({ REDDIT_FILTER_THRESHOLD: '0.9' });

    expect(config.thresholds.filter).toBe(0.9);
  });

  it('treats blank backend and threshold values as unset', () => {
    const config = loadConfig({
      REDDIT_FILTER_BACKEND: '   ',
      REDDIT_MATCH_BACKEND: '',
      REDDIT_CATEGORY_BACKEND: '',
      REDDIT_FILTER_THRESHOLD: '',
      REDDIT_MATCH_THRESHOLD: '   ',
      REDDIT_CATEGORY_THRESHOLD: '',
    });

    expect(config.backends).toEqual({
      filter: 'llm',
      match: 'llm',
      category: 'llm',
    });
    expect(config.thresholds).toEqual({
      filter: 0.8,
      match: 0.8,
      category: 0.8,
    });
  });

  it('throws a zod error for an invalid backend', () => {
    expect(() => loadConfig({ REDDIT_FILTER_BACKEND: 'gpt' })).toThrow();
  });

  it('throws a zod error for a threshold above 1', () => {
    expect(() => loadConfig({ REDDIT_MATCH_THRESHOLD: '2' })).toThrow();
  });

  it('throws a zod error for a negative threshold', () => {
    expect(() => loadConfig({ REDDIT_CATEGORY_THRESHOLD: '-1' })).toThrow();
  });

  it('reads explicit decisions settings', () => {
    const config = loadConfig({
      OPENROUTER_DECISIONS_BASE_URL: 'https://example.test/api',
      REDDIT_DECISIONS_MODEL: 'custom/jev',
      REDDIT_CATEGORY_MODEL: 'custom/category',
    });

    expect(config.decisions.baseUrl).toBe('https://example.test/api');
    expect(config.decisions.model).toBe('custom/jev');
    expect(config.models.category).toBe('custom/category');
  });

  it('falls back to the default decisions settings for blank values', () => {
    const config = loadConfig({
      OPENROUTER_DECISIONS_BASE_URL: '',
      REDDIT_DECISIONS_MODEL: '   ',
    });

    expect(config.decisions.baseUrl).toBe(DEFAULT_DECISIONS_BASE_URL);
    expect(config.decisions.model).toBe(DEFAULT_DECISIONS_MODEL);
  });
});
