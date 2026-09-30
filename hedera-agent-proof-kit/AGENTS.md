# Agent instructions for AgentProof HBAR

Follow these rules when extending this template.

## Core rules

- Keep HCS as a proof log, not a database.
- Store full payloads off-chain.
- Submit only hashes and minimal metadata to HCS.
- Use Mirror Node reads for verification.
- Do not use deprecated `AccountBalanceQuery`.
- If a Hedera key starts with `0x`, parse it as ECDSA. The doctor calls `describeHederaKey` and rejects unknown key shapes.
- For account ids, use the canonical `0.0.X` form. The doctor calls `parseHederaAccountId` and surfaces a clear error otherwise.
- Never expose operator keys to the frontend.
- Never commit `.env`, `.env.local`, `.data/`, or runtime harness artifacts.

## Adapter rules

Adapters should only transform external tool output into a normalized `ProofEvent`.

```text
external tool output -> adapter -> ProofEvent -> hash -> HCS -> verify
```

Do not add heavy external dependencies unless the adapter is part of the active build scope.

Working Core+ adapters live in `packages/nextjs/src/lib/adapters/`:

- `research-claim.ts` — claim + sources + evidence summary.
- `ai-decision.ts` — agent decision + rationale + confidence.
- `document-office.ts` — file metadata + SHA-256 digest.

Roadmap adapters live in `packages/nextjs/src/lib/adapters/roadmap.ts`:

- `browser-action.ts` — URL/action/result/screenshot hash for browser agents.
- `payment-intent.ts` — payer/receiver/asset/amount/policy before a payment is signed.
- `watcher-signal.ts` — wallet, market, GitHub, or news signal proofs.
- `rag-memory.ts` — question, answer, and retrieved chunks hash.

Each roadmap adapter is shipped as a typed factory so the rest of the template can be wired in without redesigning the ProofEvent schema.

## Required checks before claiming done

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run doctor
```
