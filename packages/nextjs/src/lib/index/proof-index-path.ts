import { join, normalize } from 'node:path';

const WORKSPACE_SUFFIX = `${normalize('packages/nextjs')}`;

export function resolveProofIndexPath(cwd = process.cwd()): string {
  const normalizedCwd = normalize(cwd);
  const appRoot = normalizedCwd.endsWith(WORKSPACE_SUFFIX)
    ? normalizedCwd
    : join(normalizedCwd, 'packages', 'nextjs');
  return join(appRoot, '.data', 'proofs.jsonl');
}
