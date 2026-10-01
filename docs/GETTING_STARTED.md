# Tracemark: Start and Verify from Scratch

## 1. Requirements

- Node.js `>=20.18.3`;
- npm;
- public GitHub repository;
- Hedera testnet account for a real HCS proof;
- HCS topic;
- `.env.local` kept local only.

## 2. Install

```bash
npm install
cp .env.example .env.local
```

Fill the local file:

```text
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=[local value]
HEDERA_TOPIC_ID=0.0.xxxxx
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

Never add the key to GitHub, README, frontend code, or an HCS payload.

## 3. Check the environment

```bash
npm run doctor
```

Doctor checks the Node version, testnet, operator ID, key format, Mirror Node, token association, and local proof index.

Demo mode without credentials is allowed. It should show a clear warning instead of failing.

## 4. Local proof flow

```bash
npm run audit:sample
npm run verify:sample
```

This flow does not submit a transaction. It checks event normalization, hashing, and the compact HCS message on a local sample.

## 5. Real HCS flow

```bash
npm run hcs:submit
npm run mirror:verify -- --sequence <N>
```

Expected result:

```text
normalize → SHA-256 → HCS sequence → Mirror hash match
```

## 6. Read-only snapshots

SaucerSwap:

```bash
npm run watch:saucerswap -- --pool-id 0
npm run mirror:verify -- --sequence <N>
```

HTS token and treasury:

```bash
npm run watch:hts-treasury -- --token-id 0.0.429274
npm run mirror:verify -- --sequence <N>
```

GitHub, CoinGecko, SaucerSwap, and Mirror Node reads do not require an API key. Credentials are required only to submit a proof to HCS.

## 7. Payment flow

```bash
npm run payment:intent:hbar -- --receiver 0.0.98 --amount-tinybar 1
```

Check these separately:

```text
intent proof
real HBAR transaction
SUCCESS receipt
execution proof
Mirror verification
```

Do not treat an intent as a completed transfer.

## 8. UI smoke

```bash
npm run dev
```

Check:

```text
/             200
/proofs       200
/api/doctor   200
/api/proofs   200
/missing      404
```

This is HTTP smoke testing. The template does not claim a full Playwright E2E suite.

## 9. Full quality gate

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

## 10. Before publishing

```bash
git rev-parse --show-toplevel
git ls-tree --name-only HEAD
git status --short
git diff --check
```

Check that Git does not contain `.env.local`, `.env`, `.data`, private keys, API keys, or runtime artifacts.

Also test a fresh scaffold with `create-scaffold-hbar` in a separate temporary folder. A successful local checkout is not a substitute for fresh scaffold regression.
