# Tracemark: Use Cases and Buildable Programs

All six professions use the same proof layer. They differ in the data sources they read and the actions they take after analysis.

## Non-Web3: DevOps / SRE / release manager

### Useful components

- GitHub release watcher;
- GitHub issues watcher;
- AI Decision proof;
- Document hash;
- Browser Action proof;
- HCS timestamp and Mirror verification.

### Flow

```text
release + issues
→ deployment analysis
→ deploy / rollback decision
→ decision proof
→ HCS
```

### Two useful programs

**Release Safety Gate** checks a release, critical issues, and security notes before deployment. It returns `DEPLOY` or `BLOCK` and records the inputs and reason.

**Incident Timeline Builder** combines releases, issues, alerts, rollbacks, and operator decisions into one timeline. Each important event gets a proof.

## Non-Web3: research / due diligence analyst

### Useful components

- Research Claim proof;
- Document hash;
- GitHub snapshots;
- external API snapshots;
- RAG memory hash;
- HCS and Mirror verification.

### Flow

```text
sources
→ snapshots
→ research claim
→ report
→ report hash
→ HCS
```

### Two useful programs

**Due Diligence Pack Generator** collects sources, snapshots, evidence, and risk flags into one report with proof links.

**Research Claim Registry** stores individual claims, sources, evidence, confidence, and HCS sequences. Later, the analyst can check which data supported each claim.

## Non-Web3: document / legal / accounting operations

### Useful components

- Document hash;
- AI Decision proof;
- approval record;
- Payment Intent;
- Payment Execution;
- HCS timestamp.

### Flow

```text
document
→ hash
→ approval
→ payment intent
→ HBAR transfer
→ execution proof
```

### Two useful programs

**Invoice Proof & Payment** hashes an invoice, records approval, creates a payment intent, executes an HBAR transfer, and links the result to the original document.

**Contract Version Registry** stores versions of contracts, invoices, and reports. Each version has a hash, timestamp, author, approval record, and HCS sequence.

## Web3: protocol researcher / crypto data analyst

### Useful components

- SaucerSwap market snapshot;
- HTS token and treasury snapshot;
- HBAR price snapshot;
- GitHub releases and issues;
- Research Claim proof;
- Document hash.

### Flow

```text
market data + token data + protocol activity
→ protocol report
→ research claim
→ HCS
```

### Two useful programs

**Protocol Health Dashboard** shows token supply, treasury balance, pool liquidity, HBAR price, and development activity. Daily snapshots can be checked through HCS.

**Ecosystem Change Detector** compares two snapshots and reports changes in supply, treasury, liquidity, price, releases, and critical issues.

## Web3: DAO treasury / grants / governance

### Useful components

- HTS treasury snapshot;
- proposal document hash;
- Research Claim;
- AI Decision;
- Payment Intent;
- Payment Execution;
- HCS and Mirror Node.

### Flow

```text
proposal
→ treasury snapshot
→ analysis
→ governance approval
→ payment intent
→ HBAR execution proof
```

### Two useful programs

**Grant Allocation Tracker** links a proposal, recipient, budget, milestones, approvals, and real payments. Important changes are recorded as proofs.

**Treasury Decision Room** gathers the current treasury state, proposal, payment history, and risk notes into a voting package. After approval, the package links to the payment intent.

## Web3: crypto risk manager / market operations

### Useful components

- SaucerSwap pool snapshot;
- HTS supply and treasury snapshot;
- HBAR price;
- GitHub issues and releases;
- AI Decision proof;
- Payment Intent when an action is approved.

### Flow

```text
market + token + protocol activity
→ risk calculation
→ ALLOW / REVIEW / BLOCK
→ HCS proof
```

### Two useful programs

**Risk Snapshot Monitor** periodically records liquidity, supply, treasury, price, and protocol activity, then shows changes between snapshots.

**Policy Decision Engine** applies rules: low liquidity blocks an action, high treasury concentration requires review, and a critical issue pauses the operation. The proof contains the rules and input data.

## How the professions connect

```text
protocol researcher
→ market / token / GitHub report
        ↓
crypto risk manager
→ risk decision
        ↓
DAO governance
→ proposal and approval
        ↓
treasury / accounting
→ payment intent
        ↓
Hedera
→ HBAR transfer and execution proof
```

The whole path can later be checked through HCS and Mirror Node.

## Shared boundary

A proof shows which data and decisions were recorded. It does not say that the market was fair, the AI was right, or the trade was profitable.
