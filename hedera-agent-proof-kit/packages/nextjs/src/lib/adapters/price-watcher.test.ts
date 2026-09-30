import { describe, expect, it } from 'vitest';
import { createPriceWatcherProofEvent } from './price-watcher';

describe('createPriceWatcherProofEvent', () => {
  it('builds a watcher_signal proof from a CoinGecko price fetch', () => {
    const event = createPriceWatcherProofEvent({
      asset: 'HBAR',
      price: { asset: 'hbar', priceUsd: 0.12, fetchedAt: '2026-09-30T00:00:00Z' },
      threshold: 0.10,
      direction: 'above',
      actorId: 'agent:price-watcher'
    });

    expect(event.subject.type).toBe('watcher_signal');
    expect(event.subject.id).toBe('watcher:price-hbar');
    expect(event.metadata).toMatchObject({ adapter: 'watcher-signal', source: 'price-watcher' });
    expect(event.payload).toMatchObject({
      asset: 'HBAR',
      threshold: 0.10,
      currentPrice: 0.12,
      direction: 'above',
      fetchedAt: '2026-09-30T00:00:00Z'
    });
  });

  it('rejects cross-direction threshold mismatches', () => {
    expect(() =>
      createPriceWatcherProofEvent({
        asset: 'HBAR',
        price: { asset: 'hbar', priceUsd: 0.05, fetchedAt: '2026-09-30T00:00:00Z' },
        threshold: 0.10,
        direction: 'above'
      })
    ).toThrow(/threshold/i);
  });
});
