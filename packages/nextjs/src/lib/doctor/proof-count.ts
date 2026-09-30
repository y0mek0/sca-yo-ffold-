import type { LocalProofSummary } from '../index/read-local-proofs';

export type ProofCount = {
  total: number;
  byKind: Record<string, number>;
};

export function buildProofCount(proofs: LocalProofSummary[]): ProofCount {
  const byKind: Record<string, number> = {};
  for (const proof of proofs) {
    const key = proof.kind || proof.adapter || 'unknown';
    byKind[key] = (byKind[key] ?? 0) + 1;
  }
  return { total: proofs.length, byKind };
}

export function formatProofCount(count: ProofCount): string {
  if (count.total === 0) return '0 proofs on file';
  if (count.total === 1) return '1 proof on file';
  const kinds = Object.entries(count.byKind);
  if (kinds.length === 1) return `${count.total} proofs on file`;
  const breakdown = kinds.map(([kind, n]) => `${n} ${kind}`).join(', ');
  return `${count.total} proofs on file (${breakdown})`;
}
