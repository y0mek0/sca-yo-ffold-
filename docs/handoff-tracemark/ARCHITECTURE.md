# Tracemark Control Room Architecture

## Product data graph

```mermaid
flowchart LR
  S[External source or action] --> A[Typed adapter]
  A --> N[Normalized ProofEvent]
  N --> H[SHA-256 fingerprint]
  N --> L[Full payload off-chain local index]
  H --> P[Compact HCS proof]
  P --> M[Hedera Mirror Node]
  M --> C[Digest comparison]
  C --> R[HASH MATCH YES / failure]
```

## Two-scenario film graph

```mermaid
flowchart TD
  I[Intro slides] --> G[Operator types go]
  G --> D1[Transition: DevOps / SRE]
  D1 --> D2[GitHub release + issues]
  D2 --> D3[Release Safety Gate]
  D3 --> D4[AI Decision proof]
  D4 --> PA[Pause and explain what was recorded]
  PA --> W1[Transition: Web3 / protocol]
  W1 --> W2[HBAR + SaucerSwap + HTS + GitHub]
  W2 --> W3[Protocol Health Dashboard]
  W3 --> W4[Research Claim proof]
  W4 --> F[Final comparison]
  F --> H[HashScan latest public transaction]
```

## Electron window roles

```mermaid
flowchart LR
  E[One Electron BrowserWindow]
  E --> AC[Action Console]
  E --> DEP[Deployment]
  E --> PROOF[Proof terminal]
  E --> ACT[Proof activity]
  E --> HS[Embedded HashScan webview]

  AC -->|operator input go| O[orchestrator.js]
  O -->|state.json| AC
  O -->|state.json| ACT
  O -->|PTY output| PROOF
  O -->|readiness| DEP
  O -->|verified hashscanUrl| HS
```

## Role definitions

### Action Console

The operator-facing narrative surface. It must say what scenario is beginning, what the system will read, what it will record, and when the scenario is complete. It owns the `go` input and the short transitions between phases.

### Deployment

Only local readiness: hidden Next.js server, API doctor response, template/process status. It must not pretend to be a proof result.

### Proof

Technical pipeline: source fetch, normalized event type, digest, HCS submission, sequence number, Mirror read-back, digest comparison.

### Proof activity

Audience-friendly state summary. It must show the active scenario and the current record/stage, not duplicate generic terminal prose. The target stage list is:

```text
read → normalize → hash → write to HCS → check
```

### HashScan

The official public Hedera evidence page inside the existing Electron `<webview>`. It must receive the latest verified transaction URL and must not open an external browser automatically.

## State contract needed by the visible UI

The current orchestrator writes fields such as:

```text
stage
scenario
status
active
comment
source
proofs[]
sequence
hashMatch
hashscanUrl
```

The renderer must map these to human-visible content:

```text
scenario title
scenario explanation
current action
what was recorded
current proof stage
latest public reference
success/failure state
```

The current defect is that the state contract exists in the backend, but the renderer does not yet turn it into a sufficiently specific audience narrative.
