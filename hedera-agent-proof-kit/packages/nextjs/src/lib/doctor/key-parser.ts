export type ParsedAccountId = {
  shard: number;
  realm: number;
  num: number;
};

export type KeyDescription = {
  format: 'ecdsa-hex' | 'ed25519-der' | 'unknown';
  normalized: string;
};

const ACCOUNT_PATTERN = /^(\d+)\.(\d+)\.(\d+)$/;

export function parseHederaAccountId(value: string): ParsedAccountId {
  const match = ACCOUNT_PATTERN.exec(value.trim());
  if (!match) throw new Error(`Invalid Hedera account id: ${value}`);

  const [, shard, realm, num] = match;
  const shardNum = Number(shard);
  const realmNum = Number(realm);
  const numNum = Number(num);

  if (!Number.isInteger(shardNum) || !Number.isInteger(realmNum) || !Number.isInteger(numNum)) {
    throw new Error(`Invalid Hedera account id: ${value}`);
  }
  if (shardNum < 0 || realmNum < 0 || numNum < 0) {
    throw new Error(`Invalid Hedera account id: ${value}`);
  }

  return { shard: shardNum, realm: realmNum, num: numNum };
}

export function describeHederaKey(value: string): KeyDescription {
  const trimmed = value.trim();

  if (trimmed.startsWith('0x') && /^[0-9a-fA-F]+$/.test(trimmed.slice(2))) {
    return { format: 'ecdsa-hex', normalized: trimmed.slice(2).toLowerCase() };
  }

  if (/^[0-9a-fA-F]+$/.test(trimmed) && trimmed.startsWith('302e')) {
    return { format: 'ed25519-der', normalized: trimmed.toLowerCase() };
  }

  throw new Error(`Unsupported Hedera key shape: ${value}`);
}
