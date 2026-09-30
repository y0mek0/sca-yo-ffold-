import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type HtsTreasurySnapshot = {
  source: 'hedera-mirror-node';
  tokenId: string;
  name: string;
  symbol: string;
  type: string;
  decimals: number;
  totalSupply: string;
  supplyType: string;
  treasuryAccountId: string;
  treasuryBalance: string | null;
  freezeDefault: boolean;
  fetchedAt: string;
};

type MirrorTokenPayload = {
  token_id?: unknown;
  name?: unknown;
  symbol?: unknown;
  type?: unknown;
  decimals?: unknown;
  total_supply?: unknown;
  supply_type?: unknown;
  treasury_account_id?: unknown;
  freeze_default?: unknown;
};

type MirrorBalancePayload = {
  balances?: Array<{ account?: unknown; balance?: unknown }>;
};

export type FetchHtsTreasurySnapshotOptions = {
  tokenId: string;
  mirrorNodeUrl?: string;
  fetchImpl?: typeof fetch;
  now?: () => string;
};

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Mirror Node token payload missing ${field}`);
  }
  return value;
}

function requiredNumber(value: unknown, field: string): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`Mirror Node token payload missing ${field}`);
  }
  return number;
}

export async function fetchHtsTreasurySnapshot(
  options: FetchHtsTreasurySnapshotOptions
): Promise<HtsTreasurySnapshot> {
  const tokenId = requiredString(options.tokenId, 'tokenId');
  const baseUrl = (options.mirrorNodeUrl ?? 'https://testnet.mirrornode.hedera.com').replace(/\/$/, '');
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => new Date().toISOString());
  const tokenUrl = `${baseUrl}/api/v1/tokens/${encodeURIComponent(tokenId)}`;
  const tokenResponse = await fetchImpl(tokenUrl, {
    headers: { accept: 'application/json', 'user-agent': 'agentproof-hbar-template' }
  });

  if (!tokenResponse.ok) {
    throw new Error(`Mirror Node HTTP ${tokenResponse.status} for token ${tokenId}`);
  }

  const token = await tokenResponse.json() as MirrorTokenPayload;
  const treasuryAccountId = requiredString(token.treasury_account_id, 'treasury_account_id');
  const balanceUrl = `${baseUrl}/api/v1/tokens/${encodeURIComponent(tokenId)}/balances?account.id=${encodeURIComponent(treasuryAccountId)}`;
  const balanceResponse = await fetchImpl(balanceUrl, {
    headers: { accept: 'application/json', 'user-agent': 'agentproof-hbar-template' }
  });

  if (!balanceResponse.ok) {
    throw new Error(`Mirror Node HTTP ${balanceResponse.status} for treasury balance ${tokenId}`);
  }

  const balancePayload = await balanceResponse.json() as MirrorBalancePayload;
  const balance = balancePayload.balances?.find((entry) => entry.account === treasuryAccountId)?.balance;

  return {
    source: 'hedera-mirror-node',
    tokenId: requiredString(token.token_id, 'token_id'),
    name: requiredString(token.name, 'name'),
    symbol: requiredString(token.symbol, 'symbol'),
    type: requiredString(token.type, 'type'),
    decimals: requiredNumber(token.decimals, 'decimals'),
    totalSupply: requiredString(token.total_supply, 'total_supply'),
    supplyType: requiredString(token.supply_type, 'supply_type'),
    treasuryAccountId,
    treasuryBalance: balance === undefined || balance === null ? null : String(balance),
    freezeDefault: Boolean(token.freeze_default),
    fetchedAt: now()
  };
}

export function createHtsTreasurySnapshotProofEvent(input: {
  snapshot: HtsTreasurySnapshot;
  actorId?: string;
}): ProofEvent {
  return normalizeProofEvent({
    kind: 'research_claim',
    actor: { id: input.actorId ?? 'agent:hts-treasury-snapshot', type: 'ai_agent' },
    subject: { id: `hts:token:${input.snapshot.tokenId}`, type: 'token_snapshot' },
    payload: input.snapshot,
    metadata: {
      adapter: 'hts-treasury-snapshot',
      source: 'hedera-mirror-node',
      readOnly: true,
      tokenId: input.snapshot.tokenId
    }
  });
}
