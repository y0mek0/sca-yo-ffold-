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
import { buildHcsProofMessage, hashCanonicalJson } from '../src/lib/proof/proof-event';
import { createHtsTreasurySnapshotProofEvent, fetchHtsTreasurySnapshot } from '../src/lib/adapters/hts-treasury-snapshot';

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
  const tokenId = getArg('--token-id') ?? process.env.HEDERA_PROOF_TOKEN_ID ?? '0.0.429274';
  const client = Client.forTestnet().setOperator(env.operatorId, parsePrivateKey(env.operatorKey));

  try {
    try {
      const snapshot = await fetchHtsTreasurySnapshot({ tokenId, mirrorNodeUrl: env.mirrorNodeUrl });
      const event = createHtsTreasurySnapshotProofEvent({ snapshot });
      const hash = hashCanonicalJson(event);
      const hcsMessage = buildHcsProofMessage({ event, eventHash: hash });
      const txResponse = await new TopicMessageSubmitTransaction()
        .setTopicId(TopicId.fromString(env.topicId))
        .setMessage(JSON.stringify(hcsMessage))
        .setTransactionId(TransactionId.generate(env.operatorId))
        .execute(client);
      const receipt = await txResponse.getReceipt(client);
      const sequenceNumber = receipt.topicSequenceNumber?.toString();

      await new LocalProofIndex(resolveProofIndexPath()).append({ event, hash, hcsMessage });

      console.log(formatSuccess(`HTS treasury snapshot for ${tokenId} anchored as sequence ${sequenceNumber}`, { color }));
      console.log();
      console.log(formatHeadline('Snapshot details', { color }));
      console.log();
      console.log(formatJson({
        tokenId: snapshot.tokenId,
        symbol: snapshot.symbol,
        name: snapshot.name,
        totalSupply: snapshot.totalSupply,
        decimals: snapshot.decimals,
        treasuryAccountId: snapshot.treasuryAccountId,
        treasuryBalance: snapshot.treasuryBalance,
        fetchedAt: snapshot.fetchedAt,
        topicId: env.topicId,
        sequenceNumber,
        hash,
        hashscanUrl: `https://hashscan.io/testnet/topic/${env.topicId}`,
        mirrorVerifyCommand: `npm run mirror:verify -- --sequence ${sequenceNumber}`
      }, { color }));
      console.log();
      console.log(formatHint(`Run npm run mirror:verify -- --sequence ${sequenceNumber} to verify the HCS hash.`, { color }));
    } catch (error) {
      console.log(formatError('HTS treasury snapshot proof failed', classifyHcsError(error), { color }));
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
