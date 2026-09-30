import { createHash } from 'node:crypto';

export type ProofEventKind = 'research_claim' | 'ai_decision' | 'document_hash';

export type ProofActor = {
  id: string;
  type: 'ai_agent' | 'user' | 'backend' | 'tool';
};

export type ProofSubject = {
  id: string;
  type: 'claim' | 'decision' | 'document' | 'payment_intent' | 'browser_action' | 'watcher_signal' | 'rag_memory' | 'agent_evaluation';
};

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type ProofEventInput = {
  kind: ProofEventKind;
  actor: ProofActor;
  subject: ProofSubject;
  payload: Record<string, unknown>;
  metadata?: Record<string, unknown>;
};

export type ProofEvent = {
  schemaVersion: 'agentproof.v1';
  kind: ProofEventKind;
  actor: ProofActor;
  subject: ProofSubject;
  payload: JsonValue;
  metadata: JsonValue;
};

export type ProofHash = {
  algorithm: 'sha256';
  digest: string;
};

export type HcsProofMessage = {
  schemaVersion: 'agentproof.hcs.v1';
  eventSchemaVersion: ProofEvent['schemaVersion'];
  kind: ProofEventKind;
  subject: ProofSubject;
  hash: ProofHash;
  metadata: JsonValue;
};

function assertNoUndefined(value: unknown, path = 'event'): void {
  if (value === undefined) {
    throw new Error(`ProofEvent contains undefined at ${path}. Use null or omit the field.`);
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoUndefined(item, `${path}[${index}]`));
    return;
  }

  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, item]) => assertNoUndefined(item, `${path}.${key}`));
  }
}

function toJsonValue(value: unknown): JsonValue {
  assertNoUndefined(value);
  return JSON.parse(JSON.stringify(value)) as JsonValue;
}

export function normalizeProofEvent(input: ProofEventInput): ProofEvent {
  assertNoUndefined(input);

  return {
    schemaVersion: 'agentproof.v1',
    kind: input.kind,
    actor: toJsonValue(input.actor) as ProofActor,
    subject: toJsonValue(input.subject) as ProofSubject,
    payload: toJsonValue(input.payload),
    metadata: toJsonValue(input.metadata ?? {})
  };
}

function canonicalizeValue(value: JsonValue): string {
  if (value === null || typeof value !== 'object') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeValue).join(',')}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalizeValue(value[key])}`)
    .join(',')}}`;
}

export function canonicalizeJson(value: JsonValue): string {
  return canonicalizeValue(value);
}

export function hashCanonicalJson(value: JsonValue): ProofHash {
  return {
    algorithm: 'sha256',
    digest: createHash('sha256').update(canonicalizeJson(value)).digest('hex')
  };
}

export function buildHcsProofMessage(input: { event: ProofEvent; eventHash: ProofHash }): HcsProofMessage {
  return {
    schemaVersion: 'agentproof.hcs.v1',
    eventSchemaVersion: input.event.schemaVersion,
    kind: input.event.kind,
    subject: input.event.subject,
    hash: input.eventHash,
    metadata: input.event.metadata
  };
}
