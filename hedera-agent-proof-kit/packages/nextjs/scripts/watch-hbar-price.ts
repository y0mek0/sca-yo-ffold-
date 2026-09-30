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
import { fetchHbarPrice } from '../src/lib/adapters/coingecko-fetcher';
import { createPriceWatcherProofEvent } from '../src/lib/adapters/price-watcher';
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
  const threshold = Number.parseFloat(getArg('--threshold') ?? process.env.HBAR_THRESHOLD ?? '0');
  const direction = (getArg('--direction') ?? process.env.HBAR_DIRECTION ?? 'above') as 'above' | 'below';
  const client = Client.forTestnet().setOperator(env.operatorId, parsePrivateKey(env.operatorKey));

  try {
    try {
      const price = await fetchHbarPrice();
      const event = createPriceWatcherProofEvent({
        asset: 'HBAR',
        price,
        threshold,
        direction,
        actorId: 'agent:price-watcher:hbar'
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

      await new LocalProofIndex(join(process.cwd(), '.data', 'proofs.jsonl')).append({ event, hash, hcsMessage });

      console.log(formatSuccess(`HBAR price watcher published sequence ${sequenceNumber}`, { color }));
      console.log();
      console.log(formatHeadline('Watch details', { color }));
      console.log();
      console.log(formatJson({
        asset: 'HBAR',
        priceUsd: price.priceUsd,
        threshold,
        direction,
        fetchedAt: price.fetchedAt,
        topicId: env.topicId,
        sequenceNumber,
        hash,
        hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`
      }, { color }));
      console.log();
      console.log(formatHint('Run npm run mirror:verify to confirm on Mirror Node.', { color }));
    } catch (error) {
      console.log(formatError('Price watcher failed', classifyHcsError(error instanceof Error && /HTTP/.test(error.message) ? { message: error.message } : error), { color }));
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
