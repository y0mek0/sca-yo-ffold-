import {
  Client,
  PrivateKey,
  TopicId,
  TopicMessageSubmitTransaction,
  TransactionId
} from '@hashgraph/sdk';
import { formatError, formatHeadline, formatHint, formatJson, formatSuccess } from '../src/lib/cli/cli-output';
import { loadHederaEnv } from '../src/lib/config/hedera-env';
import { LocalProofIndex } from '../src/lib/index/local-proof-index';
import { resolveProofIndexPath } from '../src/lib/index/proof-index-path';
import { classifyHcsError } from '../src/lib/proof/hcs-error';
import { buildSampleProof } from '../src/lib/proof/sample-proof';

const color = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

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
    try {
      const txResponse = await new TopicMessageSubmitTransaction()
        .setTopicId(topicId)
        .setMessage(message)
        .setTransactionId(TransactionId.generate(env.operatorId))
        .execute(client);

      const receipt = await txResponse.getReceipt(client);
      const sequenceNumber = receipt.topicSequenceNumber?.toString();

      await new LocalProofIndex(resolveProofIndexPath()).append(sample);

      console.log(formatSuccess(`Proof anchored to topic ${env.topicId} as sequence ${sequenceNumber}`, { color }));
      console.log();
      console.log(formatHeadline('Submit details', { color }));
      console.log();
      console.log(formatJson({
        network: env.network,
        topicId: env.topicId,
        transactionId: txResponse.transactionId.toString(),
        sequenceNumber,
        hash: sample.hash,
        hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`,
        mirrorVerifyCommand: `npm run mirror:verify -- --sequence ${sequenceNumber}`
      }, { color }));
      console.log();
      console.log(formatHint(`Next: ${`npm run mirror:verify -- --sequence ${sequenceNumber}`}`, { color }));
    } catch (submitError) {
      const classified = classifyHcsError(submitError);
      console.log(formatError(`HCS submit failed for topic ${env.topicId}`, classified, { color }));
      console.log(formatHint('Run npm run doctor to validate your .env.local values.', { color }));
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
