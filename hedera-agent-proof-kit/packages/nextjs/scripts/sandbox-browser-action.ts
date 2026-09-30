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
import { createBrowserActionProofEvent } from '../src/lib/adapters/browser-action';
import { buildHcsProofMessage, hashCanonicalJson } from '../src/lib/proof/proof-event';
import { classifyHcsError } from '../src/lib/proof/hcs-error';

function parsePrivateKey(value: string): PrivateKey {
  if (value.startsWith('0x')) return PrivateKey.fromStringECDSA(value);
  return PrivateKey.fromStringDer(value);
}

async function main(): Promise<void> {
  const env = loadHederaEnv(process.cwd());
  const client = Client.forTestnet().setOperator(env.operatorId, parsePrivateKey(env.operatorKey));

  const event = createBrowserActionProofEvent({
    url: 'https://hedera.com/blog/scaffold-hbar-template-bounty/',
    action: 'view',
    result: 'loaded bounty blog post',
    actorId: 'agent:browser-demo'
  });
  const hash = hashCanonicalJson(event);
  const hcsMessage = buildHcsProofMessage({ event, eventHash: hash });

  try {
    try {
      const tx = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(env.topicId))
        .setMessage(JSON.stringify(hcsMessage))
        .setTransactionId(TransactionId.generate(env.operatorId))
        .execute(client);

      const receipt = await tx.getReceipt(client);
      const sequenceNumber = receipt.topicSequenceNumber?.toString();

      await new LocalProofIndex(join(process.cwd(), '.data', 'proofs.jsonl')).append({ event, hash, hcsMessage });

      console.log(JSON.stringify({
        ok: true,
        scenario: 'browser-action end-to-end',
        topicId: env.topicId,
        transactionId: tx.transactionId.toString(),
        sequenceNumber,
        hash,
        hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`
      }, null, 2));
    } catch (error) {
      console.log(JSON.stringify({ ok: false, scenario: 'browser-action end-to-end', error: classifyHcsError(error) }, null, 2));
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
