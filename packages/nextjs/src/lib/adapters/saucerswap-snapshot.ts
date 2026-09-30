import { normalizeProofEvent, type ProofEvent } from '../proof/proof-event';

export type SaucerSwapTokenSnapshot = {
  id: string;
  symbol: string;
  decimals: number;
  priceUsd: number;
  reserve: string;
};

export type SaucerSwapPoolSnapshot = {
  source: 'saucerswap';
  poolId: number;
  poolContractId: string;
  lpToken: {
    id: string;
    symbol: string;
    decimals: number;
    priceUsd: number;
  };
  tokenA: SaucerSwapTokenSnapshot;
  tokenB: SaucerSwapTokenSnapshot;
  fetchedAt: string;
};

type SaucerSwapRawToken = {
  id?: unknown;
  symbol?: unknown;
  decimals?: unknown;
  priceUsd?: unknown;
};

type SaucerSwapRawPool = {
  id?: unknown;
  contractId?: unknown;
  lpToken?: SaucerSwapRawToken;
  lpTokenReserve?: unknown;
  tokenA?: SaucerSwapRawToken;
  tokenReserveA?: unknown;
  tokenB?: SaucerSwapRawToken;
  tokenReserveB?: unknown;
};

export type FetchSaucerSwapPoolOptions = {
  poolId?: number;
  fetchImpl?: typeof fetch;
  now?: () => string;
};

const SAUCERSWAP_API = 'https://api.saucerswap.finance';

function requiredString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`SaucerSwap pool payload missing ${field}`);
  }
  return value;
}

function requiredNumber(value: unknown, field: string): number {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number)) {
    throw new Error(`SaucerSwap pool payload missing ${field}`);
  }
  return number;
}

function normalizeToken(token: SaucerSwapRawToken | undefined, reserve: unknown, label: string): SaucerSwapTokenSnapshot {
  return {
    id: requiredString(token?.id, `${label}.id`),
    symbol: requiredString(token?.symbol, `${label}.symbol`),
    decimals: requiredNumber(token?.decimals, `${label}.decimals`),
    priceUsd: requiredNumber(token?.priceUsd, `${label}.priceUsd`),
    reserve: requiredString(reserve, `${label}.reserve`)
  };
}

export async function fetchSaucerSwapPoolSnapshot(
  options: FetchSaucerSwapPoolOptions = {}
): Promise<SaucerSwapPoolSnapshot> {
  const poolId = options.poolId ?? 0;
  if (!Number.isInteger(poolId) || poolId < 0) {
    throw new Error(`SaucerSwap pool ID must be a non-negative integer: ${poolId}`);
  }

  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => new Date().toISOString());
  const response = await fetchImpl(`${SAUCERSWAP_API}/pools/${poolId}`, {
    headers: {
      accept: 'application/json',
      'user-agent': 'agentproof-hbar-template'
    }
  });

  if (!response.ok) {
    throw new Error(`SaucerSwap HTTP ${response.status} for pool ${poolId}`);
  }

  const raw = await response.json() as SaucerSwapRawPool;
  if (!raw || typeof raw !== 'object') {
    throw new Error('SaucerSwap pool payload must be an object');
  }

  return {
    source: 'saucerswap',
    poolId: requiredNumber(raw.id, 'id'),
    poolContractId: requiredString(raw.contractId, 'contractId'),
    lpToken: {
      id: requiredString(raw.lpToken?.id, 'lpToken.id'),
      symbol: requiredString(raw.lpToken?.symbol, 'lpToken.symbol'),
      decimals: requiredNumber(raw.lpToken?.decimals, 'lpToken.decimals'),
      priceUsd: requiredNumber(raw.lpToken?.priceUsd, 'lpToken.priceUsd')
    },
    tokenA: normalizeToken(raw.tokenA, raw.tokenReserveA, 'tokenA'),
    tokenB: normalizeToken(raw.tokenB, raw.tokenReserveB, 'tokenB'),
    fetchedAt: now()
  };
}

export function createSaucerSwapSnapshotProofEvent(input: {
  snapshot: SaucerSwapPoolSnapshot;
  actorId?: string;
}): ProofEvent {
  return normalizeProofEvent({
    kind: 'research_claim',
    actor: { id: input.actorId ?? 'agent:saucerswap-snapshot', type: 'ai_agent' },
    subject: { id: `saucerswap:pool:${input.snapshot.poolId}`, type: 'market_snapshot' },
    payload: input.snapshot,
    metadata: {
      adapter: 'saucerswap-snapshot',
      source: 'saucerswap',
      endpoint: `${SAUCERSWAP_API}/pools/${input.snapshot.poolId}`,
      readOnly: true
    }
  });
}
