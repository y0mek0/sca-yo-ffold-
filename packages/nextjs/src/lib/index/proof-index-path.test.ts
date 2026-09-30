import { normalize } from 'node:path';
import { describe, expect, it } from 'vitest';
import { resolveProofIndexPath } from './proof-index-path';

describe('resolveProofIndexPath', () => {
  it('uses the workspace data path when called from the repository root', () => {
    expect(resolveProofIndexPath('C:/repo')).toBe(normalize('C:/repo/packages/nextjs/.data/proofs.jsonl'));
  });

  it('uses the current app root when called from the Next workspace', () => {
    expect(resolveProofIndexPath('C:/repo/packages/nextjs')).toBe(normalize('C:/repo/packages/nextjs/.data/proofs.jsonl'));
  });
});
