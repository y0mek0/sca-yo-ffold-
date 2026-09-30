import { describe, expect, it } from 'vitest';
import { fetchHbarPrice, type HbarPrice } from './coingecko-fetcher';

describe('fetchHbarPrice', () => {
  it('returns the USD price for HBAR', async () => {
    const expected: HbarPrice = { asset: 'hbar', priceUsd: 0.12, fetchedAt: '2026-09-30T00:00:00Z' };
    const result = await fetchHbarPrice({
      fetchImpl: async (input) => {
        assert(input === 'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd');
        return new Response(JSON.stringify({ 'hedera-hashgraph': { usd: 0.12 } }), { status: 200 });
      },
      now: () => expected.fetchedAt
    });

    expect(result).toEqual(expected);
  });

  it('reports HTTP failures cleanly', async () => {
    await expect(
      fetchHbarPrice({ fetchImpl: async () => new Response('rate limit', { status: 429 }) })
    ).rejects.toThrow(/http 429/i);
  });

  it('reports network failures', async () => {
    await expect(
      fetchHbarPrice({ fetchImpl: async () => { throw new Error('EAI_AGAIN'); } })
    ).rejects.toThrow(/EAI_AGAIN/);
  });
});

function assert(condition: unknown): asserts condition {
  if (!condition) throw new Error('assertion failed');
}
