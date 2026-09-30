import { describe, expect, it } from 'vitest';
import { formatCheck, formatError, formatHeadline, formatHint, formatJson, formatSuccess } from './cli-output';

describe('cli-output', () => {
  it('formats a passing check', () => {
    expect(formatCheck('Node version', true, 'v24.11.1 >= 20.18.3')).toContain('Node version');
    expect(formatCheck('Node version', true, 'v24.11.1 >= 20.18.3')).toContain('OK');
  });

  it('formats a failing check', () => {
    const out = formatCheck('Token association', false, 'mirror_node_unreachable');
    expect(out).toContain('Token association');
    expect(out).toContain('WARN');
  });

  it('formats a headline with rule', () => {
    const out = formatHeadline('AgentProof HBAR');
    expect(out).toContain('AgentProof HBAR');
    expect(out.split('\n').length).toBeGreaterThan(1);
  });

  it('formats success with checkmark prefix', () => {
    expect(formatSuccess('Proof submitted')).toContain('Proof submitted');
  });

  it('formats error with cross prefix', () => {
    expect(formatError('Submit failed', { kind: 'topic', reason: 'invalid_topic_id' })).toContain('invalid_topic_id');
  });

  it('formats hint', () => {
    expect(formatHint('Run npm run doctor first')).toContain('npm run doctor');
  });

  it('formats JSON compactly', () => {
    const out = formatJson({ ok: true, sequenceNumber: '7' });
    expect(out).toContain('"ok": true');
    expect(out).toContain('"sequenceNumber": "7"');
  });
});
