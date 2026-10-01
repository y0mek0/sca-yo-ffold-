# AgentProof HBAR: запуск и проверка с нуля

## 1. Что нужно

- Node.js `>=20.18.3`;
- npm;
- public GitHub repository;
- Hedera testnet account для реального HCS proof;
- HCS topic;
- `.env.local` только локально.

## 2. Установка

```bash
npm install
cp .env.example .env.local
```

Заполнить локально:

```text
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=[local value]
HEDERA_TOPIC_ID=0.0.xxxxx
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

Ключ нельзя добавлять в GitHub, README, frontend или HCS payload.

## 3. Проверка окружения

```bash
npm run doctor
```

Doctor проверяет Node version, testnet, operator ID, key format, Mirror Node, token association и local proof index.

Demo mode без credentials разрешён. Он должен показать понятное предупреждение, а не падать.

## 4. Локальный proof flow

```bash
npm run audit:sample
npm run verify:sample
```

Этот flow не отправляет транзакцию. Он проверяет event normalization, hash и компактное HCS-сообщение на локальном sample.

## 5. Реальный общий HCS flow

```bash
npm run hcs:submit
npm run mirror:verify -- --sequence <N>
```

Ожидаемый результат:

```text
normalize → SHA-256 → HCS sequence → Mirror hash match
```

## 6. Реальные read-only snapshots

SaucerSwap:

```bash
npm run watch:saucerswap -- --pool-id 0
npm run mirror:verify -- --sequence <N>
```

HTS token/treasury:

```bash
npm run watch:hts-treasury -- --token-id 0.0.429274
npm run mirror:verify -- --sequence <N>
```

Получение данных из GitHub, CoinGecko, SaucerSwap и Mirror Node не требует API key. Credentials нужны только для отправки proof в HCS.

## 7. Payment flow

```bash
npm run payment:intent:hbar -- --receiver 0.0.98 --amount-tinybar 1
```

Проверять нужно отдельно:

```text
intent proof
real HBAR transaction
SUCCESS receipt
execution proof
Mirror verification
```

Не путать intent с реальным transfer.

## 8. UI smoke

```bash
npm run dev
```

Проверить:

```text
/          200
/proofs    200
/api/doctor 200
/api/proofs 200
/missing   404
```

Это HTTP smoke. Полноценный Playwright E2E в template не заявляется.

## 9. Полный gate

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run doctor
npm run audit:sample
npm run verify:sample
git diff --check
```

## 10. Перед публикацией

```bash
git rev-parse --show-toplevel
git ls-tree --name-only HEAD
git status --short
git diff --check
```

Проверить, что в Git нет `.env.local`, `.env`, `.data`, private keys, API keys и runtime artifacts.

Также проверить свежий scaffold через `create-scaffold-hbar` в отдельной временной папке. Локальный успех текущего checkout не заменяет fresh scaffold regression.
