import { Buffer } from 'node:buffer';
import { formatError, formatHeadline, formatSuccess } from '../src/lib/cli/cli-output';
import { loadHederaEnv } from '../src/lib/config/hedera-env';
import { classifyHcsError } from '../src/lib/proof/hcs-error';

const color = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const env = loadHederaEnv(process.cwd());
  const sequence = getArg('--sequence');
  const expected = getArg('--hash');
  const url = new URL(`${env.mirrorNodeUrl}/api/v1/topics/${env.topicId}/messages`);
  url.searchParams.set('encoding', 'base64');
  url.searchParams.set('limit', '50');
  url.searchParams.set('order', 'desc');
  if (sequence) url.searchParams.set('sequencenumber', sequence);

  try {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Mirror Node HTTP ${response.status}: ${await response.text()}`);
      }

      const data = await response.json() as { messages?: Array<{ message: string; sequence_number: number; consensus_timestamp: string; transaction_id: string }> };
      const messages = (data.messages ?? []).map((item) => {
        try {
          const parsed = JSON.parse(Buffer.from(item.message, 'base64').toString('utf8')) as { hash?: { digest?: string; algorithm?: string } };
          return { item, parsed };
        } catch {
          return null;
        }
      }).filter((entry): entry is { item: { message: string; sequence_number: number; consensus_timestamp: string; transaction_id: string }; parsed: { hash?: { digest?: string; algorithm?: string } } } => Boolean(entry));

      const match = expected
        ? messages.find((entry) => entry.parsed.hash?.digest === expected)
        : messages[0];

      if (!match) {
        console.log(formatError(`Hash not found on Mirror Node for topic ${env.topicId}`, {
          expectedHash: expected,
          checkedMessages: messages.length,
          mirrorUrl: url.toString()
        }, { color }));
        process.exitCode = 1;
      } else {
        console.log(formatSuccess(`Mirror Node confirmed hash for sequence ${match.item.sequence_number}`, { color }));
        console.log();
        console.log(formatHeadline('Verification details', { color }));
        console.log();
        console.log(JSON.stringify({
          topicId: env.topicId,
          sequenceNumber: match.item.sequence_number,
          consensusTimestamp: match.item.consensus_timestamp,
          transactionId: match.item.transaction_id,
          hash: match.parsed.hash,
          hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`
        }, null, 2));
      }
    } catch (mirrorError) {
      console.log(formatError('Mirror verify failed', classifyHcsError(mirrorError), { color }));
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
