export type HcsErrorKind = 'topic' | 'operator' | 'signature' | 'unknown';
export type HcsErrorResult = { kind: HcsErrorKind; ok: false; reason: string };

const RECOGNIZED: Array<{ kind: HcsErrorKind; status: string; reason: string }> = [
  { kind: 'topic', status: 'INVALID_TOPIC_ID', reason: 'invalid_topic_id' },
  { kind: 'topic', status: 'TOPIC_EXPIRED', reason: 'topic_expired' },
  { kind: 'operator', status: 'PAYER_ACCOUNT_NOT_FOUND', reason: 'payer_account_not_found' },
  { kind: 'operator', status: 'INSUFFICIENT_PAYER_BALANCE', reason: 'insufficient_payer_balance' },
  { kind: 'signature', status: 'INVALID_SIGNATURE', reason: 'invalid_signature' }
];

export function classifyHcsError(error: unknown): HcsErrorResult {
  const message = error instanceof Error ? error.message : String(error);
  for (const entry of RECOGNIZED) {
    if (message.includes(entry.status)) {
      return { kind: entry.kind, ok: false, reason: entry.reason };
    }
  }
  return { kind: 'unknown', ok: false, reason: message };
}
