export type GitHubRelease = {
  tagName: string;
  name: string | null;
  url: string;
  publishedAt: string;
  bodyExcerpt: string;
  prerelease: boolean;
  draft: boolean;
};

type GitHubReleasePayload = {
  tag_name?: string;
  name?: string | null;
  html_url?: string;
  published_at?: string;
  body?: string | null;
  prerelease?: boolean;
  draft?: boolean;
};

export type FetchReleaseOptions = {
  owner: string;
  repo: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export async function fetchGitHubRelease(options: FetchReleaseOptions): Promise<GitHubRelease> {
  const base = options.baseUrl ?? 'https://api.github.com';
  const url = `${base}/repos/${encodeURIComponent(options.owner)}/${encodeURIComponent(options.repo)}/releases/latest`;
  const fetchImpl = options.fetchImpl ?? fetch;

  const response = await fetchImpl(url, {
    headers: {
      accept: 'application/vnd.github+json',
      'user-agent': 'tracemark-template'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub releases HTTP ${response.status} for ${options.owner}/${options.repo}`);
  }

  const data = await response.json() as GitHubReleasePayload;
  if (!data.tag_name || !data.html_url || !data.published_at) {
    throw new Error(`GitHub release payload missing required fields for ${options.owner}/${options.repo}`);
  }

  const body = data.body ?? '';
  const bodyExcerpt = body.length > 280 ? `${body.slice(0, 277)}...` : body;

  return {
    tagName: data.tag_name,
    name: data.name ?? null,
    url: data.html_url,
    publishedAt: data.published_at,
    bodyExcerpt,
    prerelease: Boolean(data.prerelease),
    draft: Boolean(data.draft)
  };
}
