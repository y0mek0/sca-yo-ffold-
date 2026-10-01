import { describe, expect, it } from 'vitest';
import { createReleaseWatcherProofEvent } from './release-watcher';

describe('createReleaseWatcherProofEvent', () => {
  it('builds a watcher_signal proof from a GitHub release', () => {
    const event = createReleaseWatcherProofEvent({
      owner: 'y0mek0',
      repo: 'tracemark',
      release: {
        tagName: 'v0.1.0',
        name: 'first',
        url: 'https://github.com/y0mek0/tracemark/releases/tag/v0.1.0',
        publishedAt: '2026-09-30T00:00:00Z',
        bodyExcerpt: 'first proof',
        prerelease: false,
        draft: false
      },
      actorId: 'agent:release-watcher'
    });

    expect(event.subject.type).toBe('watcher_signal');
    expect(event.subject.id).toBe('watcher:github:y0mek0/tracemark');
    expect(event.metadata).toMatchObject({ adapter: 'watcher-signal', source: 'github-release', repo: 'y0mek0/tracemark' });
    expect(event.payload).toMatchObject({
      tagName: 'v0.1.0',
      url: 'https://github.com/y0mek0/tracemark/releases/tag/v0.1.0'
    });
  });
});
