import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';
import type { GitHubRelease } from './http-fetcher';

export type ReleaseWatcherInput = {
  owner: string;
  repo: string;
  release: GitHubRelease;
  actorId: string;
};

export function createReleaseWatcherProofEvent(input: ReleaseWatcherInput): ProofEvent {
  const repoRef = `${input.owner}/${input.repo}`;
  const isPrerelease = input.release.prerelease || input.release.draft;
  const signalKind = isPrerelease ? 'github-release-prerelease' : 'github-release';

  return normalizeProofEvent({
    kind: 'ai_decision',
    actor: { id: input.actorId, type: 'ai_agent' },
    subject: {
      id: `watcher:github:${repoRef}`,
      type: 'watcher_signal'
    },
    payload: {
      tagName: input.release.tagName,
      name: input.release.name,
      url: input.release.url,
      publishedAt: input.release.publishedAt,
      bodyExcerpt: input.release.bodyExcerpt,
      repo: repoRef
    },
    metadata: {
      adapter: 'watcher-signal',
      source: 'github-release',
      repo: repoRef,
      signalKind
    }
  });
}
