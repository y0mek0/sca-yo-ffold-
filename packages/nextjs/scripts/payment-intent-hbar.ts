import {
  AccountId,
  Client,
  Hbar,
  PrivateKey,
  TopicId,
  TopicMessageSubmitTransaction,
  TransactionId,
  TransferTransaction
} from '@hashgraph/sdk';
import { createPaymentExecutionProofEvent } from '../src/lib/adapters/payment-intent-execution';
import { createPaymentIntentProofEvent } from '../src/lib/adapters/payment-intent';
import { formatError, formatHeadline, formatHint, formatJson, formatSuccess } from '../src/lib/cli/cli-output';
import { loadHederaEnv } from '../src/lib/config/hedera-env';
import { LocalProofIndex } from '../src/lib/index/local-proof-index';
import { resolveProofIndexPath } from '../src/lib/index/proof-index-path';
import { buildHcsProofMessage, hashCanonicalJson, type ProofEvent } from '../src/lib/proof/proof-event';

const color = process.stdout.isTTY === true && process.env.NO_COLOR !== '1';

function parsePrivateKey(value: string): PrivateKey {
  if (value.startsWith('0x')) return PrivateKey.fromStringECDSA(value);
  return PrivateKey.fromStringDer(value);
}

function getArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function parsePositiveTinybar(value: string | undefined): number {
  const amount = Number.parseInt(value ?? '1', 10);
  if (!Number.isSafeInteger(amount) || amount <= 0) {
    throw new Error('--amount-tinybar must be a positive safe integer');
  }
  return amount;
}

async function submitProof(
  client: Client,
  topicId: TopicId,
  payer: string,
  event: ProofEvent
): Promise<{ hash: ReturnType<typeof hashCanonicalJson>; transactionId: string; sequenceNumber: string | undefined }> {
  const hash = hashCanonicalJson(event);
  const hcsMessage = buildHcsProofMessage({ event, eventHash: hash });
  const response = await new TopicMessageSubmitTransaction()
    .setTopicId(topicId)
    .setMessage(JSON.stringify(hcsMessage))
    .setTransactionId(TransactionId.generate(AccountId.fromString(payer)))
    .execute(client);
  const receipt = await response.getReceipt(client);
  return {
    hash,
    transactionId: response.transactionId.toString(),
    sequenceNumber: receipt.topicSequenceNumber?.toString()
  };
}

async function main(): Promise<void> {
  const env = loadHederaEnv(process.cwd());
  const payer = env.operatorId;
  const receiver = getArg('--receiver') ?? process.env.HEDERA_PAYMENT_RECEIVER_ID ?? '0.0.98';
  const amountTinybar = parsePositiveTinybar(getArg('--amount-tinybar') ?? process.env.HEDERA_PAYMENT_AMOUNT_TINYBAR);
  const policy = getArg('--policy') ?? 'sandbox: approve positive HBAR transfer to configured receiver';
  const actorId = `agent:payment-sandbox:${payer}`;
  const topicId = TopicId.fromString(env.topicId);
  const client = Client.forTestnet().setOperator(payer, parsePrivateKey(env.operatorKey));
  const index = new LocalProofIndex(resolveProofIndexPath());

  try {
    const intentEvent = createPaymentIntentProofEvent({
      payer,
      receiver,
      asset: 'HBAR',
      amountMinor: amountTinybar,
      policy,
      actorId
    });
    const intent = await submitProof(client, topicId, payer, intentEvent);
    await index.append({
      event: intentEvent,
      hash: intent.hash,
      hcsMessage: buildHcsProofMessage({ event: intentEvent, eventHash: intent.hash })
    });

    const transfer = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(payer), Hbar.fromTinybars(-amountTinybar))
      .addHbarTransfer(AccountId.fromString(receiver), Hbar.fromTinybars(amountTinybar))
      .setTransactionId(TransactionId.generate(AccountId.fromString(payer)))
      .execute(client);
    const receipt = await transfer.getReceipt(client);
    const status = receipt.status.toString();
    if (status !== 'SUCCESS') throw new Error(`HBAR transfer failed with status ${status}`);

    const executionEvent = createPaymentExecutionProofEvent({
      payer,
      receiver,
      amountTinybar,
      transactionId: transfer.transactionId.toString(),
      status,
      intentDigest: intent.hash.digest,
      actorId
    });
    const execution = await submitProof(client, topicId, payer, executionEvent);
    await index.append({
      event: executionEvent,
      hash: execution.hash,
      hcsMessage: buildHcsProofMessage({ event: executionEvent, eventHash: execution.hash })
    });

    console.log(formatSuccess('Payment intent and HBAR transfer completed', { color }));
    console.log();
    console.log(formatHeadline('Payment details', { color }));
    console.log();
    console.log(formatJson({
      network: env.network,
      payer,
      receiver,
      asset: 'HBAR',
      amountTinybar,
      amountHbar: amountTinybar / 100_000_000,
      intent: {
        hcsTransactionId: intent.transactionId,
        sequenceNumber: intent.sequenceNumber,
        hash: intent.hash,
        mirrorVerifyCommand: `npm run mirror:verify -- --sequence ${intent.sequenceNumber} --hash ${intent.hash.digest}`
      },
      transfer: {
        transactionId: transfer.transactionId.toString(),
        status,
        mirrorUrl: `${env.mirrorNodeUrl}/api/v1/transactions/${transfer.transactionId.toString().replace('@', '-')}`
      },
      execution: {
        hcsTransactionId: execution.transactionId,
        sequenceNumber: execution.sequenceNumber,
        hash: execution.hash,
        mirrorVerifyCommand: `npm run mirror:verify -- --sequence ${execution.sequenceNumber} --hash ${execution.hash.digest}`
      },
      hashscanTopicUrl: `https://hashscan.io/testnet/topic/${env.topicId}`
    }, { color }));
    console.log();
    console.log(formatHint('The intent proof is anchored before the transfer; the execution proof links the successful transfer back to the intent digest.', { color }));
  } catch (error) {
    const details = error instanceof Error ? { message: error.message } : { error: String(error) };
    console.log(formatError('Payment intent flow failed', details, { color }));
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
