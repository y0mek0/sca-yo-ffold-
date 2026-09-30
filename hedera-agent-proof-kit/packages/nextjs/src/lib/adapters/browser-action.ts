import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type BrowserActionInput = {
  url: string;
  action: string;
  result: string;
  screenshotSha256?: string;
  actorId: string;
};

export function createBrowserActionProofEvent(input: BrowserActionInput): ProofEvent {
  return normalizeProofEvent({
    kind: 'ai_decision',
    actor: { id: input.actorId, type: 'ai_agent' },
    subject: {
      id: `browser:${new URL(input.url).host}`,
      type: 'browser_action'
    },
    payload: {
      url: input.url,
      action: input.action,
      result: input.result,
      screenshotSha256: input.screenshotSha256 ?? null
    },
    metadata: { adapter: 'browser-action' }
  });
}
