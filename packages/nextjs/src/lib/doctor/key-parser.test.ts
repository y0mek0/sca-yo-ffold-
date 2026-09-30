import { describe, expect, it } from 'vitest';
import { describeHederaKey, parseHederaAccountId } from './key-parser';

describe('parseHederaAccountId', () => {
  it('accepts canonical 0.0.X account ids', () => {
    expect(parseHederaAccountId('0.0.10380366')).toEqual({ shard: 0, realm: 0, num: 10380366 });
  });

  it('rejects malformed account ids without throwing the wrong way', () => {
    expect(() => parseHederaAccountId('not-an-account')).toThrow(/account id/i);
    expect(() => parseHederaAccountId('0.0.-1')).toThrow(/account id/i);
  });
});

describe('describeHederaKey', () => {
  it('classifies an ECDSA hex key that starts with 0x', () => {
    expect(describeHederaKey('0x4b7c9e49609650056c64bf111131503f6cca8c05')).toEqual({
      format: 'ecdsa-hex',
      normalized: '4b7c9e49609650056c64bf111131503f6cca8c05'
    });
  });

  it('classifies an ED25519 DER-encoded key', () => {
    expect(describeHederaKey('302e020100300506032b657004220420deadbeef').format).toBe('ed25519-der');
  });

  it('rejects unknown key shapes with a clear message', () => {
    expect(() => describeHederaKey('totally bogus')).toThrow(/key/i);
  });
});
