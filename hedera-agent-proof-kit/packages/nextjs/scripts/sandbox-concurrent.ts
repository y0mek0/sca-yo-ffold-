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
import { buildHcsProofMessage, hashCanonicalJson } from '../src/lib/proof/proof-event';
import { createResearchClaimProofEvent } from '../src/lib/adapters/research-claim';

function parsePrivateKey(value: string): PrivateKey {
  if (value.startsWith('0x')) return PrivateKey.fromStringECDSA(value);
  return PrivateKey.fromStringDer(value);
}

async function main(): Promise<void> {
  const env = loadHederaEnv(process.cwd());
  const index = new LocalProofIndex(join(process.cwd(), '.data', 'proofs.jsonl'));

  async function submitOne(label: string, actorId: string) {
    const client = Client.forTestnet().setOperator(env.operatorId, parsePrivateKey(env.operatorKey));
    try {
      const event = createResearchClaimProofEvent({
        claim: `Concurrent proof ${label} at ${Date.now()}`,
        sources: ['https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service'],
        actorId
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
      await index.append({ event, hash, hcsMessage });
      return { label, ok: true, sequenceNumber, hash: hash.digest };
    } catch (error) {
      return {
        label,
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      };
    } finally {
      client.close();
    }
  }

  const startedAt = Date.now();
  const results = await Promise.all([
    submitOne('A', 'agent:concurrent-A'),
    submitOne('B', 'agent:concurrent-B'),
    submitOne('C', 'agent:concurrent-C')
  ]);
  const elapsedMs = Date.now() - startedAt;

  console.log(JSON.stringify({
    ok: results.every((r) => r.ok),
    elapsedMs,
    results
  }, null, 2));

  if (!results.every((r) => r.ok)) process.exitCode = 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
