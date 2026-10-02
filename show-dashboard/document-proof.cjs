const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { Client, PrivateKey, TopicId, TopicMessageSubmitTransaction, TransactionId } = createRequire(path.join(process.env.TRACEMARK_REPO, 'package.json'))('@hashgraph/sdk');

function envValue(name) {
  const files = [
    path.join(process.env.TRACEMARK_REPO, '.env.local'),
    path.join(process.env.TRACEMARK_REPO, 'packages', 'nextjs', '.env.local')
  ];
  const values = {};
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
      const index = line.indexOf('=');
      if (index > 0 && !line.trim().startsWith('#')) values[line.slice(0, index).trim()] = line.slice(index + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  }
  return process.env[name] || values[name];
}
function sorted(value) {
  if (Array.isArray(value)) return value.map(sorted);
  if (value && typeof value === 'object') return Object.keys(value).sort().reduce((out, key) => { out[key] = sorted(value[key]); return out; }, {});
  return value;
}
function canonical(value) { return JSON.stringify(sorted(value)); }
function parseKey(value) { return value.startsWith('0x') ? PrivateKey.fromStringECDSA(value) : PrivateKey.fromStringDer(value); }
async function main() {
  const operatorId = envValue('HEDERA_OPERATOR_ID');
  const operatorKey = envValue('HEDERA_OPERATOR_KEY');
  const topicId = envValue('HEDERA_TOPIC_ID') || envValue('HEDERA_HCS_TOPIC_ID');
  if (!operatorId || !operatorKey || !topicId) throw new Error('Hedera environment is incomplete');
  const document = {
    kind: 'document_hash',
    actor: { id: 'demo:document-review', type: 'workflow' },
    subject: { id: 'document:quarterly-risk-brief.pdf', type: 'document' },
    payload: { fileName: 'quarterly-risk-brief.pdf', mimeType: 'application/pdf', sha256: crypto.createHash('sha256').update('Tracemark demo document content v1').digest('hex') },
    metadata: { adapter: 'document-office', capturedAt: new Date().toISOString() }
  };
  const digest = crypto.createHash('sha256').update(canonical(document)).digest('hex');
  const envelope = { version: 1, event: document, hash: { algorithm: 'sha-256', digest }, proof: { type: 'hcs' } };
  const client = Client.forTestnet().setOperator(operatorId, parseKey(operatorKey));
  try {
    const tx = await new TopicMessageSubmitTransaction().setTopicId(TopicId.fromString(topicId)).setMessage(JSON.stringify(envelope)).setTransactionId(TransactionId.generate(operatorId)).execute(client);
    const receipt = await tx.getReceipt(client);
    console.log(JSON.stringify({ source: 'DOCUMENT', sequenceNumber: receipt.topicSequenceNumber?.toString(), digest, transactionId: tx.transactionId.toString() }));
  } finally { client.close(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exitCode = 1; });
