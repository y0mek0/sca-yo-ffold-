import { existsSync, readFileSync } from 'node:fs';

export type LocalProofSummary = {
  kind: string;
  subjectId: string;
  subjectType: string;
  digest: string;
  algorithm: 'sha256';
  adapter?: string;
  recordedAt: string;
};

function readJsonLines(path: string): Array<Record<string, unknown>> {
  if (!existsSync(path)) return [];

  const lines = readFileSync(path, 'utf8').split(/\r?\n/).filter(Boolean);
  const records: Array<Record<string, unknown>> = [];
  for (const line of lines) {
    try {
      records.push(JSON.parse(line) as Record<string, unknown>);
    } catch {
      // Skip corrupt lines instead of failing the whole index read.
    }
  }
  return records;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : undefined;
}

function pickSummary(record: Record<string, unknown>, index: number): LocalProofSummary {
  const hcsMessage = asRecord(record.hcsMessage) ?? {};
  const event = asRecord(record.event) ?? {};
  const subject = asRecord(hcsMessage.subject) ?? asRecord(event.subject) ?? {};
  const metadata = asRecord(hcsMessage.metadata) ?? asRecord(event.metadata) ?? {};
  const hash = asRecord(hcsMessage.hash) ?? {};

  const digest = asString(hash.digest) ?? '0'.repeat(64);
  const algorithm: 'sha256' = hash.algorithm === 'sha256' ? 'sha256' : 'sha256';

  return {
    kind: asString(hcsMessage.kind) ?? asString(event.kind) ?? 'unknown',
    subjectId: asString(subject.id) ?? 'unknown',
    subjectType: asString(subject.type) ?? 'unknown',
    digest,
    algorithm,
    adapter: asString(metadata.adapter),
    recordedAt: asString(record.recordedAt) ?? new Date(0).toISOString()
  };
}

export async function readLocalProofs(filePath: string): Promise<LocalProofSummary[]> {
  const records = readJsonLines(filePath);
  return records
    .map((record, index) => pickSummary(record, index))
    .reverse();
}
