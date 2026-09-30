import { describe, expect, it } from 'vitest';

import {
  buildPricingTable,
  emptyPricingTable,
  estimateCost,
  loadPricing,
  priceCandidates,
} from '../lib/pricing';

/** A minimal OpenRouter `/models` payload with two priced models. */
const PAYLOAD = {
  data: [
    {
      id: 'deepseek/deepseek-v4-flash',
      pricing: { prompt: '0.0000001', completion: '0.0000002' },
    },
    {
      id: 'openai/gpt-4o',
      pricing: { prompt: '0.0000025', completion: '0.00001' },
    },
    { id: 'no-pricing/model' },
  ],
};

describe('priceCandidates', () => {
  it('strips the leading tilde and the -latest suffix', () => {
    expect(priceCandidates('~deepseek/deepseek-v4-flash-latest')).toEqual([
      '~deepseek/deepseek-v4-flash-latest',
      'deepseek/deepseek-v4-flash-latest',
      'deepseek/deepseek-v4-flash',
      '~deepseek/deepseek-v4-flash',
    ]);
  });

  it('keeps a plain id unchanged', () => {
    expect(priceCandidates('openai/gpt-4o')).toEqual(['openai/gpt-4o']);
  });
});

describe('buildPricingTable', () => {
  it('converts per-token prices into per-1M prices', () => {
    const table = buildPricingTable(PAYLOAD);

    expect(table.get('deepseek/deepseek-v4-flash')).toEqual({
      inputPer1M: 0.1,
      outputPer1M: 0.2,
    });
  });

  it('resolves a configured model through its variants', () => {
    const table = buildPricingTable(PAYLOAD);

    expect(table.get('~deepseek/deepseek-v4-flash-latest')).toEqual({
      inputPer1M: 0.1,
      outputPer1M: 0.2,
    });
  });

  it('returns undefined for an unknown or unpriced model', () => {
    const table = buildPricingTable(PAYLOAD);

    expect(table.get('unknown/model')).toBeUndefined();
    expect(table.get('no-pricing/model')).toBeUndefined();
  });

  it('tolerates a malformed payload', () => {
    expect(buildPricingTable(null).get('x')).toBeUndefined();
    expect(buildPricingTable({ data: 'nope' }).get('x')).toBeUndefined();
  });
});

describe('estimateCost', () => {
  it('multiplies tokens by the per-1M price', () => {
    const cost = estimateCost(
      { inputPer1M: 1, outputPer1M: 2 },
      { inputTokens: 1_000_000, outputTokens: 500_000 },
    );

    expect(cost).toBeCloseTo(2, 10);
  });

  it('returns 0 when the price is unknown', () => {
    expect(
      estimateCost(undefined, { inputTokens: 100, outputTokens: 100 }),
    ).toBe(0);
  });
});

describe('loadPricing', () => {
  it('builds a table from a successful response', async () => {
    const fetchImpl = (): Promise<Response> =>
      Promise.resolve(
        new Response(JSON.stringify(PAYLOAD), { status: 200 }),
      );

    const table = await loadPricing({ fetch: fetchImpl });

    expect(table.get('openai/gpt-4o')).toEqual({
      inputPer1M: 2.5,
      outputPer1M: 10,
    });
  });

  it('degrades to an empty table on a failed response', async () => {
    const fetchImpl = (): Promise<Response> =>
      Promise.resolve(new Response('nope', { status: 500 }));

    const table = await loadPricing({ fetch: fetchImpl });

    expect(table.get('openai/gpt-4o')).toBeUndefined();
  });

  it('degrades to an empty table when the fetch throws', async () => {
    const fetchImpl = (): Promise<Response> =>
      Promise.reject(new Error('offline'));

    const table = await loadPricing({ fetch: fetchImpl });

    expect(table.get('openai/gpt-4o')).toBeUndefined();
  });
});

describe('emptyPricingTable', () => {
  it('never resolves a price', () => {
    expect(emptyPricingTable().get('anything')).toBeUndefined();
  });
});
