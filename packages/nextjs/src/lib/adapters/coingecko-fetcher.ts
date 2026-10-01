export type HbarPrice = {
  asset: 'hbar';
  priceUsd: number;
  fetchedAt: string;
};

export type FetchHbarPriceOptions = {
  fetchImpl?: typeof fetch;
  now?: () => string;
};

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd';

export async function fetchHbarPrice(options: FetchHbarPriceOptions = {}): Promise<HbarPrice> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? (() => new Date().toISOString());

  const response = await fetchImpl(COINGECKO_URL, {
    headers: { accept: 'application/json', 'user-agent': 'tracemark-template' }
  });

  if (!response.ok) {
    throw new Error(`CoinGecko HTTP ${response.status} for HBAR price`);
  }

  const data = await response.json() as { 'hedera-hashgraph'?: { usd?: number } };
  const priceUsd = data['hedera-hashgraph']?.usd;
  if (typeof priceUsd !== 'number' || !Number.isFinite(priceUsd)) {
    throw new Error('CoinGecko payload missing hedera-hashgraph.usd');
  }

  return { asset: 'hbar', priceUsd, fetchedAt: now() };
}
