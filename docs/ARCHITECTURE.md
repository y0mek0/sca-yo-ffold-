# AgentProof HBAR: How It Works

## The simple formula

**An external source provides data. An adapter converts it into one stable format. AgentProof creates a digital fingerprint of that data. Hedera HCS records the fingerprint publicly. The full event stays in separate storage. Mirror Node later confirms that the fingerprint was recorded and has not changed.**

In short:

```text
external data or action
→ normalized JSON
→ SHA-256 fingerprint
→ HCS public proof log
→ full event stored off-chain
→ Mirror Node verification
```

AgentProof does not prove that an external source was correct. It proves exactly what data was recorded and when.

## Layers

### Sources

- GitHub releases and issues;
- CoinGecko HBAR price;
- SaucerSwap pool API;
- Hedera Mirror Node for HTS token and treasury state;
- documents and reports;
- Hedera payment results.

### Adapters

Each adapter receives a source response and creates a shared `ProofEvent`. A source can therefore be replaced without changing hashing, HCS submission, or verification.

### Normalization and hashing

Normalization keeps the fields needed for one event type. The canonical JSON is then hashed with SHA-256. Changing one character creates a different hash.

### Local proof index

The full event stays off-chain in the local JSONL index. A production application can replace this layer with a database, object storage, or another storage provider.

### HCS

HCS is the public ordered proof log. AgentProof sends a compact message containing the hash and minimal metadata instead of a large payload.

### Mirror Node

Mirror Node independently reads the HCS message and Hedera transaction. The local hash is compared with the hash recorded in HCS.

## Demo and live modes

`audit:sample` and `verify:sample` use a deterministic local sample. They are safe checks for the event schema and hashing flow and do not submit a transaction.

`watch:*`, `hcs:submit`, and `payment:intent:hbar` use Hedera testnet credentials from a local `.env.local` file.

The public repository contains no credentials, `.env.local`, or runtime `.data` artifacts.

## Payment flow

A payment has two separate events:

```text
payment intent
→ intent proof
→ real HBAR transfer
→ Hedera SUCCESS receipt
→ execution proof
→ Mirror Node verification
```

`intent` means that the agent planned to pay. `execution` means that Hedera confirmed the transfer.

## Project boundaries

AgentProof is not a trading bot, exchange, wallet, financial advisor, compliance SaaS product, or database. It does not execute swaps and does not prove that an AI decision was correct. It records input data, a decision, or an action result and makes that record independently verifiable.
