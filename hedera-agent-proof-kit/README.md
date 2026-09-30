# AgentProof HBAR

A `scaffold-hbar` template for verifiable AI, research, and document workflows.

AgentProof hashes important outputs, anchors the proof to Hedera Consensus Service, stores the full payload off-chain in a local index, and verifies it through Hedera Mirror Node.

## Core

```text
payload -> normalize -> hash -> HCS -> local index -> Mirror Node verify
```

Core includes:

- HCS proof log
- Mirror Node verification
- local proof index
- Hedera setup doctor
- clear demo mode when credentials are missing

## Core+ working adapters

1. Research Claim Proof — claim + sources + evidence summary become a verifiable off-chain event.
2. AI Decision Proof — agent decision + rationale + confidence become an auditable decision proof.
3. Document / Office Proof — file metadata + SHA-256 digest prove a document version without storing bytes.

## Roadmap adapters

- Browser Action Proof — URL/action/result/screenshot hash for browser agents.
- Payment Intent Proof — payer/receiver/asset/amount/policy before a payment is signed.
- Watcher / Radar Proof — wallet, market, GitHub, or news signal proofs.
- RAG / Memory Proof — question, answer, and retrieved chunks hash.
- Agent Evaluation Proof — eval score, failed checks, and report hash.

## Quickstart

```bash
npm install
cp .env.example .env.local
npm run doctor
npm run dev
```

Open <http://localhost:3000>.

## Stage 2 local proof commands

Create a deterministic local proof sample:

```bash
npm run audit:sample
```

Verify the local proof by recomputing the off-chain event hash and comparing it with the HCS-safe message hash:

```bash
npm run verify:sample
```

These commands are local-only for now. Stage 4 replaces the sample HCS message with a real Mirror Node-read HCS message.

## Important pattern

HCS is not used as a database. AgentProof stores only proof hashes and minimal metadata on HCS. Full payloads stay in the local `.data/` index or in your own storage.

The HCS message intentionally excludes raw payload fields like source text, file names, private notes, or evidence bundles. It keeps only:

```text
schema version
kind
subject id/type
sha256 digest
minimal metadata
```

## Bounty evidence

Add the final testnet topic, sequence number, Mirror Node URL, and Hashscan URL here after the first real proof is submitted.
