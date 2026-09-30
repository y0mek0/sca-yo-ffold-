import { describe, expect, it } from 'vitest';
import { createSaucerSwapSnapshotProofEvent, fetchSaucerSwapPoolSnapshot } from './saucerswap-snapshot';

describe('fetchSaucerSwapPoolSnapshot', () => {
  it('fetches and normalizes a public pool snapshot', async () => {
    const snapshot = await fetchSaucerSwapPoolSnapshot({
      poolId: 0,
      now: () => '2026-10-01T12:00:00.000Z',
      fetchImpl: async () => new Response(JSON.stringify({
        id: 0,
        contractId: '0.0.1062795',
        lpToken: { id: '0.0.1062796', symbol: 'SAUCE - HBAR', decimals: 8, priceUsd: '0.81' },
        lpTokenReserve: '3974896030668',
        tokenA: { id: '0.0.731861', symbol: 'SAUCE', decimals: 6, priceUsd: 0.014 },
        tokenReserveA: '1134257803495',
        tokenB: { id: '0.0.1062664', symbol: 'HBAR', decimals: 8, priceUsd: 0.105 },
        tokenReserveB: '15236501108948'
      }), { status: 200 })
    });

    expect(snapshot).toEqual({
      source: 'saucerswap',
      poolId: 0,
      poolContractId: '0.0.1062795',
      lpToken: { id: '0.0.1062796', symbol: 'SAUCE - HBAR', decimals: 8, priceUsd: 0.81 },
      tokenA: { id: '0.0.731861', symbol: 'SAUCE', decimals: 6, priceUsd: 0.014, reserve: '1134257803495' },
      tokenB: { id: '0.0.1062664', symbol: 'HBAR', decimals: 8, priceUsd: 0.105, reserve: '15236501108948' },
      fetchedAt: '2026-10-01T12:00:00.000Z'
    });
  });

  it('rejects malformed pool payloads and upstream errors', async () => {
    await expect(fetchSaucerSwapPoolSnapshot({
      fetchImpl: async () => new Response('{}', { status: 200 })
    })).rejects.toThrow(/pool payload/i);

    await expect(fetchSaucerSwapPoolSnapshot({
      fetchImpl: async () => new Response('rate limited', { status: 429 })
    })).rejects.toThrow(/SaucerSwap HTTP 429/);
  });
});

describe('createSaucerSwapSnapshotProofEvent', () => {
  it('creates a market snapshot proof with no raw API envelope assumptions', () => {
    const event = createSaucerSwapSnapshotProofEvent({
      snapshot: {
        source: 'saucerswap',
        poolId: 0,
        poolContractId: '0.0.1062795',
        lpToken: { id: '0.0.1062796', symbol: 'SAUCE - HBAR', decimals: 8, priceUsd: 0.81 },
        tokenA: { id: '0.0.731861', symbol: 'SAUCE', decimals: 6, priceUsd: 0.014, reserve: '1134257803495' },
        tokenB: { id: '0.0.1062664', symbol: 'HBAR', decimals: 8, priceUsd: 0.105, reserve: '15236501108948' },
        fetchedAt: '2026-10-01T12:00:00.000Z'
      },
      actorId: 'agent:market-research'
    });

    expect(event.kind).toBe('research_claim');
    expect(event.subject).toEqual({ id: 'saucerswap:pool:0', type: 'market_snapshot' });
    expect(event.metadata).toMatchObject({ adapter: 'saucerswap-snapshot', source: 'saucerswap' });
    expect(event.payload).toMatchObject({ poolId: 0, poolContractId: '0.0.1062795' });
  });
});
