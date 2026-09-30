export type IssuesBatchRecord = {
  sequenceNumber: string;
  repo: string;
  issueCount: number;
  capturedAt: string;
  hash: string;
  latestIssueNumber: number;
};

export type IssuesBatchSummary = {
  batchCount: number;
  totalIssuesSeen: number;
  perRepo: Record<string, number>;
  latestBatch: IssuesBatchRecord | null;
};

export function summarizeIssuesBatches(batches: IssuesBatchRecord[]): IssuesBatchSummary {
  if (batches.length === 0) {
    return { batchCount: 0, totalIssuesSeen: 0, perRepo: {}, latestBatch: null };
  }
  const perRepo: Record<string, number> = {};
  let totalIssuesSeen = 0;
  for (const batch of batches) {
    perRepo[batch.repo] = (perRepo[batch.repo] ?? 0) + batch.issueCount;
    totalIssuesSeen += batch.issueCount;
  }
  const latestBatch = batches.reduce((acc, cur) => (cur.capturedAt > acc.capturedAt ? cur : acc));
  return { batchCount: batches.length, totalIssuesSeen, perRepo, latestBatch };
}
