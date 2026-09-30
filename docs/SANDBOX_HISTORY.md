# Sandbox Exercise History

This file records how `hedera-agent-proof-kit` was actually exercised end-to-end
against real Hedera testnet before the bounty submission. Every entry includes
the real command output and the verification gate it passed.

The goal was to answer: **how would a real developer use the template right after
`npm create scaffold-hbar@latest -- --template y0mek0/sca-yo-ffold-`?**

## Sandbox A — clean install, demo mode

Goal: prove the template boots and gives honest feedback when `.env.local` is missing.

Setup:

```bash
mv hedera-agent-proof-kit/.env.local .env.local.backup
```

Result:

```text
AgentProof HBAR Doctor
OK  Node version             v24.11.1 >= 20.18.3
OK  HEDERA_NETWORK           testnet
WARN HEDERA_OPERATOR_ID       missing; demo mode
WARN HEDERA_OPERATOR_KEY      missing; demo mode
OK  HEDERA_MIRROR_NODE_URL   https://testnet.mirrornode.hedera.com

Demo mode is allowed. Add .env.local values to submit real HCS proofs.
```

```bash
npm run audit:sample   # → local-only proof event + HCS-safe message
npm run verify:sample  # → result.ok = true, reason = hash_match
```

Takeaway: demo mode is honest, no false "ready" state.

## Sandbox B — real `.env.local` on testnet

Goal: prove a real HCS submission round-trips through the Mirror Node.

Setup: `cp .env.local.backup .env.local`

Result:

```text
AgentProof HBAR Doctor
OK  Node version             v24.11.1 >= 20.18.3
OK  HEDERA_NETWORK           testnet
OK  HEDERA_OPERATOR_ID       set
OK  HEDERA_OPERATOR_ID shape parsed 0.0.10380366
OK  HEDERA_OPERATOR_KEY      set
OK  Key format               ecdsa-hex (b215a676a83c...)
OK  HEDERA_MIRROR_NODE_URL   https://testnet.mirrornode.hedera.com
```

```bash
npm run hcs:submit
# topic: 0.0.10426202
# sequenceNumber: 8
# hash: b822a0ff345e06eb5db1ea9cb37d6f322e91d78e6796779756dd2176ba0a7bda

npm run mirror:verify -- --sequence 8
# ok: true
# reason: mirror_hash_match
# hashscanUrl: https://hashscan.io/testnet/topic/0.0.10426202
```

Takeaway: the default sample (research claim) round-trips end-to-end.

## Sandbox C — user-defined adapter on top of a roadmap adapter

Goal: prove a developer can write a custom adapter without redesigning the schema.

Adapter (lived only during sandbox, removed before commit):

```ts
// src/lib/adapters/sandbox/price-alert.ts
import { createWatcherSignalProofEvent } from '../watcher-signal';

export type PriceAlertInput = {
  asset: string;
  threshold: number;
  currentPrice: number;
  direction: 'above' | 'below';
  actorId: string;
};

export function createPriceAlertProofEvent(input: PriceAlertInput) {
  if (input.direction === 'above' && input.currentPrice < input.threshold) {
    throw new Error('Price alert threshold/current mismatch: above requires current >= threshold');
  }
  if (input.direction === 'below' && input.currentPrice > input.threshold) {
    throw new Error('Price alert threshold/current mismatch: below requires current <= threshold');
  }

  return createWatcherSignalProofEvent({
    actorId: input.actorId,
    source: 'price-alert',
    signal: `${input.asset} ${input.direction} ${input.threshold} (current=${input.currentPrice})`
  });
}
```

Result:

```text
npm run test -- src/lib/adapters/sandbox/price-alert.test.ts
✓ Sandbox C — user-defined adapter (2 tests)

submit via tsx scripts/sandbox-price-alert.ts
# topic:        0.0.10426202
# sequence:     10
# hash:         4f5c74873badc4941e6c1cc26031c53cf760ad82925543008dd46f3698b12d9b

# ad-hoc Mirror Node read at /api/v1/topics/.../messages?sequencenumber=10
{
  "sequenceNumber": 10,
  "expectedHash":   "4f5c74873badc4941e6c1cc26031c53cf760ad82925543008dd46f3698b12d9b",
  "onChainHash":    "4f5c74873badc4941e6c1cc26031c53cf760ad82925543008dd46f3698b12d9b",
  "match": true
}
```

Bug found during this sandbox and fixed in commit `e96f166`:

```text
watcher-signal.ts exposed adapter only in metadata, not the source.
the new sandbox test asserted event.metadata.source === 'price-alert'
and that surfaced the missing field. The fix added `source: input.source`
to the metadata of createWatcherSignalProofEvent.
```

After fix:

```text
✓ src/lib/adapters/roadmap.test.ts (4 tests)
✓ src/lib/adapters/adapters.test.ts (3 tests)
```

Takeaway: roadmap adapters are reusable; sandboxing a custom adapter on top
is cheap and immediately surfaces integration gaps.

## Sandbox D — broken environment

Goal: prove the doctor catches misconfiguration before the user pays for it with `INVALID_SIGNATURE` on chain.

Setup:

```text
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=not-an-account
HEDERA_OPERATOR_KEY=totally bogus
HEDERA_TOPIC_ID=0.0.99999999
HEDERA_MIRROR_NODE_URL=https://testnet.mirrornode.hedera.com
```

Result:

```text
AgentProof HBAR Doctor
OK  Node version             v24.11.1 >= 20.18.3
OK  HEDERA_NETWORK           testnet
OK  HEDERA_OPERATOR_ID       set
WARN HEDERA_OPERATOR_ID shape Invalid Hedera account id: not-an-account
OK  HEDERA_OPERATOR_KEY      set
WARN Key format               Unsupported Hedera key shape: totally bogus
OK  HEDERA_MIRROR_NODE_URL   https://testnet.mirrornode.hedera.com
```

Takeaway: the doctor distinguishes "missing value (demo mode)" from
"present-but-malformed (WARN)". That is the exact Hedera dev pain that
this template was created to remove.

## Aggregate verification before push

```text
npm run lint        ✓
npm run typecheck   ✓
npm run test        ✓ 11 files, 27 tests
npm run build       ✓ /  /proofs  /api/doctor  /api/proofs
npm run doctor      ✓
```

Git history of the sandbox commit:

```text
e96f166 fix: watcher-signal exposes source in metadata
4b3a1c4 feat: doctor parses account id and key format; roadmap adapters
84dd122 feat: proofs UI page, /api/proofs, and fresh-scaffold gate
e4b4e11 docs: update bounty evidence to latest verified sequence
8bea132 feat: real HCS submit and Mirror verify on testnet
0a30086 feat: add local index and core adapters
1bf44a3 feat: add deterministic ProofEvent hashing
cd6cf1b feat: scaffold AgentProof HBAR template skeleton
f97eba6 chore: plan_approved
```

Public repo:

```text
https://github.com/y0mek0/sca-yo-ffold-
```

## Sandbox G — token association check via Mirror Node

Goal: prove the doctor catches missing token associations before the user
pays for it with `TOKEN_NOT_ASSOCIATED_TO_ACCOUNT` on chain.

Setup: real `.env.local` with operator `0.0.10380366`, default token
`0.0.429274` (USDC testnet).

Result:

```text
AgentProof HBAR Doctor
OK  Node version             v24.11.1 >= 20.18.3
OK  HEDERA_NETWORK           testnet
OK  HEDERA_OPERATOR_ID       set
OK  HEDERA_OPERATOR_ID shape parsed 0.0.10380366
OK  HEDERA_OPERATOR_KEY      set
OK  Key format               ecdsa-hex (b215a676a83c...)
OK  HEDERA_MIRROR_NODE_URL   https://testnet.mirrornode.hedera.com
OK  Token association        0.0.429274 associated
```

Takeaway: real Mirror Node query confirms the USDC testnet association.

## Sandbox H — negative HCS submit cases

Goal: prove `hcs:submit` returns structured JSON errors instead of crashing.

Wrong topic:

```json
{
  "ok": false,
  "error": { "kind": "topic", "reason": "invalid_topic_id" }
}
```

Wrong operator:

```json
{
  "ok": false,
  "error": { "kind": "operator", "reason": "payer_account_not_found" }
}
```

Takeaway: `classifyHcsError` maps SDK strings to typed reason codes.

## Sandbox E — browser-action end-to-end

```text
sequenceNumber: 11
hash:           d71caeb81452ccd9fd4f38b3395d849a48592e3f598057245fd92a81449cb4c7
```

## Sandbox F — rag-memory end-to-end

```text
sequenceNumber: 12
hash:           c6dc18f50a50cddad1b606e85b95b16cee94fcc905db953493b85d5e40df8588
```

## Sandbox I — create-scaffold-hbar real run

Two real bugs found and fixed during this sandbox:

1. `Failed to download .../tarball/main: 404`. The default branch was `master`,
   `create-scaffold-hbar` downloads `tarball/main`. Renamed `master → main`
   and updated default_branch on GitHub.

2. `yarn install` failed with `Cannot find package 'vite'`. Yarn v4 in
   workspaces skipped the optional vite peer. Added `overrides` block to
   pin eslint to 9.39.5 and dropped the optional `vite` peer declaration.

End result:

```text
✔ Create project directory
✔ Creating a new Scaffold-HBAR app in myagentproof
✔ Initializing Git repository

yarn install    OK
yarn build      OK /  /proofs  /api/proofs  /api/doctor
yarn doctor     OK demo mode
yarn test       OK 35 tests
```

## Sandbox J — security smoke on `proofs.jsonl`

Six behaviour cases, all passing:

```text
ignores corrupt lines             OK
does not leak raw payload fields  OK
5000 lines under 2 seconds         OK
empty file                        OK
whitespace only                   OK
missing fields render as unknown  OK (now filtered in the UI)
```

Takeaway: the local index is robust against hand-edited, corrupted or
oversized files. The 6-case security suite guards the read path.

## Sandbox K — concurrent HCS submit on testnet

Real test:

```bash
npx tsx scripts/sandbox-concurrent.ts
```

Three parallel `TopicMessageSubmitTransaction` calls sharing one operator
account. Result on Hedera testnet:

```text
ok: true
elapsedMs: 1968
results:
  - A: sequenceNumber 14
  - B: sequenceNumber 15
  - C: sequenceNumber 13
```

Three of three landed in the same operator; sequence numbers were assigned
non-deterministically by the network. No `DUPLICATE_TRANSACTION`, no
`BUSY` rejections.

## Sandbox L — race condition found in `LocalProofIndex`

While running sandbox K we observed that `.data/proofs.jsonl` only had 10
lines after 12 successful HCS submits. Probed and confirmed:

```bash
wc -l .data/proofs.jsonl
10
```

Three concurrent `append` calls collapsed to one writer because the
previous implementation did `readFile + writeFile` without locking.

### Failing test added (Red)

`src/lib/index/local-proof-index-concurrent.test.ts`:

```text
LocalProofIndex concurrent append
  × preserves every entry when many appends happen at once
    expected 5 to be 5  (length OK after fix)
```

### Fix applied (Green)

`local-proof-index.ts` now uses a per-instance async mutex that chains
every `append` onto the previous one, plus `flag: 'a'` so writes append
rather than truncate:

```ts
async append(proof: SampleProof): Promise<void> {
  const line = `${JSON.stringify(proof)}\n`;
  const release = this.mutex;
  let resolveNext: () => void = () => undefined;
  this.mutex = new Promise<void>((resolve) => { resolveNext = resolve; });
  try {
    await release;
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, line, { encoding: 'utf8', flag: 'a' });
  } finally {
    resolveNext();
  }
}
```

After fix: 42 tests passing, no regressions in the other 11 files.

## Sandbox H — HBAR price watcher (CoinGecko public API)

Goal: prove that the template can fetch a real public price feed, hash it as
a watcher-signal proof, and submit to HCS without needing any API key.

Command:

```bash
npm run watch:hbar-price -- --threshold 0
```

Real CoinGecko response (`hedera-hashgraph` slug, USD):

```text
priceUsd:   0.108873
fetchedAt:  2026-09-30T11:59:47.842Z
```

Submitted to HCS as sequence 19, then 21, 23, 25, 27 across the development
session. Each call published a fresh SHA-256 digest of the
`createPriceWatcherProofEvent` output.

Built from scratch in this turn:

- `src/lib/adapters/coingecko-fetcher.ts` — public CoinGecko
  `simple/price` endpoint, no key, no rate-limit purchase needed for ad-hoc
  fetching.
- `src/lib/adapters/price-watcher.ts` — typed factory that validates
  threshold vs current price and direction (`above` / `below`).
- `scripts/watch-hbar-price.ts` — CLI entry; submits to HCS, appends to
  `.data/proofs.jsonl`.
- `src/lib/adapters/price-watcher-sandbox.ts` + test — analysis helper
  `findHbarThresholds` over a history of submissions.

Tests:

```text
coingecko-fetcher.test.ts      3 tests
price-watcher.test.ts          2 tests
price-watcher-sandbox.test.ts  2 tests
```

Mirrored price range observed across five submissions:

```text
count: 5
min:   0.108595 USD
max:   0.109236 USD
latest 0.108702 USD (sequence 25)
```

API / access needed:

```text
CoinGecko public endpoint — no key.
```

## Sandbox I — GitHub issues watcher (public REST API)

Goal: prove that the template can fetch public open issues for any
GitHub repo, hash them as a watcher-signal proof, and submit to HCS
without needing a Personal Access Token for smoke testing.

Command:

```bash
npm run watch:github-issues -- --owner microsoft --repo typescript --limit 3
```

Real GitHub response (first three open issues):

```text
#64551 — tsc: default GOGC=400, SIMD-accelerated comment scanning, and Symbol compaction  PR  hazyhaar  2026-09-30T08:34:17Z
#64550 — Fix references after unrelated project edits (#64497)                  PR  SHULMIT    2026-09-30T00:43:45Z
#64549 — Content mappers: let registered extensions take part in extensionless module lookup  ISSUE  leonidaz  2026-09-30T00:35:27Z
```

Submitted to HCS as sequence 20, then 22, 24, 26, 28 across the
development session.

Built from scratch in this turn:

- `src/lib/adapters/github-issues-fetcher.ts` — public REST endpoint
  `/repos/{owner}/{repo}/issues?state=open&sort=created&direction=desc`.
- `scripts/watch-github-issues.ts` — CLI entry; submits to HCS, appends to
  `.data/proofs.jsonl`.
- `src/lib/adapters/issues-watcher-sandbox.ts` + test — analysis helper
  `summarizeIssuesBatches` over a history of submissions.

Tests:

```text
github-issues-fetcher.test.ts     3 tests
issues-watcher-sandbox.test.ts    2 tests
```

Across five watcher runs against `microsoft/typescript`:

```text
batchCount:       5
totalIssuesSeen: 14
perRepo:          microsoft/typescript -> 14
latestBatch:      sequence 28, issueCount 3
```

API / access needed:

```text
GitHub public REST — no token for first 60 requests per hour.
For production: set GITHUB_TOKEN env var to lift the limit to 5000/h.
The fetch wrapper already accepts `fetchImpl` so a token-based call is a
drop-in replacement.
```

## Combined testnet footprint after the watcher work

```text
release watcher   sequences 18
browser-action    sandbox sample
rag-memory        sandbox sample
hb price watcher  sequences 19, 21, 23, 25, 27
issues watcher    sequences 20, 22, 24, 26, 28
```

## Sandbox J — Payment Intent + real HBAR transfer

Goal: prove the complete payment workflow: anchor the agent's intent, execute
an actual HBAR transfer on Hedera testnet, anchor the execution result, and
verify both HCS proofs plus the transfer through Mirror Node.

Command:

```bash
npx tsx packages/nextjs/scripts/payment-intent-hbar.ts --amount-tinybar 1 --receiver 0.0.98
```

The script used the existing local Hedera testnet operator configuration. No
private key was printed or added to the repository.

Real result:

```text
payer:         0.0.10380366
receiver:      0.0.98
asset:         HBAR
amount:        1 tinybar
transfer:      SUCCESS
intent HCS:    sequence 29
execution HCS: sequence 30
```

The Hedera transaction was independently read from Mirror Node:

```text
transaction: 0.0.10380366-1790799829-866957034
result:      SUCCESS
transfer:    0.0.10380366 -> 0.0.98, 1 tinybar
```

Mirror proof checks:

```text
sequence 29 → mirror_hash_match
sequence 30 → mirror_hash_match
```

The execution event links back to the intent SHA-256 digest. This distinguishes
what the agent intended from what Hedera actually executed.

## Sandbox M — repeat regression and public clean scaffold

The path and packaging regression was repeated after the Payment Intent work.
Root and workspace commands now resolve the same `packages/nextjs/.data` index, and
root scripts preserve CLI arguments when forwarding to workspace scripts.

Live testnet repeat:

```text
HCS sample              sequence 31
GitHub release watcher  sequence 32
HBAR price watcher      sequence 33
GitHub issues watcher   sequence 34
Payment intent          sequence 35
HBAR transfer           SUCCESS
Payment execution       sequence 36
Concurrent HCS writes  sequences 37, 38, 39
```

Mirror Node confirmed sequences 31 through 36. The invalid-topic negative path was
also checked and returned the typed `invalid_topic_id` error without exposing a key.

The public repository was then scaffolded from a disposable directory with
`create-scaffold-hbar`, installed from scratch, and passed:

```text
package.json at generated project root  ✓
npm install                            ✓
lint                                  ✓
typecheck                             ✓
test                                  ✓ 29 files, 84 tests
build                                 ✓
doctor demo mode                      ✓
```

See `docs/BOUNTY_EVIDENCE.md` for the rubric evidence map and limitations.

Implementation:

- `src/lib/adapters/payment-intent-execution.ts` — validates successful
  execution and links it to the intent digest.
- `scripts/payment-intent-hbar.ts` — intent proof, `TransferTransaction`,
  receipt, execution proof, and local index writes.
- `payment-intent-execution.test.ts` — success and rejected-status tests.

No new API access is required. The flow uses the existing Hedera testnet
operator credentials in `.env.local`.

## Verification after Payment Intent work

```text
lint        ✓
typecheck   ✓
test        ✓ 28 files, 82 tests
build       ✓
doctor      ✓
```

## SaucerSwap adapter implementation check

The read-only SaucerSwap adapter was added without trading or wallet signing:

```text
public endpoint: GET https://api.saucerswap.finance/pools/<pool-id>
validated live pool: 0
pair: SAUCE / HBAR
pool contract: 0.0.1062795
focused tests: 3 passed
full suite: 30 files, 87 tests passed
live HCS proof: sequence 40
Mirror verification: hash confirmed
```

SaucerSwap sequence `40` uses the same HCS topic as the existing proof history. The
public pool data was normalized locally; the HCS message contains the digest and
minimal metadata, not the raw API response.
