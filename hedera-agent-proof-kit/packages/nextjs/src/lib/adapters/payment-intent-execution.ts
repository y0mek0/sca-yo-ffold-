import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type PaymentExecutionStatus = 'SUCCESS';

export type PaymentExecutionInput = {
  payer: string;
  receiver: string;
  amountTinybar: number;
  transactionId: string;
  status: PaymentExecutionStatus | string;
  intentDigest: string;
  actorId: string;
};

export function createPaymentExecutionProofEvent(input: PaymentExecutionInput): ProofEvent {
  if (input.status !== 'SUCCESS') {
    throw new Error('Payment execution status must be SUCCESS');
  }
  if (!Number.isSafeInteger(input.amountTinybar) || input.amountTinybar <= 0) {
    throw new Error('Payment amountTinybar must be a positive safe integer');
  }
  if (!/^[a-f0-9]{64}$/i.test(input.intentDigest)) {
    throw new Error('Payment intent digest must be a 64-character hex SHA-256 digest');
  }

  return normalizeProofEvent({
    kind: 'ai_decision',
    actor: { id: input.actorId, type: 'ai_agent' },
    subject: {
      id: `payment-execution:${input.payer}->${input.receiver}`,
      type: 'payment_intent'
    },
    payload: {
      payer: input.payer,
      receiver: input.receiver,
      amountTinybar: input.amountTinybar,
      transactionId: input.transactionId,
      status: input.status,
      intentDigest: input.intentDigest
    },
    metadata: { adapter: 'payment-intent-execution' }
  });
}
