import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type PaymentIntentInput = {
  payer: string;
  receiver: string;
  asset: string;
  amountMinor: number;
  policy: string;
  actorId: string;
};

export function createPaymentIntentProofEvent(input: PaymentIntentInput): ProofEvent {
  return normalizeProofEvent({
    kind: 'ai_decision',
    actor: { id: input.actorId, type: 'ai_agent' },
    subject: {
      id: `payment:${input.payer}->${input.receiver}`,
      type: 'payment_intent'
    },
    payload: {
      payer: input.payer,
      receiver: input.receiver,
      asset: input.asset,
      amountMinor: input.amountMinor,
      policy: input.policy
    },
    metadata: { adapter: 'payment-intent' }
  });
}
