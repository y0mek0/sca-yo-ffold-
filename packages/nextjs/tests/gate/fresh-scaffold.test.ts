import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterAll, describe, expect, it } from 'vitest';
import { spawnSync } from 'node:child_process';

const TEMPLATE_ROOT = resolve(__dirname, '..', '..', '..');
let tempRoot: string | undefined;

function npm(args: string[], cwd: string): { status: number; stdout: string; stderr: string } {
  const cmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const result = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    env: { ...process.env, HEDERA_OPERATOR_ID: '', HEDERA_OPERATOR_KEY: '', HEDERA_TOPIC_ID: '' }
  });
  return {
    status: result.status ?? -1,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? ''
  };
}

describe('fresh scaffold gate', () => {
  it('installs, lints, typechecks, tests, builds, and runs the doctor in a clean copy', async () => {
    tempRoot = await mkdtemp(join(tmpdir(), 'tracemark-fresh-'));
    const dest = join(tempRoot, 'app');

    // Copy the template without node_modules, .next, and .data artifacts.
    await cp(TEMPLATE_ROOT, dest, {
      recursive: true,
      filter: (source) =>
        !source.includes(`${TEMPLATE_ROOT}\\node_modules`) &&
        !source.includes(`${TEMPLATE_ROOT}/node_modules`) &&
        !source.includes(`${TEMPLATE_ROOT}\\packages\\nextjs\\node_modules`) &&
        !source.includes(`${TEMPLATE_ROOT}/packages/nextjs/node_modules`) &&
        !source.includes(`${TEMPLATE_ROOT}\\packages\\nextjs\\.next`) &&
        !source.includes(`${TEMPLATE_ROOT}/packages/nextjs/.next`) &&
        !source.includes(`${TEMPLATE_ROOT}\\.data`) &&
        !source.includes(`${TEMPLATE_ROOT}/.data`)
    });

    const install = npm(['install', '--no-audit', '--no-fund'], dest);
    expect(install.status, install.stderr).toBe(0);

    const gates = [
      ['run', 'lint'],
      ['run', 'typecheck'],
      ['run', 'test'],
      ['run', 'build'],
      ['run', 'doctor']
    ] as const;

    for (const args of gates) {
      const result = npm([...args], dest);
      expect(result.status, `${args.join(' ')} stderr:\n${result.stderr}\nstdout:\n${result.stdout}`).toBe(0);
    }
  }, 300_000);
});

afterAll(async () => {
  if (tempRoot) {
    await rm(tempRoot, { recursive: true, force: true });
  }
});
