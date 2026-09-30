import { describe, expect, it } from 'vitest';
import { createBrowserActionProofEvent } from './browser-action';
import { createPaymentIntentProofEvent } from './payment-intent';
import { createRagMemoryProofEvent } from './rag-memory';
import { createWatcherSignalProofEvent } from './watcher-signal';

describe('roadmap adapter factories', () => {
  it('normalizes a browser action into a browser_action subject', () => {
    const event = createBrowserActionProofEvent({
      url: 'https://example.com/pricing',
      action: 'click',
      result: 'opened upgrade modal',
      screenshotSha256: 'a'.repeat(64),
      actorId: 'agent:browser'
    });
    expect(event.subject.type).toBe('browser_action');
    expect(event.metadata).toMatchObject({ adapter: 'browser-action' });
  });

  it('normalizes a payment intent into a payment_intent subject without storing amounts in HCS payload', () => {
    const event = createPaymentIntentProofEvent({
      payer: '0.0.10380366',
      receiver: '0.0.429274',
      asset: '0.0.429274',
      amountMinor: 1000,
      policy: 'demo-policy',
      actorId: 'agent:router'
    });
    expect(event.subject.type).toBe('payment_intent');
    expect(event.metadata).toMatchObject({ adapter: 'payment-intent' });
  });

  it('normalizes a watcher signal into a watcher_signal subject', () => {
    const event = createWatcherSignalProofEvent({
      source: 'wallet',
      signal: 'new-holder',
      actorId: 'agent:watcher'
    });
    expect(event.subject.type).toBe('watcher_signal');
    expect(event.metadata).toMatchObject({ adapter: 'watcher-signal' });
  });

  it('normalizes a RAG memory answer into a rag_memory subject', () => {
    const event = createRagMemoryProofEvent({
      question: 'What is HCS used for?',
      answer: 'A proof log, not a database.',
      chunksSha256: ['1'.repeat(64)],
      retriever: 'demo-rag',
      actorId: 'agent:rag'
    });
    expect(event.subject.type).toBe('rag_memory');
    expect(event.metadata).toMatchObject({ adapter: 'rag-memory' });
  });
});
