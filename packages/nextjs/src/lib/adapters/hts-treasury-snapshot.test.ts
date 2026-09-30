import { describe, expect, it } from 'vitest';
import { createHtsTreasurySnapshotProofEvent, fetchHtsTreasurySnapshot } from './hts-treasury-snapshot';

const tokenPayload = {
  token_id: '0.0.429274',
  name: 'USD Coin',
  symbol: 'USDC',
  type: 'FUNGIBLE_COMMON',
  decimals: '6',
  total_supply: '10000000005000000',
  supply_type: 'INFINITE',
  treasury_account_id: '0.0.5176',
  freeze_default: false
};

describe('fetchHtsTreasurySnapshot', () => {
  it('normalizes token metadata and treasury balance from Mirror Node', async () => {
    const snapshot = await fetchHtsTreasurySnapshot({
      tokenId: '0.0.429274',
      mirrorNodeUrl: 'https://mirror.test',
      now: () => '2026-10-01T12:00:00.000Z',
      fetchImpl: async (input) => {
        const url = String(input);
        if (url.endsWith('/tokens/0.0.429274')) return new Response(JSON.stringify(tokenPayload), { status: 200 });
        return new Response(JSON.stringify({ balances: [{ account: '0.0.5176', balance: 55699998, decimals: 6 }] }), { status: 200 });
      }
    });

    expect(snapshot).toEqual({
      source: 'hedera-mirror-node',
      tokenId: '0.0.429274',
      name: 'USD Coin',
      symbol: 'USDC',
      type: 'FUNGIBLE_COMMON',
      decimals: 6,
      totalSupply: '10000000005000000',
      supplyType: 'INFINITE',
      treasuryAccountId: '0.0.5176',
      treasuryBalance: '55699998',
      freezeDefault: false,
      fetchedAt: '2026-10-01T12:00:00.000Z'
    });
  });

  it('supports a token with no treasury balance response', async () => {
    const snapshot = await fetchHtsTreasurySnapshot({
      tokenId: '0.0.1',
      mirrorNodeUrl: 'https://mirror.test',
      fetchImpl: async (input) => String(input).endsWith('/tokens/0.0.1')
        ? new Response(JSON.stringify({ ...tokenPayload, token_id: '0.0.1', treasury_account_id: '0.0.2' }), { status: 200 })
        : new Response(JSON.stringify({ balances: [] }), { status: 200 })
    });

    expect(snapshot.treasuryBalance).toBeNull();
  });

  it('rejects Mirror Node errors and malformed token metadata', async () => {
    await expect(fetchHtsTreasurySnapshot({
      tokenId: '0.0.1',
      mirrorNodeUrl: 'https://mirror.test',
      fetchImpl: async () => new Response('missing', { status: 404 })
    })).rejects.toThrow(/Mirror Node HTTP 404/);

    await expect(fetchHtsTreasurySnapshot({
      tokenId: '0.0.1',
      mirrorNodeUrl: 'https://mirror.test',
      fetchImpl: async () => new Response(JSON.stringify({}), { status: 200 })
    })).rejects.toThrow(/token payload/i);
  });
});

describe('createHtsTreasurySnapshotProofEvent', () => {
  it('creates an auditable HTS treasury snapshot event', () => {
    const event = createHtsTreasurySnapshotProofEvent({
      snapshot: {
        source: 'hedera-mirror-node',
        tokenId: '0.0.429274',
        name: 'USD Coin',
        symbol: 'USDC',
        type: 'FUNGIBLE_COMMON',
        decimals: 6,
        totalSupply: '10000000005000000',
        supplyType: 'INFINITE',
        treasuryAccountId: '0.0.5176',
        treasuryBalance: '55699998',
        freezeDefault: false,
        fetchedAt: '2026-10-01T12:00:00.000Z'
      }
    });

    expect(event.kind).toBe('research_claim');
    expect(event.subject).toEqual({ id: 'hts:token:0.0.429274', type: 'token_snapshot' });
    expect(event.metadata).toMatchObject({ adapter: 'hts-treasury-snapshot', source: 'hedera-mirror-node', readOnly: true });
  });
});
