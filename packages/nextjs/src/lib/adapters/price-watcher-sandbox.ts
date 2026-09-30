export type HbarProofRecord = {
  sequenceNumber: string;
  priceUsd: number;
  fetchedAt: string;
  hash: string;
};

export type HbarThresholds = {
  count: number;
  min: number;
  max: number;
  latest: HbarProofRecord | null;
};

export function findHbarThresholds(history: HbarProofRecord[]): HbarThresholds {
  if (history.length === 0) {
    return { count: 0, min: 0, max: 0, latest: null };
  }
  const prices = history.map((r) => r.priceUsd);
  const latest = history.reduce((acc, cur) => (cur.fetchedAt > acc.fetchedAt ? cur : acc));
  return {
    count: history.length,
    min: Math.min(...prices),
    max: Math.max(...prices),
    latest
  };
}
