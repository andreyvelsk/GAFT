import { describe, expect, it } from 'vitest';

import {
  DEFAULT_DECISIONS_MODEL,
  DEFAULT_MODELS,
} from '../../../shared/lib/constants';
import {
  AGENT_MODEL_ENV,
  DECISION_MODEL_ENV,
  DEFAULT_MODEL_ENV,
  fallbackModel,
  resolveDecisionModel,
  resolveModel,
  resolveModels,
} from '../index';

describe('fallbackModel', () => {
  it('returns the shared default per agent', () => {
    expect(fallbackModel('filter')).toBe(DEFAULT_MODELS.filter);
    expect(fallbackModel('match')).toBe(DEFAULT_MODELS.match);
    expect(fallbackModel('create')).toBe(DEFAULT_MODELS.create);
    expect(fallbackModel('update')).toBe(DEFAULT_MODELS.update);
    expect(fallbackModel('category')).toBe(DEFAULT_MODELS.category);
  });
});

describe('resolveModel', () => {
  it('falls back to the shared default for an empty environment', () => {
    expect(resolveModel('filter', { env: {} })).toBe(DEFAULT_MODELS.filter);
    expect(resolveModel('match', { env: {} })).toBe(DEFAULT_MODELS.match);
    expect(resolveModel('create', { env: {} })).toBe(DEFAULT_MODELS.create);
    expect(resolveModel('update', { env: {} })).toBe(DEFAULT_MODELS.update);
    expect(resolveModel('category', { env: {} })).toBe(DEFAULT_MODELS.category);
  });

  it('reads the per-agent environment variable', () => {
    expect(
      resolveModel('filter', { env: { REDDIT_FILTER_MODEL: 'custom/filter' } }),
    ).toBe('custom/filter');
    expect(
      resolveModel('match', { env: { REDDIT_MATCH_MODEL: 'custom/match' } }),
    ).toBe('custom/match');
    expect(
      resolveModel('create', { env: { REDDIT_CREATE_MODEL: 'custom/create' } }),
    ).toBe('custom/create');
    expect(
      resolveModel('update', { env: { REDDIT_UPDATE_MODEL: 'custom/update' } }),
    ).toBe('custom/update');
    expect(
      resolveModel('category', {
        env: { REDDIT_CATEGORY_MODEL: 'custom/category' },
      }),
    ).toBe('custom/category');
  });

  it('treats a blank per-agent value as unset', () => {
    expect(
      resolveModel('filter', { env: { REDDIT_FILTER_MODEL: '   ' } }),
    ).toBe(DEFAULT_MODELS.filter);
  });

  it('uses the global fallback when the per-agent value is absent', () => {
    expect(
      resolveModel('filter', { env: { OPENROUTER_DEFAULT_MODEL: 'global/model' } }),
    ).toBe('global/model');
  });

  it('prefers the per-agent value over the global fallback', () => {
    const model = resolveModel('filter', {
      env: {
        REDDIT_FILTER_MODEL: 'custom/filter',
        OPENROUTER_DEFAULT_MODEL: 'global/model',
      },
    });

    expect(model).toBe('custom/filter');
  });

  it('exposes the environment variable names used per agent', () => {
    expect(AGENT_MODEL_ENV.filter).toBe('REDDIT_FILTER_MODEL');
    expect(AGENT_MODEL_ENV.match).toBe('REDDIT_MATCH_MODEL');
    expect(AGENT_MODEL_ENV.create).toBe('REDDIT_CREATE_MODEL');
    expect(AGENT_MODEL_ENV.update).toBe('REDDIT_UPDATE_MODEL');
    expect(AGENT_MODEL_ENV.category).toBe('REDDIT_CATEGORY_MODEL');
    expect(DEFAULT_MODEL_ENV).toBe('OPENROUTER_DEFAULT_MODEL');
    expect(DECISION_MODEL_ENV).toBe('REDDIT_DECISIONS_MODEL');
  });
});

describe('resolveDecisionModel', () => {
  it('falls back to the shared default for an empty environment', () => {
    expect(resolveDecisionModel({ env: {} })).toBe(DEFAULT_DECISIONS_MODEL);
    expect(DEFAULT_DECISIONS_MODEL).toBe('typesafe/jev-1.13');
  });

  it('reads the decision model environment variable', () => {
    expect(
      resolveDecisionModel({ env: { REDDIT_DECISIONS_MODEL: 'custom/jev' } }),
    ).toBe('custom/jev');
  });

  it('treats a blank decision model value as unset', () => {
    expect(
      resolveDecisionModel({ env: { REDDIT_DECISIONS_MODEL: '   ' } }),
    ).toBe(DEFAULT_DECISIONS_MODEL);
  });

  it('ignores the global fallback model', () => {
    expect(
      resolveDecisionModel({ env: { OPENROUTER_DEFAULT_MODEL: 'g/m' } }),
    ).toBe(DEFAULT_DECISIONS_MODEL);
  });
});

describe('resolveModels', () => {
  it('resolves every agent at once', () => {
    const models = resolveModels({
      env: { REDDIT_FILTER_MODEL: 'custom/filter' },
    });

    expect(models).toEqual({
      filter: 'custom/filter',
      match: DEFAULT_MODELS.match,
      create: DEFAULT_MODELS.create,
      update: DEFAULT_MODELS.update,
      category: DEFAULT_MODELS.category,
    });
  });

  it('applies the global fallback to every agent', () => {
    const models = resolveModels({ env: { OPENROUTER_DEFAULT_MODEL: 'g/m' } });

    expect(models).toEqual({
      filter: 'g/m',
      match: 'g/m',
      create: 'g/m',
      update: 'g/m',
      category: 'g/m',
    });
  });
});
