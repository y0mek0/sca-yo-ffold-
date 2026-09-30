import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type WatcherSignalInput = {
  source: string;
  signal: string;
  actorId: string;
};

export function createWatcherSignalProofEvent(input: WatcherSignalInput): ProofEvent {
  return normalizeProofEvent({
    kind: 'ai_decision',
    actor: { id: input.actorId, type: 'ai_agent' },
    subject: {
      id: `watcher:${input.source}`,
      type: 'watcher_signal'
    },
    payload: {
      source: input.source,
      signal: input.signal
    },
    metadata: { adapter: 'watcher-signal' }
  });
}
