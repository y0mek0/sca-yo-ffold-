# Hedera Scaffold-HBAR bounty — deep idea research

## Цель

Найти не просто “что построить”, а template, который:

- проходит mechanical gate bounty;
- реально полезен другим Hedera devs;
- закрывает боли, которые уже были при работе с Hedera;
- быстро разворачивается одной командой;
- даёт синергию с AI/tools/другими сетями;
- можно сделать за 20–30 часов без самоубийственного scope.

## Что bounty реально оценивает

Главное: это не app submission. Это **developer starter template**.

Судьи смотрят:

```text
35 — ecosystem integration/value
30 — docs quality
20 — code quality
15 — Hedera service depth
```

Значит template должен быть:

```text
one-command scaffoldable
clean docs
real Hedera transaction
not AI slop
useful pattern for many devs
```

## Старые боли Hedera, которые стоит превратить в template features

Из прошлого Matoi/Hedera опыта были такие проблемы:

### 1. x402 / Blocky402 unclear facilitator problem

Боль:

```text
x402.org выглядел как endpoint, но оказался docs site.
/settle давал 404.
Нужно было self-host facilitator.
```

Template feature:

```text
Built-in facilitator health check:
- checks base URL
- verifies /settle shape
- shows “docs site, not facilitator” error
- has local self-hosted fallback
```

### 2. ECDSA vs ED25519 key confusion

Боль:

```text
PrivateKey.fromString(0x...) silently misparses ECDSA hex.
Result: INVALID_SIGNATURE.
Correct: fromStringECDSA for 0x keys.
```

Template feature:

```text
Key Doctor page/CLI:
- detects ED25519 DER vs ECDSA hex
- derives public key / EVM alias
- checks account mapping via mirror node
- refuses ambiguous key format
```

### 3. Account ID vs EVM address confusion

Боль:

```text
User has 0x EVM address, SDK needs 0.0.x account ID.
Need mirror node lookup.
```

Template feature:

```text
Account Resolver:
0x address -> mirror node account ID
account ID -> public key / evm_address / balance
```

### 4. Token association / USDC problem

Боль:

```text
Hedera token transfers fail if receiver not associated.
Faucet can return success/hash null.
```

Template feature:

```text
Token Readiness Check:
- account balance via mirror node
- token association check
- clear setup blocker with next command/link
```

### 5. HCS misconception

Боль / official note:

```text
HCS is not a database.
Correct pattern: hash/event to HCS, index for reads.
```

Template feature:

```text
HCS Proof Log pattern:
- write hash/event to HCS
- local index JSON/SQLite for search
- mirror node proof verification
```

### 6. Deprecated API trap

Hedera update:

```text
AccountBalanceQuery removed in v0.77.
Use MirrorNodeAccountBalanceQuery or REST /balances?account.id=
```

Template feature:

```text
Only mirror-node balance reads.
No AccountBalanceQuery.
```

### 7. Atomic batch smart contract call deprecation

Hedera update:

```text
Smart contract calls inside atomic batch deprecated, removal March 2027.
```

Template feature:

```text
No architecture depending on atomic batch + contract inner calls.
Sequential submission / contract composition only.
```

## Tools from insta_2 that are actually relevant

### Strong references / possible integrations

```text
FOMO Robinhood Radar
- on-chain wallet/token signal radar + Telegram/API
- useful as reference for “watcher/radar/event signal” template

GitDiagram
- repo -> architecture diagram
- useful for docs/architecture proof and README visuals

Iris
- screenshot/mobile/dark-mode visual QA for agents
- useful as included validation recipe, not app feature

iFixAI
- agent evaluation/audit
- useful for our “AI agent action audit” concept

Open Code Review
- AI review of git diff
- useful as optional audit input source

Page Agent / Browser Use / Jev Ultrafast
- browser agent actions
- useful if template anchors browser-agent actions to HCS

OpenResearch / Feynman
- research agents
- useful if template anchors research claims/sources to HCS

Agentic Inbox
- agent reads/writes email with confirmation
- useful pattern: human approval before side effects

OfficeCLI
- agent works with docs/pptx/xlsx
- useful as optional artifact generator, not core MVP

RAGFlow / MemPalace
- knowledge/memory systems
- useful as index layer example: data off-chain, proof hash on HCS

Oh My Subagents / DeerFlow / Loop Engineering
- long-running agent workflow patterns
- useful conceptually: agent run state + checkpoints + audit events

9Router
- AI provider routing
- useful if we template AI provider cost/fallback logs to HCS
```

### Not good as core bounty idea

```text
Instagram/private API tools
- too much ToS/account risk

Security/OSINT/leak tools
- risky, distracts from Hedera bounty

DEX/bridge/lending deep integrations
- score high, but too risky in 20–30h unless read-only
```

## What useful thing devs actually need

A lot of hackathon/Web3 builders suffer from the same problem:

```text
They can create a demo, but cannot prove what happened.
```

Examples:

```text
AI agent made a decision → where is proof?
Backend approved payment → where is proof?
Browser agent clicked/filled something → where is proof?
Research agent cited sources → where is proof?
User uploaded doc/hash → where is proof?
Wallet/action failed → how to diagnose quickly?
```

Hedera is good exactly for:

```text
cheap ordered proof log
fast finality
mirror-node verification
low predictable fees
```

So the strongest template should be around:

```text
proof, audit, verification, agent actions, payment/action readiness
```

## Best project direction

# 1. Hedera Agent Proof Kit

Working name:

```text
hedera-agent-proof-kit
```

One-liner:

```text
A scaffold-hbar template for AI apps that need verifiable agent actions: hash every decision/action, anchor it to HCS, index it locally, and verify it through Mirror Node.
```

Core user:

```text
Developer building an AI agent / automation / backend workflow on Hedera.
```

Main demo loop:

```text
1. Pick action type: AI decision / browser action / payment intent / research claim
2. Enter payload or use sample action
3. App normalizes payload
4. App hashes payload
5. App submits audit event to HCS
6. App saves local index record
7. App reads mirror node
8. App verifies hash match
9. UI shows proof card + Hashscan/mirror link
```

Why this is strong:

```text
- Directly useful to many developers
- HCS has real product role, not decorative use
- Matches Hedera’s “HCS is not a database” guidance
- Easy to make one real testnet tx
- Easy to explain in video
- Low risk for 2-day build
- Can include optional adapters for other tools/networks later
```

## Product shape

### Scaffold output

After command:

```bash
npm create scaffold-hbar@latest -- --template yomek/hedera-agent-proof-kit
```

developer gets:

```text
packages/
  nextjs/ or frontend/
  hcs/ or server helpers
README.md
AGENTS.md
template.json
LICENSE
.env.example
.harness/ optional
```

### UI pages

```text
/                Control room
/proofs          Local proof index
/doctor          Hedera setup doctor
/api/audit       submit event to HCS
/api/verify      verify event from mirror node
/api/doctor      account/key/topic/token readiness checks
```

### Control room UI

Not overdesigned. Clear dev tool style:

```text
[Sample: AI Decision]
[Sample: Browser Agent Action]
[Sample: Payment Intent]
[Sample: Research Claim]

Payload editor
Normalize + Hash
Anchor to HCS
Verify from Mirror Node
Proof card
```

### Terminal UX

Need a clean terminal flow because this is a scaffold template.

Commands:

```bash
npm run doctor
npm run dev
npm run audit:sample
npm run verify:sample
npm run test
npm run build
```

Terminal should print clear states:

```text
HEDERA_OPERATOR_ID      OK 0.0.xxxx
HEDERA_OPERATOR_KEY     OK ECDSA hex / ED25519 DER detected
MIRROR_NODE             OK testnet reachable
HCS_TOPIC_ID            OK 0.0.xxxx / will create if empty
BALANCE                 OK 12.34 HBAR
LAST_PROOF              OK sequence=12 hash=abc...
```

This directly solves the “Hedera setup confusion” problem.

## Ecosystem integration options

To score more than basic HCS, add selectable adapters.

### Adapter A — Browser Action Proof

Inspired by:

```text
Browser Use / Jev Ultrafast / Page Agent / Iris
```

What it does:

```text
Logs a browser-agent action summary:
- url
- action type
- selector/text target
- result hash
- screenshot hash optional
```

Why useful:

```text
Browser agents need audit trails. HCS proves an action transcript existed.
```

Risk:

```text
No need to automate real browser in MVP. Use sample payload + docs for adapter interface.
```

### Adapter B — Research Claim Proof

Inspired by:

```text
OpenResearch / Feynman / GitSearchAI
```

What it does:

```text
Logs claim + source URLs + digest:
- claim text
- source URLs
- evidence hash
- model/provider optional
```

Why useful:

```text
AI research agents hallucinate. Template shows how to prove the evidence bundle without storing raw text on-chain.
```

### Adapter C — Payment Intent Proof

Inspired by Matoi/x402 pain.

What it does:

```text
Logs payment intent before money moves:
- payer alias
- receiver alias
- asset
- amount
- policy id
- decision hash
```

Why useful:

```text
Autonomous payment systems need audit before signing.
```

Stretch:

```text
x402 pay-per-use starter route
self-hosted facilitator checker
```

### Adapter D — Git/Code Review Proof

Inspired by:

```text
Open Code Review / GitDiagram
```

What it does:

```text
Logs git diff hash + AI review result hash + repo commit.
```

Why useful:

```text
AI coding agents need tamper-proof review/checkpoint history.
```

## Alternative project ideas

# 2. Hedera Payment Readiness Template

One-liner:

```text
A template that diagnoses Hedera payment setup before a developer signs: account mapping, ECDSA/ED25519 key format, token association, mirror-node balance, facilitator health.
```

Very useful because it solves our real pain.

Pros:

```text
- Very practical
- Strong docs value
- Solves INVALID_SIGNATURE / token association / x402 endpoint confusion
```

Cons:

```text
- Less product-like
- HCS/service depth weaker unless it also anchors readiness reports
```

Verdict:

```text
Better as “Doctor” module inside Agent Proof Kit, not standalone.
```

# 3. x402 HBAR Pay-Per-Use Template

One-liner:

```text
A scaffold-hbar template for a pay-per-use API on Hedera with local facilitator, x402-style challenge/settle/verify, and HCS receipt log.
```

Pros:

```text
- Stronger payment story
- Uses Matoi knowledge
- More exciting demo
```

Cons:

```text
- More brittle
- Could burn 2 days debugging payment rails
- x402 ecosystem ambiguity
```

Verdict:

```text
Stretch or second template later. Too risky as primary if time is 20–30h.
```

# 4. Builder Blockpage Template

Inspired by Discord chat:

```text
user-owned blockpages, direct wallet tips, creator/project page, town-hall marketplace/forum
```

One-liner:

```text
A template for Hedera builder blockpages: project profile, direct HBAR tips, HCS updates, proof feed.
```

Pros:

```text
- Community narrative is strong
- Simple UI
- Useful for Hedera builders
```

Cons:

```text
- Ecosystem integration may be light
- Could look like a website template, not deep Hedera service template
```

Verdict:

```text
Good UI/demo wrapper around Agent Proof Kit, not core.
```

# 5. Memecoin Launchpad / Bonding Curve Template

Inspired by Discord chat.

Pros:

```text
- Exciting
- Clear DeFi use case
```

Cons:

```text
- Too big
- Security risk
- Bonding curve + liquidity migration + AMM in 2 days is dangerous
```

Verdict:

```text
Do not choose for this bounty under 30h.
```

## Recommended final concept

# Hedera Agent Proof Kit

Short description:

```text
A scaffold-hbar template that gives AI apps a verifiable audit layer: hash agent decisions, browser actions, research claims, or payment intents; anchor them to HCS; index them locally; and verify them through Mirror Node.
```

Why it fits scoring:

```text
Ecosystem/value 35:
- AI agent workflows + browser/research/payment adapters
- useful for real devs building agents/automation

Docs 30:
- can be excellent: Quickstart, Doctor, proof model, adapter guide

Code 20:
- small clean codebase, tests around hash/normalize/verify

Hedera depth 15:
- HCS topic/message/mirror verification deeply used
- Mirror Node reads
- optional topic creation
```

## What makes it different from basic HCS demo

Bad basic HCS demo:

```text
Click button -> submit text to HCS
```

Our version:

```text
normalized event schema
hashing discipline
local index vs HCS proof separation
mirror verification
agent adapter interfaces
Hedera Doctor
real troubleshooting for key/account/facilitator issues
```

This is the “HCS is not a database” template.

## Minimal MVP scope

Must-have:

```text
1. template.json
2. README.md
3. AGENTS.md
4. MIT license
5. package workspace shape
6. Next.js UI
7. HCS submit
8. Mirror Node verify
9. local JSON index
10. npm run doctor
11. sample event adapters
12. tests for normalize/hash/verify
13. one real testnet transaction link
14. fresh scaffold command tested
```

Nice-to-have:

```text
1. .harness/spec.yaml + validators
2. Playwright smoke
3. Browser-action adapter sample
4. Payment-intent adapter sample
5. Git diff proof adapter sample
6. Generated architecture Mermaid
```

Do NOT include in MVP:

```text
real DEX trades
real bridges
full x402 payments
Telegram scraping
private API/social account automation
security/leak tooling
```

## How deployment/scaffold should feel

### Developer starts

```bash
npm create scaffold-hbar@latest -- --template yomek/hedera-agent-proof-kit
cd my-agent-proof-app
cp .env.example .env.local
npm run doctor
npm run dev
```

### If no credentials

App should still run in demo mode:

```text
Demo mode: can hash, index locally, preview payload.
HCS submit disabled until HEDERA_OPERATOR_ID/KEY are set.
```

### If credentials present

```text
Doctor green
Anchor button enabled
Real HCS tx
Mirror verification card
```

### Terminal aesthetics

Use clean plain output, not huge ASCII.

Good:

```text
Hedera Doctor
Network        testnet OK
Operator       0.0.xxxx OK
Key format     ECDSA hex OK
Mirror Node    reachable OK
Topic          0.0.xxxx OK
Balance        10.23 HBAR OK
```

Avoid:

```text
massive banners
AI marketing copy
unclear stack traces
```

## How demo video should look

2–3 minutes:

```text
1. Run scaffold command
2. npm run doctor shows setup readiness
3. npm run dev opens UI
4. Select “AI decision” sample
5. Anchor to HCS
6. Show sequence / tx / topic
7. Verify from Mirror Node
8. Explain adapter pattern: browser action, payment intent, research claim
```

## Final recommendation

Build this:

```text
hedera-agent-proof-kit
```

Not because it is flashiest, but because it has the best ratio:

```text
useful + Hedera-native + low-risk + explainable + reusable + finishable
```

If we want a more exciting public name:

```text
HashTrail HBAR
AgentProof HBAR
HCS Proof Kit
```

Best repo name:

```text
hedera-agent-proof-kit
```

Best product title:

```text
AgentProof HBAR
```

## Next build decision

Pick one:

```text
A. AgentProof HBAR — HCS audit/proof template for AI/backend actions  [recommended]
B. HBAR Payment Doctor — payment/key/token/facilitator readiness template
C. x402 Pay-Per-Use Template — payment API starter, higher risk
D. Builder Blockpage Template — project page + tips + HCS updates
```
