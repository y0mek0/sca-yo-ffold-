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

1. Research Claim Proof
2. AI Decision Proof
3. Document / Office Proof

## Quickstart

```bash
npm install
cp .env.example .env.local
npm run doctor
npm run dev
```

Open <http://localhost:3000>.

## Important pattern

HCS is not used as a database. AgentProof stores only proof hashes and minimal metadata on HCS. Full payloads stay in the local `.data/` index or in your own storage.

## Bounty evidence

Add the final testnet topic, sequence number, Mirror Node URL, and Hashscan URL here after the first real proof is submitted.
