import type { LocalProofSummary } from '../index/read-local-proofs';

export type ApiQuery = {
  kind?: string;
  limit?: string;
};

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

function readPositiveInt(value: string | undefined, fallback: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) return 1;
  return Math.min(parsed, max);
}

export function filterAndLimitProofs(proofs: LocalProofSummary[], query: ApiQuery): LocalProofSummary[] {
  const limit = readPositiveInt(query.limit, DEFAULT_LIMIT, MAX_LIMIT);
  const kind = query.kind?.trim();

  const filtered = kind ? proofs.filter((p) => p.kind === kind || p.adapter === kind) : proofs;
  return filtered.slice(0, limit);
}
