# Bounty evidence

This file records checks that were run against the public template. It is an evidence
map, not a claim that a proof hash makes an external claim true.

## Eligibility and reproducibility

| Requirement | Evidence |
|---|---|
| External `create-scaffold-hbar` template | `npm create scaffold-hbar@latest -- agentproof-smoke --template y0mek0/sca-yo-ffold- --frontend nextjs-app --solidity-framework none --package-manager npm --network testnet --ci --skip-hedera-skills --skip-install` |
| Fresh install | `npm install --no-audit --no-fund` in a disposable generated project |
| Fresh quality gates | `lint`, `typecheck`, `test`, `build`, and `doctor` all passed; 30 test files / 87 tests |
| Required template files | `template.json`, `README.md`, `AGENTS.md`, and `LICENSE` are at repository root |
| No committed secrets | `.env*` is ignored except `.env.example`; credentials stayed local |
| Demo without credentials | Fresh `doctor` reports demo mode and zero local proofs without failing |
| Hedera usage | HCS proof messages and a real HBAR `TransferTransaction` on Hedera testnet |
| Independent verification | Mirror Node hash checks and transfer lookup passed |
| SaucerSwap adapter | Public `GET https://api.saucerswap.finance/pools/<pool-id>` is normalized into a `market_snapshot` proof; adapter tests pass; live HCS evidence is recorded below when credentials are available |

## Live testnet evidence

The latest repeat run produced:

```text
HCS sample              sequence 31
GitHub release watcher  sequence 32
HBAR price watcher      sequence 33
GitHub issues watcher   sequence 34
Payment intent          sequence 35
Payment transfer        SUCCESS
Payment execution       sequence 36
Concurrent HCS writes  sequences 37, 38, 39
SaucerSwap snapshot       sequence 40
```

The SaucerSwap adapter passed a live public API fetch for pool `0` (`SAUCE / HBAR`, pool contract `0.0.1062795`), anchored the normalized proof to HCS sequence `40`, and was confirmed by Mirror Node with a matching SHA-256 digest:

```text
sequence: 40
hash: 58478f383c6cd3b3f501f2740c7b120dbad48dfbaf8a9f11305443de98de394c
mirror: confirmed hash
```

Mirror Node confirmed the hashes for sequences 31 through 36. The payment workflow
is intentionally HBAR-only:

```text
intent proof -> HBAR transfer -> SUCCESS receipt -> execution proof
```

The execution proof is not created when the transfer does not reach `SUCCESS`.

## Error and safety evidence

- Invalid HCS topic: classified as `invalid_topic_id`, without dumping credentials.
- Concurrent local appends: all parallel entries were preserved.
- Corrupt and oversized local index input: covered by the security test suite.
- External GitHub and CoinGecko APIs: optional adapters with explicit failure paths.
- RAG memory, browser action, and payment intent factories remain honest schema-level
  adapters unless their real external execution path is explicitly documented.

## Rubric mapping used for preparation

The project was prepared against the published bounty breakdown recorded in the
submission notes:

- **35 points — ecosystem integration and value:** reusable proof layer for research,
  AI decisions, documents, releases, issues, market signals, and payments; real HCS
  anchoring is load-bearing rather than decorative.
- **30 points — documentation:** scaffold, install, demo mode, doctor, sample proof,
  Mirror verification, limitations, and sandbox history are documented.
- **20 points — code quality:** TypeScript validation, focused adapter tests, full test
  suite, lint, typecheck, build, error classification, and safe secret handling.
- **15 points — Hedera service depth:** HCS is used as an ordered tamper-evident event
  log, Mirror Node is used for independent verification, and HBAR transfer execution
  is paired with intent/execution proofs.

AgentProof proves that normalized data was recorded in a particular form and at a
particular time. It does not by itself prove the truth of a claim, correctness of an
AI decision, profitability, legal compliance, or completion of an intent that never
received a successful Hedera receipt.

Official references:

- https://hedera.com/blog/scaffold-hbar-template-bounty/
- https://hedera.com/scaffold-hbar-template-bounty/
