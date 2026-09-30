const DIGEST_PATTERN = /^[a-f0-9]{64}$/i;

export type VerifyByDigestInput = {
  hash: string;
  sequence?: string;
};

export function buildMirrorVerifyArgs(input: VerifyByDigestInput): string[] {
  if (!DIGEST_PATTERN.test(input.hash.trim())) {
    throw new Error(`Invalid hash digest: expected 64 hex characters, got ${input.hash.length}`);
  }
  const args = ['--hash', input.hash.trim()];
  if (input.sequence) {
    args.push('--sequence', input.sequence);
  }
  return args;
}

export function buildMirrorVerifyCommand(input: VerifyByDigestInput): string {
  return `npm run mirror:verify -- ${buildMirrorVerifyArgs(input).join(' ')}`;
}
