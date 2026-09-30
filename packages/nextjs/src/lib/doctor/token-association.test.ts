import { describe, expect, it } from 'vitest';
import { checkTokenAssociation } from './token-association';

describe('checkTokenAssociation', () => {
  it('returns associated when mirror node lists the token explicitly', async () => {
    const calls: Array<{ url: string }> = [];
    const result = await checkTokenAssociation({
      accountId: '0.0.10380366',
      tokenId: '0.0.429274',
      mirrorNodeUrl: 'https://mirror.example',
      fetchImpl: async (input) => {
        calls.push({ url: String(input) });
        return new Response(JSON.stringify({ tokens: [{ token_id: '0.0.429274' }] }), { status: 200 });
      }
    });

    expect(result).toEqual({ ok: true, reason: 'associated' });
    expect(calls).toHaveLength(1);
    expect(calls[0].url).toContain('/api/v1/accounts/0.0.10380366/tokens?token.id=0.0.429274');
  });

  it('reports missing association when token is not in the list', async () => {
    const result = await checkTokenAssociation({
      accountId: '0.0.10380366',
      tokenId: '0.0.429274',
      mirrorNodeUrl: 'https://mirror.example',
      fetchImpl: async () =>
        new Response(JSON.stringify({ tokens: [{ token_id: '0.0.9999' }] }), { status: 200 })
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/not associated/i);
  });

  it('reports a network failure as a clean error code', async () => {
    const result = await checkTokenAssociation({
      accountId: '0.0.10380366',
      tokenId: '0.0.429274',
      mirrorNodeUrl: 'https://mirror.example',
      fetchImpl: async () => new Response('boom', { status: 503 })
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe('mirror_node_http_503');
  });

  it('treats fetch network errors as unreachable', async () => {
    const result = await checkTokenAssociation({
      accountId: '0.0.10380366',
      tokenId: '0.0.429274',
      mirrorNodeUrl: 'https://mirror.example',
      fetchImpl: async () => {
        throw new Error('EAI_AGAIN');
      }
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toMatch(/unreachable/i);
  });
});
