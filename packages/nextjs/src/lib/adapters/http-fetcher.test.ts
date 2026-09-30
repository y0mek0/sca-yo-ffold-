import { describe, expect, it } from 'vitest';
import { fetchGitHubRelease } from './http-fetcher';

describe('fetchGitHubRelease', () => {
  it('returns the latest release for a public repo', async () => {
    const calls: Array<{ url: string }> = [];
    const payload = {
      tag_name: 'v0.1.0',
      name: 'Demo release',
      html_url: 'https://github.com/y0mek0/sca-yo-ffold-/releases/tag/v0.1.0',
      published_at: '2026-09-30T00:00:00Z',
      body: 'first',
      prerelease: false,
      draft: false
    };
    const result = await fetchGitHubRelease({
      owner: 'y0mek0',
      repo: 'sca-yo-ffold-',
      fetchImpl: async (input) => {
        calls.push({ url: String(input) });
        return new Response(JSON.stringify(payload), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    });

    expect(result.tagName).toBe('v0.1.0');
    expect(result.url).toBe('https://github.com/y0mek0/sca-yo-ffold-/releases/tag/v0.1.0');
    expect(calls[0].url).toBe('https://api.github.com/repos/y0mek0/sca-yo-ffold-/releases/latest');
  });

  it('reports an HTTP error cleanly', async () => {
    await expect(
      fetchGitHubRelease({
        owner: 'y0mek0',
        repo: 'sca-yo-ffold-',
        fetchImpl: async () => new Response('boom', { status: 404 })
      })
    ).rejects.toThrow(/http 404/i);
  });

  it('surfaces network errors', async () => {
    await expect(
      fetchGitHubRelease({
        owner: 'y0mek0',
        repo: 'sca-yo-ffold-',
        fetchImpl: async () => {
          throw new Error('EAI_AGAIN');
        }
      })
    ).rejects.toThrow(/EAI_AGAIN/);
  });
});
