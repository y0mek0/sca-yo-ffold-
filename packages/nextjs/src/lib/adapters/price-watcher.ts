import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';
import type { HbarPrice } from './coingecko-fetcher';

export type PriceWatcherInput = {
  asset: string;
  price: HbarPrice;
  threshold: number;
  direction: 'above' | 'below';
  actorId?: string;
};

export function createPriceWatcherProofEvent(input: PriceWatcherInput): ProofEvent {
  if (input.direction === 'above' && input.price.priceUsd < input.threshold) {
    throw new Error(`Price watcher threshold/current mismatch: above requires ${input.price.priceUsd} >= ${input.threshold}`);
  }
  if (input.direction === 'below' && input.price.priceUsd > input.threshold) {
    throw new Error(`Price watcher threshold/current mismatch: below requires ${input.price.priceUsd} <= ${input.threshold}`);
  }

  return normalizeProofEvent({
    kind: 'ai_decision',
    actor: { id: input.actorId ?? 'agent:price-watcher', type: 'ai_agent' },
    subject: {
      id: `watcher:price-${input.price.asset}`,
      type: 'watcher_signal'
    },
    payload: {
      asset: input.asset,
      threshold: input.threshold,
      currentPrice: input.price.priceUsd,
      direction: input.direction,
      fetchedAt: input.price.fetchedAt
    },
    metadata: { adapter: 'watcher-signal', source: 'price-watcher' }
  });
}
