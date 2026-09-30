import { describe, expect, it } from 'vitest';
import { summarizeIssuesBatches, type IssuesBatchRecord } from './issues-watcher-sandbox';

describe('summarizeIssuesBatches (sandbox analysis)', () => {
  it('aggregates multiple watcher runs and reports per-repo counts', () => {
    const batches: IssuesBatchRecord[] = [
      { sequenceNumber: '20', repo: 'microsoft/typescript', issueCount: 2, capturedAt: '2026-09-30T12:09:22.327Z', hash: 'h1', latestIssueNumber: 64549 },
      { sequenceNumber: '22', repo: 'microsoft/typescript', issueCount: 3, capturedAt: '2026-09-30T12:11:20.042Z', hash: 'h2', latestIssueNumber: 64550 },
      { sequenceNumber: '24', repo: 'microsoft/typescript', issueCount: 3, capturedAt: '2026-09-30T12:11:31.111Z', hash: 'h3', latestIssueNumber: 64551 },
      { sequenceNumber: '26', repo: 'microsoft/typescript', issueCount: 3, capturedAt: '2026-09-30T12:12:40.888Z', hash: 'h4', latestIssueNumber: 64551 }
    ];

    const result = summarizeIssuesBatches(batches);

    expect(result.batchCount).toBe(4);
    expect(result.totalIssuesSeen).toBe(11);
    expect(result.perRepo['microsoft/typescript']).toBe(11);
    expect(result.latestBatch).toEqual(batches[3]);
  });

  it('returns zeroed result for empty history', () => {
    expect(summarizeIssuesBatches([])).toEqual({
      batchCount: 0,
      totalIssuesSeen: 0,
      perRepo: {},
      latestBatch: null
    });
  });
});
