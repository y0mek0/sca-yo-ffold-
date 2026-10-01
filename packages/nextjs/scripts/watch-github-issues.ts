import {
  Client,
  PrivateKey,
  TopicId,
  TopicMessageSubmitTransaction,
  TransactionId
} from '@hashgraph/sdk';
import { loadHederaEnv } from '../src/lib/config/hedera-env';
import { LocalProofIndex } from '../src/lib/index/local-proof-index';
import { resolveProofIndexPath } from '../src/lib/index/proof-index-path';
import { fetchLatestOpenIssues } from '../src/lib/adapters/github-issues-fetcher';
import { createWatcherSignalProofEvent } from '../src/lib/adapters/watcher-signal';
import { classifyHcsError } from '../src/lib/proof/hcs-error';
import { buildHcsProofMessage, hashCanonicalJson } from '../src/lib/proof/proof-event';
import { formatError, formatHeadline, formatSuccess, formatHint, formatJson } from '../src/lib/cli/cli-output';

const color = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

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
  const repo = getArg('--repo') ?? process.env.WATCHER_REPO_NAME ?? 'tracemark';
  const limit = Number.parseInt(getArg('--limit') ?? '5', 10);
  const client = Client.forTestnet().setOperator(env.operatorId, parsePrivateKey(env.operatorKey));

  try {
    try {
      const issues = await fetchLatestOpenIssues({ owner, repo, limit });
      const issuesSummary = issues.map((issue) => ({
        number: issue.number,
        title: issue.title,
        url: issue.html_url,
        user: issue.user.login,
        createdAt: issue.created_at
      }));

      const event = createWatcherSignalProofEvent({
        actorId: `agent:issues-watcher:${owner}/${repo}`,
        source: 'github-issues',
        signal: `${owner}/${repo} latest open issues: ${issues.map((i) => `#${i.number}`).join(', ') || 'none'}`
      });

      const hash = hashCanonicalJson(event);
      const hcsMessage = buildHcsProofMessage({ event, eventHash: hash });
      const tx = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(env.topicId))
        .setMessage(JSON.stringify(hcsMessage))
        .setTransactionId(TransactionId.generate(env.operatorId))
        .execute(client);

      const receipt = await tx.getReceipt(client);
      const sequenceNumber = receipt.topicSequenceNumber?.toString();

      await new LocalProofIndex(resolveProofIndexPath()).append({ event, hash, hcsMessage });

      console.log(formatSuccess(`Issues watcher published ${issues.length} issue(s) as sequence ${sequenceNumber}`, { color }));
      console.log();
      console.log(formatHeadline('Watch details', { color }));
      console.log();
      console.log(formatJson({
        repo: `${owner}/${repo}`,
        issueCount: issues.length,
        issues: issuesSummary,
        topicId: env.topicId,
        sequenceNumber,
        hash,
        hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`
      }, { color }));
      console.log();
      console.log(formatHint('Run npm run mirror:verify to confirm on Mirror Node.', { color }));
    } catch (error) {
      console.log(formatError('Issues watcher failed', classifyHcsError(error instanceof Error && /HTTP/.test(error.message) ? { message: error.message } : error), { color }));
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
