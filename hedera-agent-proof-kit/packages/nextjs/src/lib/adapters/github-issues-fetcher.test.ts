import { describe, expect, it } from 'vitest';
import { fetchLatestOpenIssues, type GitHubIssue } from './github-issues-fetcher';

describe('fetchLatestOpenIssues', () => {
  it('returns the N latest open issues for a repo', async () => {
    const issues: GitHubIssue[] = [
      { number: 9, title: 'recent', html_url: 'https://x/9', state: 'open', created_at: '2026-09-30T01:00:00Z', user: { login: 'alice' } },
      { number: 8, title: 'middle', html_url: 'https://x/8', state: 'open', created_at: '2026-09-30T00:00:00Z', user: { login: 'bob' } }
    ];
    const calls: Array<{ url: string }> = [];
    const result = await fetchLatestOpenIssues({
      owner: 'y0mek0',
      repo: 'sca-yo-ffold-',
      limit: 2,
      fetchImpl: async (input) => {
        calls.push({ url: String(input) });
        return new Response(JSON.stringify(issues), { status: 200 });
      }
    });

    expect(result).toHaveLength(2);
    expect(result[0].number).toBe(9);
    expect(calls[0].url).toContain('repos/y0mek0/sca-yo-ffold-/issues');
    expect(calls[0].url).toContain('state=open');
  });

  it('rejects when the GitHub response is not 2xx', async () => {
    await expect(
      fetchLatestOpenIssues({
        owner: 'x',
        repo: 'y',
        fetchImpl: async () => new Response('forbidden', { status: 403 })
      })
    ).rejects.toThrow(/http 403/i);
  });

  it('uses a sane default limit', async () => {
    let captured = '';
    await fetchLatestOpenIssues({
      owner: 'x',
      repo: 'y',
      fetchImpl: async (input) => {
        captured = String(input);
        return new Response('[]', { status: 200 });
      }
    });
    expect(captured).toContain('per_page=5');
  });
});
