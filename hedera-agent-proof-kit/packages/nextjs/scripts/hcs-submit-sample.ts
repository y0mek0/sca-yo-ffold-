import {
  Client,
  PrivateKey,
  TopicId,
  TopicMessageSubmitTransaction,
  TransactionId
} from '@hashgraph/sdk';
import { join } from 'node:path';
import { loadHederaEnv } from '../src/lib/config/hedera-env';
import { LocalProofIndex } from '../src/lib/index/local-proof-index';
import { buildSampleProof } from '../src/lib/proof/sample-proof';

function parsePrivateKey(value: string): PrivateKey {
  if (value.startsWith('0x')) return PrivateKey.fromStringECDSA(value);
  return PrivateKey.fromStringDer(value);
}

async function main(): Promise<void> {
  const env = loadHederaEnv(process.cwd());
  const client = Client.forTestnet().setOperator(env.operatorId, parsePrivateKey(env.operatorKey));
  const sample = buildSampleProof('research_claim');
  const topicId = TopicId.fromString(env.topicId);
  const message = JSON.stringify(sample.hcsMessage);

  try {
    const txResponse = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .setTransactionId(TransactionId.generate(env.operatorId))
      .execute(client);

    const receipt = await txResponse.getReceipt(client);
    const sequenceNumber = receipt.topicSequenceNumber?.toString();

    await new LocalProofIndex(join(process.cwd(), '.data', 'proofs.jsonl')).append(sample);

    console.log(JSON.stringify({
      ok: true,
      network: env.network,
      topicId: env.topicId,
      transactionId: txResponse.transactionId.toString(),
      sequenceNumber,
      hash: sample.hash,
      mirrorNodeUrl: env.mirrorNodeUrl,
      mirrorVerifyCommand: `npm run mirror:verify -- --sequence ${sequenceNumber}`,
      hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`
    }, null, 2));
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
