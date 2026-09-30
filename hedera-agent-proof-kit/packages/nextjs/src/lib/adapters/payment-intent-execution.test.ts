import { describe, expect, it } from 'vitest';
import {
  createPaymentExecutionProofEvent,
  type PaymentExecutionInput
} from './payment-intent-execution';

describe('createPaymentExecutionProofEvent', () => {
  const input: PaymentExecutionInput = {
    payer: '0.0.100',
    receiver: '0.0.200',
    amountTinybar: 10,
    transactionId: '0.0.100@1700000000.000000000',
    status: 'SUCCESS',
    intentDigest: 'a'.repeat(64),
    actorId: 'agent:payment-sandbox'
  };

  it('creates a payment execution event linked to the intent digest', () => {
    const event = createPaymentExecutionProofEvent(input);

    expect(event.kind).toBe('ai_decision');
    expect(event.subject).toEqual({
      id: 'payment-execution:0.0.100->0.0.200',
      type: 'payment_intent'
    });
    expect(event.payload).toEqual({
      payer: '0.0.100',
      receiver: '0.0.200',
      amountTinybar: 10,
      transactionId: '0.0.100@1700000000.000000000',
      status: 'SUCCESS',
      intentDigest: 'a'.repeat(64)
    });
  });

  it('rejects unsuccessful execution proof status', () => {
    expect(() => createPaymentExecutionProofEvent({ ...input, status: 'FAILED' })).toThrow(
      'Payment execution status must be SUCCESS'
    );
  });
});
