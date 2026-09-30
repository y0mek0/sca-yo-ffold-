import { join } from 'node:path';
import {
  Client,
  PrivateKey,
  TopicId,
  TopicMessageSubmitTransaction,
  TransactionId
} from '@hashgraph/sdk';
import { loadHederaEnv } from '../src/lib/config/hedera-env';
import { LocalProofIndex } from '../src/lib/index/local-proof-index';
import { classifyHcsError } from '../src/lib/proof/hcs-error';
import { buildHcsProofMessage, hashCanonicalJson } from '../src/lib/proof/proof-event';
import { fetchGitHubRelease } from '../src/lib/adapters/http-fetcher';
import { createReleaseWatcherProofEvent } from '../src/lib/adapters/release-watcher';

function parsePrivateKey(value: string): PrivateKey {
  if (value.startsWith('0x')) return PrivateKey.fromStringECDSA(value);
  return PrivateKey.fromStringDer(value);
}

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const env = loadHederaEnv(process.cwd());
  const owner = getArg('--owner') ?? process.env.WATCHER_REPO_OWNER ?? 'y0mek0';
  const repo = getArg('--repo') ?? process.env.WATCHER_REPO_NAME ?? 'sca-yo-ffold-';

  const release = await fetchGitHubRelease({ owner, repo });
  const event = createReleaseWatcherProofEvent({
    owner,
    repo,
    release,
    actorId: `agent:release-watcher:${owner}/${repo}`
  });
  const hash = hashCanonicalJson(event);
  const hcsMessage = buildHcsProofMessage({ event, eventHash: hash });
  const message = JSON.stringify(hcsMessage);

  const client = Client.forTestnet().setOperator(env.operatorId, parsePrivateKey(env.operatorKey));
  try {
    try {
      const tx = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(env.topicId))
        .setMessage(message)
        .setTransactionId(TransactionId.generate(env.operatorId))
        .execute(client);

      const receipt = await tx.getReceipt(client);
      const sequenceNumber = receipt.topicSequenceNumber?.toString();

      await new LocalProofIndex(join(process.cwd(), '.data', 'proofs.jsonl')).append({ event, hash, hcsMessage });

      console.log(JSON.stringify({
        ok: true,
        scenario: 'release-watcher end-to-end',
        repo: `${owner}/${repo}`,
        tagName: release.tagName,
        releaseUrl: release.url,
        topicId: env.topicId,
        transactionId: tx.transactionId.toString(),
        sequenceNumber,
        hash,
        hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`
      }, null, 2));
    } catch (error) {
      console.log(JSON.stringify({
        ok: false,
        scenario: 'release-watcher end-to-end',
        repo: `${owner}/${repo}`,
        error: classifyHcsError(error),
        rawMessage: error instanceof Error ? error.message : String(error)
      }, null, 2));
      process.exitCode = 1;
    }
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
