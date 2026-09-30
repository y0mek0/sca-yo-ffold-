import { describe, expect, it } from 'vitest';
import { classifyHcsError } from './hcs-error';

describe('classifyHcsError', () => {
  it('flags an unknown topic', () => {
    const result = classifyHcsError(new Error('receipt contained error status INVALID_TOPIC_ID'));
    expect(result).toEqual({ kind: 'topic', ok: false, reason: 'invalid_topic_id' });
  });

  it('flags a missing payer account', () => {
    const result = classifyHcsError(new Error('precheck failed with status PAYER_ACCOUNT_NOT_FOUND'));
    expect(result.kind).toBe('operator');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('payer_account_not_found');
  });

  it('flags INVALID_SIGNATURE', () => {
    const result = classifyHcsError(new Error('failed precheck with status INVALID_SIGNATURE'));
    expect(result.reason).toBe('invalid_signature');
  });

  it('returns a generic failure for unknown errors', () => {
    const result = classifyHcsError(new Error('something weird'));
    expect(result.kind).toBe('unknown');
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('something weird');
  });
});
