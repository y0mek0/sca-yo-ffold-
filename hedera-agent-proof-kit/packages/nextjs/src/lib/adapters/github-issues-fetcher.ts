export type GitHubIssue = {
  number: number;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  created_at: string;
  user: { login: string };
};

export type FetchLatestOpenIssuesOptions = {
  owner: string;
  repo: string;
  limit?: number;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export async function fetchLatestOpenIssues(options: FetchLatestOpenIssuesOptions): Promise<GitHubIssue[]> {
  const base = options.baseUrl ?? 'https://api.github.com';
  const limit = options.limit ?? 5;
  const url = `${base}/repos/${encodeURIComponent(options.owner)}/${encodeURIComponent(options.repo)}/issues?state=open&sort=created&direction=desc&per_page=${limit}`;

  const fetchImpl = options.fetchImpl ?? fetch;
  const response = await fetchImpl(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'agentproof-hbar-template'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub issues HTTP ${response.status} for ${options.owner}/${options.repo}`);
  }

  return await response.json() as GitHubIssue[];
}
