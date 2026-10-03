# Tracemark

A Hedera-native proof layer for AI decisions, research, payments, and verifiable ecosystem data.

Tracemark hashes important outputs, anchors the proof to HCS, stores the full payload off-chain in a local JSONL index, and verifies it through the Hedera Mirror Node. The template ships with a setup Doctor, three working Core+ adapters, four roadmap adapters as typed factories, a polished proof-index UI, and a GitHub release watcher that proves real HTTP → HCS → Mirror Node round-trips end to end.

## Why this template

Most agents act. Almost none leave a public, immutable record of what they did, in what order, with what input. Hedera Consensus Service is purpose-built for that — ordered, timestamped, cheap, mirrored. Tracemark is the smallest scaffolding that turns "the agent said X" into "HCS proves the agent said X at consensus time T, and the full evidence stays in your own storage".

```text
external data or action
→ normalized JSON
→ SHA-256 fingerprint
→ HCS public proof log
→ full event stored off-chain
→ Mirror Node verification
```

In plain English: Tracemark shows what data the system saw, which decision or action it recorded, and when that happened. It does not prove that an external source was correct or that the AI made the right decision.

More detail: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), [`docs/GETTING_STARTED.md`](docs/GETTING_STARTED.md), and [`docs/USE_CASES.md`](docs/USE_CASES.md).

## What ships

| Layer | What | Where |
| --- | --- | --- |
| Core | HCS proof log, local JSONL index, Mirror Node verification, Hedera setup Doctor, demo mode | `src/lib/proof`, `src/lib/index`, `src/lib/doctor`, `scripts/doctor.ts` |
| Core+ working | Research Claim, AI Decision, Document/Office adapters with tests | `src/lib/adapters/research-claim.ts`, `ai-decision.ts`, `document-office.ts` |
| Core+ roadmap factories | Browser Action, Payment Intent, Watcher Signal, RAG Memory typed factories | `src/lib/adapters/roadmap.ts` |
| Real integrations | GitHub release watcher, GitHub issues watcher, HBAR price watcher (CoinGecko), SaucerSwap read-only pool snapshot, HTS treasury/token snapshot, and Payment Intent + real HBAR transfer — real testnet sequences | `src/lib/adapters/http-fetcher.ts`, `release-watcher.ts`, `github-issues-fetcher.ts`, `coingecko-fetcher.ts`, `price-watcher.ts`, `saucerswap-snapshot.ts`, `hts-treasury-snapshot.ts`, `payment-intent-execution.ts`, `scripts/watch-*.ts`, `scripts/payment-intent-hbar.ts` |
| UI | Hero dashboard, proof index with kind filter, JSON APIs, colorised CLI output | `src/app/page.tsx`, `proofs/page.tsx`, `api/proofs`, `src/lib/cli/cli-output.ts` |
| Contracts | Optional Solidity receipt registry with Hardhat compile/test flow | `packages/hardhat/contracts/TracemarkRegistry.sol`, `packages/hardhat/test/TracemarkRegistry.test.js` |
| Validation | Local quality gate with `lint / typecheck / test / build / doctor / audit / verify` | root `package.json` scripts |
| Docs | `README.md`, `AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/GETTING_STARTED.md`, `docs/USE_CASES.md`, `docs/BOUNTY_CHECKLIST.md`, `docs/SANDBOX_HISTORY.md`, `docs/BOUNTY_EVIDENCE.md` | repo root |

## Quickstart

```bash
npm install
cp .env.example .env.local
# Fill HEDERA_OPERATOR_ID, HEDERA_OPERATOR_KEY, HEDERA_TOPIC_ID
npm run doctor
npm run contracts:compile
npm run contracts:test
npm run dev
```

Open <http://localhost:3000>.

## Real testnet proof flow

```bash
npm run audit:sample           # Build a deterministic off-chain event + HCS-safe proof message.
npm run verify:sample          # Recompute the local hash and confirm the HCS message matches.
npm run hcs:submit             # Submit the proof message to the HCS topic.
npm run mirror:verify          # Read the HCS topic through the Mirror Node and confirm the hash.
npm run watch:github-release   # Optional: pull a real GitHub release, hash it, submit, verify.
npm run watch:hbar-price       # Optional: pull live HBAR/USD from CoinGecko, hash it, submit, verify.
npm run watch:saucerswap       # Optional: pull a public SaucerSwap pool snapshot, hash it, submit, verify.
npm run watch:hts-treasury     # Optional: pull HTS token + treasury state from Mirror Node, hash it, submit, verify.
npm run watch:github-issues    # Optional: pull latest open issues for any public GitHub repo, hash them, submit, verify.
npm run payment:intent:hbar   # Submit intent, execute a real HBAR transfer, anchor execution proof.
```

All public source adapters call **public, unauthenticated** APIs (GitHub REST, CoinGecko `simple/price`, SaucerSwap pool API, and Hedera Mirror Node), so the data-fetch side runs without any API keys or tokens.

### SaucerSwap read-only snapshot

The SaucerSwap adapter reads `GET https://api.saucerswap.finance/pools/<pool-id>` and creates a canonical market snapshot for a Hedera pool. It never signs, trades, or sends funds. The normalized snapshot contains the pool contract ID, token IDs, symbols, decimals, USD prices, reserves, and fetch time. The full event stays in the local proof index; HCS receives only its SHA-256 digest and minimal metadata.

```bash
npm run watch:saucerswap -- --pool-id 0
```

This makes the integration load-bearing for a market-research workflow: an agent can prove which public SaucerSwap state it observed before making a research claim or risk decision. A proof records what was observed and when; it does not claim that the market data was true or that a trade was profitable.

### HTS treasury/token snapshot

The HTS adapter reads token metadata and the treasury balance from the Hedera Mirror Node. It is read-only and requires no signing key for the data fetch. This creates a proof of token supply, decimals, treasury account, treasury balance, and fetch time for DAO, grants, accounting, governance, and risk workflows.

```bash
npm run watch:hts-treasury -- --token-id 0.0.429274
```

The default example uses a public Hedera testnet USDC token. Replace the token ID with the HTS asset used by your workflow. The Mirror Node response is normalized locally; HCS receives only the digest and minimal metadata.

Open <http://localhost:3000/proofs> to see the local proof index, or fetch it as JSON at <http://localhost:3000/api/proofs?kind=research_claim&limit=25>.

The Mirror Node verify script accepts `--hash` and `--sequence`:

```bash
npm run mirror:verify -- --hash b822a0ff345e06eb5db1ea9cb37d6f322e91d78e6796779756dd2176ba0a7bda
npm run mirror:verify -- --hash <digest> --sequence <N>
```

It returns `ok: true` with `reason: mirror_hash_match` when the on-chain digest matches. The digest must be 64 hex characters; anything else is rejected with a clear error.

## Local developer ergonomics

```bash
npm run doctor                 # Validates Node, .env.local, key shape, token association, proof count.
npm run add:adapter -- --name <snake_case> --kind <ai_decision|research_claim|document_hash>
```

The Doctor now reports the size of the local proof index so you can tell at a glance how many receipts have already been anchored:

```text
 OK  Local proof index        12 proofs on file (10 research_claim, 2 ai_decision)
```

The `add:adapter` command scaffolds a new adapter file under `packages/nextjs/src/lib/adapters/` with the correct imports, naming, and input placeholders. Fill them in, add a vitest file, and wire the adapter into a script or API route.

## Who this fits best

### Non-Web3

- **DevOps / SRE / release manager** — prove release, issue, escalation and approval events around GitHub workflows.
- **Research / due diligence analyst** — anchor claims, sources, data snapshots and report versions.
- **Document, legal and accounting operations** — prove the integrity and existence of a particular invoice, contract, memo or report version.

### Web3

- **Protocol researcher / crypto data analyst** — combine GitHub activity, HBAR price, SaucerSwap market snapshots and HTS token state.
- **DAO treasury / grants / governance operations** — anchor proposals, treasury snapshots, rationale, approvals and payments.
- **Crypto risk manager / market operations** — record market signals and risk decisions; Tracemark does not execute trades.

Concrete examples and two buildable programs for each profession are in [`docs/USE_CASES.md`](docs/USE_CASES.md).

## Payment Intent + HBAR transfer

The payment adapter now has a real Hedera testnet flow:

```text
Payment Intent
  → intent proof anchored to HCS
  → HBAR TransferTransaction
  → SUCCESS receipt and transaction ID
  → execution proof anchored to HCS
  → Mirror Node verification of both proofs and the transfer
```

Run it with the existing `.env.local` Hedera operator credentials:

```bash
npm run payment:intent:hbar -- --receiver 0.0.98 --amount-tinybar 1
```

The receiver defaults to `HEDERA_PAYMENT_RECEIVER_ID` or `0.0.98`; set an explicit receiver for your own integration. The operator key is read locally and is never printed or sent to the frontend.

The execution proof contains the payer, receiver, amount in tinybar, Hedera transaction ID, `SUCCESS` status, and the SHA-256 digest of the earlier intent proof. The full payload remains off-chain; HCS receives the compact proof message.

## Core+ working adapters

1. **Research Claim Proof** — claim + sources + evidence summary become a verifiable off-chain event. Use it for research agents, due-diligence bots, fact-check pipelines.
2. **AI Decision Proof** — agent decision + rationale + confidence become an auditable decision proof. Use it for any "the model chose X" moment you need to defend.
3. **Document / Office Proof** — file metadata + SHA-256 digest prove a document version without storing bytes. Use it for submission decks, invoices, signed memos.

## Roadmap adapters (typed factories)

The following adapters ship as typed factories so developers can wire them in without redesigning the ProofEvent schema. Each one was tested end-to-end against real testnet via the GitHub release watcher pattern.

- `createBrowserActionProofEvent` — URL / action / result / screenshot hash for browser agents (Browser Use, Jev, Page Agent, Iris).
- `createPaymentIntentProofEvent` — payer / receiver / asset / amount / policy before a payment is signed (x402, Blocky402, HBAR/USDC).
- `createWatcherSignalProofEvent` — wallet, market, GitHub, or news signal proofs (FOMO Robinhood Radar, repo watcher, HBAR price watcher, GitHub issues watcher).
- `createRagMemoryProofEvent` — question, answer, retrieved chunks hash (RAGFlow, MemPalace).

## Hedera depth

The Doctor validates more than a syntax check. It talks to the Hedera Mirror Node to confirm token association and rejects misconfiguration before any user transaction is signed:

```text
Tracemark Doctor
──────────────────────────
 OK  Node version             v24.11.1 >= 20.18.3
 OK  HEDERA_NETWORK           testnet
 OK  HEDERA_OPERATOR_ID       set
 OK  HEDERA_OPERATOR_ID shape parsed 0.0.10380366
 OK  HEDERA_OPERATOR_KEY      set
 OK  Key format               ecdsa-hex (b215a676a83c...)
 OK  HEDERA_MIRROR_NODE_URL   https://testnet.mirrornode.hedera.com
 OK  Token association        0.0.429274 associated
```

The submit script returns a structured JSON error instead of crashing on bad input:

```json
{ "ok": false, "error": { "kind": "topic", "reason": "invalid_topic_id" } }
```

## Important pattern

HCS is not used as a database. Tracemark stores only proof hashes and minimal metadata on HCS. Full payloads stay in the local `.data/proofs.jsonl` index or in your own storage.

The HCS message intentionally excludes raw payload fields like source text, file names, private notes, or evidence bundles. It keeps only:

```text
schema version
kind
subject id/type
sha256 digest
minimal metadata
```

## Bounty evidence

```text
network:          Hedera testnet
topic:            0.0.10426202
mirror node url:  https://testnet.mirrornode.hedera.com
sample proof:     research_claim
sample hash:      b822a0ff345e06eb5db1ea9cb37d6f322e91d78e6796779756dd2176ba0a7bda
hashscan topic:   https://hashscan.io/testnet/topic/0.0.10426202
```

### Live transaction evidence

The following links come from a fresh real testnet run in an isolated copy of this repository. The sample proof was submitted to HCS as sequence `156`, then read back through the Mirror Node with a matching SHA-256 digest.

- [HashScan transaction — sequence 156](https://hashscan.io/testnet/transaction/0.0.10380366@1791040834.114522292)
- [Mirror Node message — sequence 156](https://testnet.mirrornode.hedera.com/api/v1/topics/0.0.10426202/messages/156)
- [HashScan topic — 0.0.10426202](https://hashscan.io/testnet/topic/0.0.10426202)

```text
transaction:       0.0.10380366@1791040834.114522292
sequence:          156
consensus:         1791040841.036746661
sha256:            d2ed9bb7e3e75b922ea920e046b7681573e053fc466a363d95dab7df2d553f38
mirror hash match: true
```

The first real submission in this repo published proof sequence 18 to the topic above (a real GitHub release watcher built on top of `createWatcherSignalProofEvent`), and `npm run mirror:verify` against the topic reports `ok: true` with `reason: mirror_hash_match` for that hash. Sequences 19–28 are public-API watcher proofs from `npm run watch:hbar-price` and `npm run watch:github-issues`, all anchored to the same topic.

For a detailed log of the sandbox exercises — clean install, real `.env.local` round-trip, custom adapter end-to-end, broken env detection, token association check via Mirror Node, GitHub release watcher, HBAR price watcher, GitHub issues watcher — see `docs/SANDBOX_HISTORY.md`.
