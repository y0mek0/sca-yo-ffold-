import { Buffer } from 'node:buffer';
import { loadHederaEnv } from '../src/lib/config/hedera-env';
import { buildSampleProof } from '../src/lib/proof/sample-proof';

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main(): Promise<void> {
  const env = loadHederaEnv(process.cwd());
  const sequence = getArg('--sequence');
  const expectedHash = buildSampleProof('research_claim').hash;
  const url = new URL(`${env.mirrorNodeUrl}/api/v1/topics/${env.topicId}/messages`);
  url.searchParams.set('encoding', 'base64');
  url.searchParams.set('limit', '25');
  url.searchParams.set('order', 'desc');
  if (sequence) url.searchParams.set('sequencenumber', sequence);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Mirror Node HTTP ${response.status}: ${await response.text()}`);
  }

  const data = await response.json() as { messages?: Array<{ message: string; sequence_number: number; consensus_timestamp: string; transaction_id: string }> };
  const match = (data.messages ?? [])
    .map((item) => {
      try {
        return { item, parsed: JSON.parse(Buffer.from(item.message, 'base64').toString('utf8')) as { hash?: { digest?: string; algorithm?: string } } };
      } catch {
        return null;
      }
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .find(({ parsed }) => parsed.hash?.digest === expectedHash.digest && parsed.hash?.algorithm === expectedHash.algorithm);

  if (!match) {
    console.log(JSON.stringify({
      ok: false,
      reason: 'hash_not_found_on_mirror',
      topicId: env.topicId,
      expectedHash,
      checkedUrl: url.toString(),
      messagesChecked: data.messages?.length ?? 0
    }, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({
      ok: true,
      reason: 'mirror_hash_match',
      topicId: env.topicId,
      sequenceNumber: match.item.sequence_number,
      consensusTimestamp: match.item.consensus_timestamp,
      transactionId: match.item.transaction_id,
      hash: expectedHash,
      checkedUrl: url.toString(),
      hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`
    }, null, 2));
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
