# Hedera Scaffold-HBAR Template Bounty — notes and 2-day plan

## Рабочая папка

```text
C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\
```

Локально сюда уже скачаны для изучения:

```text
hedera-harness/
create-scaffold-hbar/
```

## Ссылки

```text
Bounty brief: https://hedera.com/blog/scaffold-hbar-template-bounty/
Submit/Register: https://hedera.com/scaffold-hbar-template-bounty/
Hedera Harness: https://github.com/hedera-dev/hedera-harness
create-scaffold-hbar: https://github.com/hedera-dev/create-scaffold-hbar
```

## Крайний срок

```text
Submissions close: Sunday Oct 4, 2026, 11:59 PM ET
Moscow time: Monday Oct 5, 2026, 06:59 MSK
Judging: Oct 5–16
Winners: Oct 19
```

## Что нужно сдать

Один публичный GitHub repo: production-quality external `scaffold-hbar` template для реального Hedera use case.

Главная команда должна работать:

```bash
npm create scaffold-hbar@latest -- --template your-org/your-repo
```

В актуальном npm CLI пакет называется `create-scaffold-hbar`, поэтому проверять лучше так тоже:

```bash
npx create-scaffold-hbar@latest --template your-org/your-repo
```

## Eligibility gate — обязательный проход

Если это не проходит, до судей проект не доходит.

```text
1. Scaffolds cleanly through create-scaffold-hbar external template command
2. template.json exists and is valid
3. README.md exists
4. AGENTS.md exists
5. Fresh scaffold install passes
6. Lint passes
7. Build passes
8. App boots
9. Core routes return OK
10. At least one Hedera service is genuinely used: HTS, HCS, HSS, or Solidity contract on Hedera
11. At least one verifiable testnet transaction with Hashscan or mirror-node link
12. No committed secrets
13. No committed .env
14. MIT license
15. Original work
16. If using Hedera Harness: submit harness spec + validators
```

## Required repo shape

```text
your-repo/
  packages/
    contracts/ or hardhat/ or foundry/
    frontend/ or nextjs/
  template.json
  README.md
  AGENTS.md
  LICENSE
```

From `create-scaffold-hbar` docs, community templates are GitHub repos consumed as:

```bash
npx create-scaffold-hbar@latest --template owner/repo
npx create-scaffold-hbar@latest --template owner/repo#branch
```

The CLI supports:

```text
Node >= 20.18.3
Next.js app router
Hardhat or Foundry or no Solidity
Yarn / npm depending on template capabilities
```

AMA says Node 22.14+ is acceptable because requirement is Node >= 20.18.3.

## Scoring — 100 points

```text
35 — Ecosystem integration and value
30 — Documentation quality
20 — Code quality
15 — Hedera service depth
```

### 35 pts — Ecosystem integration/value

What scores high:

```text
- Integration is load-bearing, not decorative
- Removing it breaks the point of the template
- Developer gains a capability they would not easily build alone
```

Examples mentioned:

```text
DEX: SaucerSwap, SilkSwap, LambdaPlex
Oracles: Chainlink, Supra, Pyth
Bridges: Axelar, LayerZero, CCIP
Lending protocols
Decentralized storage
```

Important AMA insight:

```text
Read-only integration or forked-mainnet integration is acceptable if Hedera testnet deployment is missing.
If protocol testnet is halted/broken, document it and explain the workaround.
```

### 30 pts — Docs quality

Judges care a lot because template should be reusable by other devs.

Docs must let a stranger go:

```text
scaffold -> install -> run -> understand pattern -> verify transaction
```

AMA warning:

```text
Avoid AI slop.
Short, direct docs.
No long redundant comments.
Delete filler.
```

### 20 pts — Code quality

Judges look for:

```text
- readable code
- no duplicate helper functions
- no unnecessary abstractions
- no long stale comments explaining old versions
- meaningful tests
- errors handled
- no dead code
```

### 15 pts — Hedera service depth

Not enough:

```text
- create token once just to tick HTS
- submit HCS message with no business value
```

Good:

```text
- Hedera service is justified by the use case
- multiple Hedera services composed
- or one service used deeply
```

## AMA insights that matter

```text
1. Video is important. Judges use it as a first filter.
2. Video should show what it is, how to use it, and real Hedera transactions.
3. Deployed version is nice but less important than strong video + local scaffold working.
4. Repo may be private at submit time, but MUST be public when judging starts. Safer: public before submit.
5. Two templates using same protocol can both win if both score high.
6. Existing hackathon idea can be converted, but not by just adding one file. It must be a real scaffold-hbar template.
7. If using Foundry, avoid latest Foundry 1.8 issues; AMA said they were likely using/expecting 1.7 due relay issues.
8. If testnet integration is unavailable, mainnet read-only or forked-mainnet is acceptable when documented.
9. Self-check script means: run the create/scaffold command yourself in a fresh folder.
10. Document protocol limitations/issues proactively; this can count as community leadership.
```

## Hedera developer updates relevant to avoid mistakes

```text
HCS is not a database:
- Use HCS as ordered tamper-resistant event log
- Store hashes/events on HCS
- Use indexer/mirror/backend for reads

Local Node deprecated after Sep 2026:
- Use Solo for local development if needed

Atomic batch transactions:
- Smart contract calls inside atomic batch are deprecated, removal March 2027
- Avoid designing template around atomic batch + smart contract inner calls

AccountBalanceQuery removed in v0.77:
- Use MirrorNodeAccountBalanceQuery or Mirror Node REST /balances?account.id=
```

## Useful harness facts

Hedera Harness is optional, but recommended.

It can:

```text
- init scaffold-hbar project
- run AI coding agent
- assert files/static rules/no secrets/build
- boot app with Playwright
- run semantic validator
- optionally do on-chain validation against testnet mirror node
```

Commands:

```bash
npm install -D hedera-harness
npx hedera-harness init
npx hedera-harness doctor
npx hedera-harness run
npx hedera-harness validate
```

Harness recipe lives in:

```text
.harness/spec.yaml
.harness/prd.md
.harness/validators/static.json
.harness/validators/yarn.json
.harness/validators/playwright-smoke.yaml
.harness/acceptance-contract.json
```

If using chain validation:

```text
HEDERA_OPERATOR_ID=0.0.xxxx
HEDERA_OPERATOR_KEY=0x...
```

Do not commit credentials.

Harness skills available in registry:

```text
hedera-consensus-service
hedera-token-service
hts-system-contract
hss-system-contract
x402-payments
hedera-oracle-adapters
axelar-gmp
layerzero-messaging
```

## Strong project directions for 20–30 hours

### Best realistic direction: HCS Proof Log Template

Template for apps that need verifiable event/audit trail:

```text
Next.js frontend + Hedera SDK backend route
User submits an event/document/action
App hashes payload locally/server-side
Hash + metadata anchor goes to HCS topic
UI reads mirror node and verifies hash
Includes indexer pattern: HCS for ordering/proof, local JSON/SQLite/API for reads
```

Why good:

```text
- Directly matches Hedera blog: HCS is not a database, hash to HCS + index for reads
- Real Hedera service depth
- Easy to produce real testnet transaction
- Easy for developers to reuse
- Can be scaffolded cleanly
- Less risky than DEX/bridge integration in 2 days
```

Weakness:

```text
Ecosystem integration score may be lower unless we add useful external integration.
```

Add ecosystem integration by making it one of:

```text
A. GitHub release / issue audit trail template
B. AI agent decision audit trail template
C. NFT metadata provenance template
D. webhook-to-HCS proof template
```

For this user's portfolio/history, strongest is:

```text
AI Agent Decision Audit Template
```

It uses HCS as the tamper-proof agent action log and includes provider/action scoring. Fits Matoi story but becomes a reusable Hedera template, not Matoi copy.

### Second direction: x402 Pay-Per-Use Template

Uses HBAR/x402 pay-per-request, self-hosted facilitator, HCS receipt log.

Pros:

```text
- Strong, current use case
- Existing Matoi knowledge helps
- Harness registry has x402-payments skill
```

Cons:

```text
- More moving parts
- Harder docs/demo
- More risk in 2 days
```

### Third direction: HTS Permissioned Token / RWA Template

Pros:

```text
- Clear use case
- HTS depth
- Good template utility
```

Cons:

```text
- More common; competition likely
- KYC/compliance can become fake/decorative quickly
```

## Recommendation

Build:

```text
hedera-agent-audit-template
```

One-command scaffold for an AI-agent / backend-action audit trail using HCS.

Pitch:

```text
A scaffold-hbar template for apps that need a tamper-resistant audit log: hash every AI-agent decision or backend action to HCS, index it for reads, and verify it from Mirror Node.
```

Core use case:

```text
Any app can prove that an AI agent / backend action happened at time N without treating HCS as a database.
```

Hedera services:

```text
HCS topic creation
HCS message submit
Mirror Node topic message read
Optional Solidity contract only if time remains
```

Ecosystem angle:

```text
AI agent audit trail + GitHub/webhook/event source adapter.
```

## 2-day development plan — 20–30h

### Day 1 — foundation and real Hedera proof

Hour 0–1:

```text
- Create repo name
- Scaffold base from create-scaffold-hbar
- Decide npm/yarn and Next.js structure
- Add MIT license
```

Hour 1–3:

```text
- Build minimal template structure
- Add template.json
- Add README.md skeleton
- Add AGENTS.md
- Ensure command scaffolds into fresh app
```

Hour 3–7:

```text
- Implement HCS topic create / use existing topic env
- Implement submit audit event route
- Implement hash payload route/helper
- Implement mirror node read route
- UI: create event, show hash, submit, show sequence number + transaction/link
```

Hour 7–9:

```text
- Generate one real testnet transaction
- Save Hashscan/mirror node link
- Add it to README evidence section
```

Hour 9–12:

```text
- Fresh scaffold test in temp folder
- npm/yarn install
- lint
- build
- start app
- curl core routes
```

### Day 2 — quality, docs, video, submit

Hour 12–15:

```text
- Add tests for hash/verify logic
- Add route smoke tests or simple scripts
- Remove dead code / AI comments / duplicate helpers
```

Hour 15–18:

```text
- README final: quickstart, env, architecture, verify transaction
- AGENTS.md final: how AI agents should extend the template safely
- Add troubleshooting: HCS is not DB, mirror node delay, faucet, Node version
```

Hour 18–20:

```text
- Optional Hedera Harness recipe + validators
- npx hedera-harness doctor
- submit harness spec/validators if used
```

Hour 20–23:

```text
- Record 2–3 min demo video
- Show scaffold command
- Show app running
- Submit HCS event
- Open Hashscan/Mirror proof
- Explain why template is reusable
```

Hour 23–25:

```text
- Final fresh-machine test
- GitHub repo public
- Check no .env/secrets
- Fill submission form
```

Hour 25–30 buffer:

```text
- Fix scaffold command issues
- Fix docs gaps
- Polish video/script
- Add optional integration if core is already green
```

## Personal deadlines so you do not lose it

Assuming work starts Sep 30:

```text
Sep 30 night: idea locked, repo created, scaffold command works
Oct 1: HCS real transaction done, Hashscan/mirror proof saved
Oct 2: README/AGENTS/tests/build green
Oct 3: video recorded, public repo checked from fresh folder
Oct 4 morning: submit, no coding except emergency fixes
Oct 4 23:59 ET: official deadline
```

Hard rule:

```text
Do not start a complex DEX/bridge/oracle build unless HCS audit template is already scaffold-green.
```

## Submission checklist

```text
[ ] Public GitHub repo
[ ] MIT license
[ ] template.json
[ ] README.md
[ ] AGENTS.md
[ ] packages/ monorepo layout
[ ] npm create / npx create command works from fresh folder
[ ] install passes
[ ] lint passes
[ ] build passes
[ ] app boots
[ ] core routes return OK
[ ] real Hedera testnet transaction link
[ ] no .env committed
[ ] no secrets committed
[ ] demo video link
[ ] dev experience survey / submission form
[ ] harness spec + validators if used
```
