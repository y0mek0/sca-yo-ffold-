# Agent instructions for AgentProof HBAR

Follow these rules when extending this template.

## Core rules

- Keep HCS as a proof log, not a database.
- Store full payloads off-chain.
- Submit only hashes and minimal metadata to HCS.
- Use Mirror Node reads for verification.
- Do not use deprecated `AccountBalanceQuery`.
- If a Hedera key starts with `0x`, parse it as ECDSA.
- Never expose operator keys to the frontend.
- Never commit `.env`, `.env.local`, `.data/`, or runtime harness artifacts.

## Adapter rules

Adapters should only transform external tool output into a normalized `ProofEvent`.

```text
external tool output -> adapter -> ProofEvent -> hash -> HCS -> verify
```

Do not add heavy external dependencies unless the adapter is part of the active build scope.

## Required checks before claiming done

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run doctor
```
