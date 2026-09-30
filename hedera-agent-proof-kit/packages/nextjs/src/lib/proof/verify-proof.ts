import { hashCanonicalJson, type HcsProofMessage, type ProofEvent } from './proof-event';

export type VerificationResult =
  | { ok: true; reason: 'hash_match' }
  | { ok: false; reason: 'hash_mismatch' };

export function verifyLocalProof(input: { event: ProofEvent; hcsMessage: HcsProofMessage }): VerificationResult {
  const recomputed = hashCanonicalJson(input.event);

  if (recomputed.digest === input.hcsMessage.hash.digest && recomputed.algorithm === input.hcsMessage.hash.algorithm) {
    return { ok: true, reason: 'hash_match' };
  }

  return { ok: false, reason: 'hash_mismatch' };
}
