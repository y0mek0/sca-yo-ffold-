# Scaffold-HBAR bounty: requirement-to-proof checklist

This checklist is based on the bounty brief supplied for this submission and the local Scaffold-HBAR validation notes. It is not a replacement for checking the live submission form before final upload.

| Requirement | Repository proof | Verification |
| --- | --- | --- |
| Public reusable template | Root `package.json`, `template.json`, `README.md`, `AGENTS.md`, `LICENSE`, `packages/nextjs/` | Fresh `create-scaffold-hbar` regression |
| Valid template manifest | `template.json` declares Next.js, npm, Node `>=20.18.3`, Hedera env vars | Manifest validation and fresh scaffold |
| Hedera service | HCS proof log, Hedera SDK submit scripts, Mirror Node verification, HTS read-only snapshot | Real testnet sequences and Mirror hash match |
| Real ecosystem value | GitHub, CoinGecko, SaucerSwap, HTS treasury snapshots | Watcher/adapters and live HCS evidence |
| Real testnet evidence | HCS sequences 31–41, including payment and ecosystem snapshots | HashScan topic and Mirror Node |
| Payment distinction | Intent proof before transfer; execution proof after `SUCCESS` receipt | `payment:intent:hbar` and Mirror checks |
| Reusable code | Adapters use a shared `ProofEvent`, canonical JSON and HCS envelope | Unit tests and adapter scripts |
| Documentation | README, architecture, getting started, use cases, sandbox history and evidence matrix | Read docs from a clean checkout |
| Quality gates | ESLint, TypeScript, Vitest, Next build, Doctor, sample audit/verify | Full regression command |
| Secret hygiene | `.env*` and `.data/` ignored; HCS stores hashes/minimal metadata only | Git tracked-file and forbidden-pattern scan |
| MIT license | Root `LICENSE` | File check |
| Original reusable conversion | Scaffold-compatible root layout plus reusable adapters, scripts, UI and docs | Fresh scaffold, not only the original app |

## Known live evidence

```text
SaucerSwap pool snapshot  → sequence 40 → Mirror hash confirmed
HTS treasury snapshot    → sequence 41 → Mirror hash confirmed
Payment intent/execution  → sequences 35/36 → Mirror confirmed
```

## Honest limitations

- Demo sample commands are local and deterministic; they are not testnet transactions.
- HTTP smoke is not claimed as Playwright E2E.
- SaucerSwap is read-only; no swaps or trading are implemented.
- HTS snapshot is read-only; no token transfer or association is performed by the adapter.
- Payment is HBAR only; HTS/USDC payment execution is not claimed.
- The full payload stays off-chain; HCS proves the digest and metadata, not the truth of an external claim.
- The official contest page was not used as direct HTTP evidence when access was blocked; the final eligibility matrix is based on the brief supplied by the user and repository-level checks.

## Final submission pass

Before submitting, confirm manually:

- repository is public;
- `main` is the default branch;
- submission form and registration are complete;
- video shows the end-to-end flow and a real Hedera proof;
- video labels demo/local sample versus real testnet execution;
- links in the form point to the current public repository and evidence.
