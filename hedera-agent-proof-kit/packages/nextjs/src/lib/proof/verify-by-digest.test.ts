import { describe, expect, it } from 'vitest';
import { buildMirrorVerifyArgs } from './verify-by-digest';

describe('buildMirrorVerifyArgs', () => {
  it('returns shell-friendly args with --hash and --sequence', () => {
    const args = buildMirrorVerifyArgs({
      hash: 'b822a0ff345e06eb5db1ea9cb37d6f322e91d78e6796779756dd2176ba0a7bda',
      sequence: '7'
    });
    expect(args).toContain('--hash');
    expect(args).toContain('b822a0ff345e06eb5db1ea9cb37d6f322e91d78e6796779756dd2176ba0a7bda');
    expect(args).toContain('--sequence');
    expect(args).toContain('7');
  });

  it('omits --sequence when not provided', () => {
    const args = buildMirrorVerifyArgs({ hash: 'a'.repeat(64) });
    expect(args).toContain('--hash');
    expect(args.join(' ')).not.toContain('--sequence');
  });

  it('rejects malformed digests', () => {
    expect(() => buildMirrorVerifyArgs({ hash: 'not-a-digest' })).toThrow(/digest/i);
  });
});
