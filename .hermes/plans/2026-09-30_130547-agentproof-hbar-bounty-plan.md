# AgentProof HBAR Implementation Plan

> **For Hermes:** план только для старта разработки после команды пользователя. Сейчас ничего не кодить.

**Goal:** сделать public `scaffold-hbar` template для bounty: `AgentProof HBAR` — HCS proof layer для AI/research/document workflows.

**Architecture:** маленький железный Core + три реально рабочих Core+ adapters. Core пишет normalized proof events в HCS, хранит полный payload off-chain в local index, читает Mirror Node и проверяет hash. Core+ adapters дают готовые формы/use-cases: Research Claim Proof, AI Decision Proof, Document / Office Proof.

**Tech Stack:** Scaffold-HBAR external template, Next.js App Router, TypeScript, npm workspaces, Hedera SDK, Hedera Mirror Node REST, HCS, local JSON index, Vitest, Playwright smoke, optional Hedera Harness validators.

---

## 1. Sources / отсылки на условия

### Bounty links

```text
Bounty brief: https://hedera.com/blog/scaffold-hbar-template-bounty/
Submit/Register: https://hedera.com/scaffold-hbar-template-bounty/
Hedera Harness: https://github.com/hedera-dev/hedera-harness
create-scaffold-hbar: https://github.com/hedera-dev/create-scaffold-hbar
```

### Local source files already collected

```text
C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\BOUNTY_NOTES_AND_PLAN.md
C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\BOUNTY_IDEAS_RESEARCH.md
C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\hedera-harness\README.md
C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\hedera-harness\docs\authoring-a-recipe.md
C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\create-scaffold-hbar\contributors\THIRD-PARTY-TEMPLATES.md
C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\create-scaffold-hbar\contributors\TEMPLATES.md
C:\Users\azi\Downloads\Scaffold HBAR Bounty 🏆 $10K in Prizes AMA & Office Hours - 2026-09-29.txt
```

### Tool/library research source

```text
C:\Users\azi\Documents\инфа-сбор\tools\insta_2\README.md
C:\Users\azi\Documents\инфа-сбор\tools\insta_2\tools_database.json
C:\Users\azi\Documents\инфа-сбор\tools\insta_2\tools_index.md
```

---

## 2. Competition fit check

### Official ask

They ask for:

```text
One public GitHub repository.
A working scaffold-hbar template for a real Hedera use case.
Scaffoldable with one command.
Production-quality starter for other Hedera developers.
```

Our project fits because:

```text
AgentProof HBAR is a reusable developer template, not a one-off app.
It gives AI/research/document apps a Hedera-native proof layer.
It uses HCS for real proof logging and Mirror Node for verification.
It ships as a template repo that can be scaffolded into a fresh project.
```

### Required command target

Primary command from brief:

```bash
npm create scaffold-hbar@latest -- --template yomek/hedera-agent-proof-kit
```

Also test the actual package command from `create-scaffold-hbar` docs:

```bash
npx create-scaffold-hbar@latest --template yomek/hedera-agent-proof-kit
```

For local iteration before public repo is ready, use local cloned CLI or published branch form:

```bash
npx create-scaffold-hbar@latest --template yomek/hedera-agent-proof-kit#main
```

### Required repo shape

`create-scaffold-hbar` third-party templates expect this style:

```text
hedera-agent-proof-kit/
  packages/
    nextjs/
    hardhat/             optional/minimal placeholder if needed by template manifest
  template.json
  README.md
  AGENTS.md
  LICENSE
  .gitignore
  .env.example
```

Bounty brief asked for monorepo with packages for frontend and contracts. Since our Core does not need Solidity, keep `packages/nextjs` as real app and decide one of two safe options during implementation:

```text
Option A preferred if accepted by CLI: packages/nextjs only + template.json declares no Solidity.
Option B safer for brief wording: packages/hardhat with minimal README/package placeholder, no fake contract dependency.
```

Do not add fake Solidity just to tick a box. If `packages/hardhat` exists, document that HCS is the real Hedera service and Solidity is intentionally not used in Core.

---

## 3. Scoring map — does AgentProof fit?

### 35 pts — ecosystem integration/value

Fit:

```text
Strong enough if positioned as an adapter layer for AI/research/document tools.
Core+ adapters map external tool outputs into Hedera proof events.
```

Concrete integrations/compatibility:

```text
Research Claim Proof     -> OpenResearch / Feynman / GitSearchAI style outputs
AI Decision Proof        -> generic AI agent / multi-agent / 9Router decision logs
Document / Office Proof  -> OfficeCLI/docx/pptx/xlsx/pdf artifacts via file hash
Roadmap Browser Proof    -> Browser Use / Jev Ultrafast / Page Agent / Iris
Roadmap RAG Proof        -> RAGFlow / MemPalace
Roadmap Agent Eval Proof -> iFixAI
Roadmap Watcher Proof    -> FOMO Robinhood Radar / wallet watchers
```

Risk:

```text
If we only say “compatible”, judges may see ecosystem integration as thin.
```

Mitigation:

```text
Make the three Core+ adapters real and visible in UI.
Each adapter must have a typed schema, example payload, normalize/hash step, HCS submit, mirror verify, and README section explaining which tools can feed it.
```

### 30 pts — docs quality

Fit:

```text
Very strong if README is short, exact, and reproducible.
Docs must explain Core vs Core+, HCS-not-database pattern, env setup, doctor, sample run, mirror verification, roadmap adapters.
```

Must include:

```text
Quickstart
What this template is / is not
Core architecture
Proof event schema
Adapter guide
Env setup
Hedera Doctor
Mirror verification
Troubleshooting
Real testnet proof evidence
Fresh scaffold verification log
```

Coding/doc style rule from AMA:

```text
No AI slop.
Short direct docs.
No redundant comments.
No decorative integrations.
```

### 20 pts — code quality

Fit:

```text
Strong if Core is small, typed, tested, and no dead abstractions.
```

Code rules:

```text
DRY but not over-abstracted.
One proof pipeline.
Adapters only transform input -> normalized ProofEvent.
No duplicate hashing helpers.
No long comments explaining obvious code.
No stale TODO spam.
No secrets in frontend.
No .env committed.
Errors must be clear and actionable.
```

### 15 pts — Hedera service depth

Fit:

```text
Strong because HCS is not decorative.
Core product depends on HCS topic messages + Mirror Node verification.
```

Must prove:

```text
HCS topic/message is created or configured.
Proof event hash is submitted to HCS.
Mirror Node reads the topic message.
Local payload hash matches HCS message hash.
UI shows verified proof state.
At least one real testnet transaction/message has public evidence.
```

---

## 4. Final product decision

### Name

```text
AgentProof HBAR
```

### Repo name

```text
hedera-agent-proof-kit
```

### One sentence

```text
AgentProof HBAR is a scaffold-hbar template that lets AI, research, and document workflows hash their important outputs, anchor the proof to HCS, index the payload off-chain, and verify it through Hedera Mirror Node.
```

### What it is

```text
A developer starter template.
A Hedera-native proof/audit layer.
A pattern for “HCS stores proof, app stores data”.
```

### What it is not

```text
Not a database.
Not a full DEX/bridge/lending app.
Not a full x402 payment app.
Not a social scraping tool.
Not a fake multi-integration demo.
```

---

## 5. Core vs Core+

## Core — mandatory, must be perfect

Core is the reusable proof engine:

```text
payload -> normalize -> hash -> HCS -> local index -> Mirror Node verify
```

Core components:

```text
1. ProofEvent schema
2. canonical JSON normalization
3. SHA-256 payload hash
4. HCS submit route/helper
5. Mirror Node topic message reader
6. verifier: local hash == HCS/mirror hash
7. local proof index under .data/proofs.json or data/proofs.json
8. Hedera Doctor CLI/API
9. Control-room UI
10. tests + smoke checks
```

Core acceptance:

```text
Works without .env in demo/local-only mode.
Works with .env in real HCS mode.
Does not expose private keys to frontend.
No committed .env.
Fresh scaffold can install/build/run.
```

## Core+ — working adapters now

These three are real, not roadmap:

```text
1. Research Claim Proof
2. AI Decision Proof
3. Document / Office Proof
```

### 1. Research Claim Proof

Purpose:

```text
Prove that a research claim and its source/evidence bundle existed at a specific time.
```

Input fields:

```text
claim
sources[]
evidenceDigest or evidenceText
model/provider optional
notes optional
```

Output:

```text
normalized ProofEvent type: research_claim
payloadHash
HCS message
mirror verification
local index record
```

Tool synergy:

```text
OpenResearch
Feynman
GitSearchAI
Public APIs
```

### 2. AI Decision Proof

Purpose:

```text
Prove an AI agent decision before it is acted on or rewritten.
```

Input fields:

```text
agentName
decision
reason/evidence
confidence optional
model/provider optional
policyId optional
```

Output:

```text
normalized ProofEvent type: ai_decision
payloadHash
HCS message
mirror verification
local index record
```

Tool synergy:

```text
Oh My Subagents
DeerFlow
Loop Engineering
9Router
iFixAI roadmap
```

### 3. Document / Office Proof

Purpose:

```text
Prove that a file/report/deck/invoice existed in a specific byte state at a specific time.
```

Input fields:

```text
file upload or pasted file metadata
fileName
fileType
fileHash
artifact role: report/deck/invoice/audit/etc.
```

Output:

```text
normalized ProofEvent type: document_artifact
payloadHash and/or fileHash
HCS message
mirror verification
local index record
```

Tool synergy:

```text
OfficeCLI
DOCX/PPTX/XLSX/PDF workflows
hackathon submission packages
legal/audit/report artifacts
```

## Core+ roadmap — not built now, but documented clearly

```text
Browser Action Proof
- Gives browser agents an audit trail for URL/action/result/screenshot hash.
- Tools: Browser Use, Jev Ultrafast, Page Agent, Iris.

Payment Intent Proof
- Logs payer/receiver/asset/amount/policy before money moves.
- Future tools: x402, Blocky402, HBAR/USDC flows.

Watcher / Radar Proof
- Anchors signals from wallet/token/news/watchers.
- Tools: FOMO Robinhood Radar, wallet watchers, price watchers.

RAG / Memory Proof
- Anchors question/answer/chunk hashes.
- Tools: RAGFlow, MemPalace.

Agent Evaluation Proof
- Anchors eval score/report hash before agent gets more autonomy.
- Tools: iFixAI, eval frameworks.
```

Roadmap wording rule:

```text
Do not imply these are fully integrated in MVP.
Say “adapter planned” or “compatible proof schema”.
```

---

## 6. Hedera-specific pitfalls we must avoid

### HCS is not a database

Implementation rule:

```text
HCS stores hash + minimal metadata.
Full payload stays off-chain in local index.
Mirror Node is used to verify proof, not as app database.
```

### ECDSA vs ED25519

Implementation rule:

```text
If key starts with 0x, parse with PrivateKey.fromStringECDSA().
Do not blindly use PrivateKey.fromString() for 0x hex keys.
Doctor must report key type.
```

### Account ID vs EVM address

Implementation rule:

```text
Support 0.0.x account IDs.
If user provides 0x EVM address, resolve via Mirror Node before SDK operations.
```

### Deprecated balance query

Implementation rule:

```text
Do not use AccountBalanceQuery.
Use Mirror Node REST /api/v1/balances?account.id=...
```

### Atomic batch deprecation

Implementation rule:

```text
Do not design around atomic batches containing smart contract calls.
No atomic-batch dependency in Core.
```

### x402 confusion

Implementation rule:

```text
x402/Blocky402 is roadmap/stretch only.
Do not claim x402.org is a Hedera facilitator.
If added later, call it self-hosted Blocky402-compatible facilitator.
```

### Secrets

Implementation rule:

```text
No .env committed.
No private keys in logs.
No private key field sent to browser.
.env.example uses placeholder values only.
Use HEDERA_OPERATOR_KEY, not names with PRIVATE if smoke scanners reject PRIVATE substrings.
```

---

## 7. File/repo plan

Target repo folder after start command:

```text
C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\hedera-agent-proof-kit
```

Expected structure:

```text
hedera-agent-proof-kit/
  README.md
  AGENTS.md
  LICENSE
  template.json
  package.json
  .gitignore
  .env.example
  .harness/
    spec.yaml
    prd.md
    validators/
      static.json
      yarn.json
      playwright-smoke.yaml
    acceptance-contract.json
  packages/
    nextjs/
      package.json
      next.config.*
      src/
        app/
          page.tsx
          proofs/page.tsx
          doctor/page.tsx
          api/
            proof/normalize/route.ts
            proof/submit/route.ts
            proof/verify/route.ts
            doctor/route.ts
        components/
          ProofControlRoom.tsx
          ProofCard.tsx
          AdapterSelector.tsx
          DoctorPanel.tsx
        lib/
          proof/
            schema.ts
            normalize.ts
            hash.ts
            index.ts
            adapters/
              research-claim.ts
              ai-decision.ts
              document-artifact.ts
          hedera/
            client.ts
            hcs.ts
            mirror.ts
            account.ts
            key.ts
            doctor.ts
        scripts/
          doctor.ts
          audit-sample.ts
          verify-sample.ts
        tests/
          proof-normalize.test.ts
          proof-hash.test.ts
          adapters.test.ts
          doctor.test.ts
```

If `packages/hardhat` is required for template shape:

```text
packages/hardhat/
  README.md
  package.json
```

Do not add fake contracts unless we actually use them.

---

## 8. Data saving / local index system

### Goal

Save enough local data to make the proof useful, without pretending HCS is a DB.

### Storage path

Inside scaffolded project:

```text
.data/proofs.json
```

Template `.gitignore` must include:

```text
.data/
.env
.env.local
```

### Record shape

```ts
type LocalProofRecord = {
  localId: string
  type: 'research_claim' | 'ai_decision' | 'document_artifact'
  title: string
  payload: unknown
  payloadHash: string
  canonicalJson: string
  status: 'local' | 'submitted' | 'verified' | 'failed'
  createdAt: string
  submittedAt?: string
  verifiedAt?: string
  hcs?: {
    network: 'testnet'
    topicId: string
    transactionId?: string
    sequenceNumber?: number
    consensusTimestamp?: string
    mirrorUrl?: string
    hashscanUrl?: string
  }
  error?: string
}
```

### Save events

Save after every state transition:

```text
local created
submitted to HCS
mirror verified
verification failed
```

### Description of saves for users

README wording:

```text
AgentProof stores full payloads only in the local `.data/proofs.json` index.
HCS receives only the proof hash and minimal metadata.
Delete `.data/` when you want to reset local demo state.
Do not commit `.data/` if it contains private payloads.
```

### UI states

```text
Local only       — payload was normalized and hashed, not on HCS yet.
Submitted        — HCS accepted message, waiting for Mirror Node.
Verified         — Mirror Node message hash matches local payload hash.
Failed           — submit/verify failed; show actionable error.
Demo mode        — no Hedera credentials, local hash/index only.
```

---

## 9. Implementation tasks after user says start

### Task 1: Create template repo skeleton

**Objective:** create `hedera-agent-proof-kit` with template-required files and workspace layout.

**Files:**

```text
Create: hedera-agent-proof-kit/package.json
Create: hedera-agent-proof-kit/template.json
Create: hedera-agent-proof-kit/README.md
Create: hedera-agent-proof-kit/AGENTS.md
Create: hedera-agent-proof-kit/LICENSE
Create: hedera-agent-proof-kit/.gitignore
Create: hedera-agent-proof-kit/.env.example
Create: hedera-agent-proof-kit/packages/nextjs/package.json
```

**Validation:**

```bash
npm install
npm run lint
npm run build
```

### Task 2: Build proof schema and hashing tests first

**Objective:** deterministic canonicalization and hash must be stable.

**Files:**

```text
Create: packages/nextjs/src/lib/proof/schema.ts
Create: packages/nextjs/src/lib/proof/normalize.ts
Create: packages/nextjs/src/lib/proof/hash.ts
Create: packages/nextjs/src/lib/proof/adapters/research-claim.ts
Create: packages/nextjs/src/lib/proof/adapters/ai-decision.ts
Create: packages/nextjs/src/lib/proof/adapters/document-artifact.ts
Create: packages/nextjs/src/lib/proof/__tests__/proof-normalize.test.ts
Create: packages/nextjs/src/lib/proof/__tests__/proof-hash.test.ts
Create: packages/nextjs/src/lib/proof/__tests__/adapters.test.ts
```

**Validation:**

```bash
npm run test
```

Expected:

```text
canonical JSON stable regardless of input key order
same payload -> same hash
changed payload -> different hash
three adapters output valid ProofEvent
```

### Task 3: Build local index

**Objective:** save proof records and state transitions locally.

**Files:**

```text
Create: packages/nextjs/src/lib/proof/index.ts
Create: packages/nextjs/src/app/api/proofs/route.ts
```

**Validation:**

```bash
npm run test
curl http://localhost:3000/api/proofs
```

Expected:

```text
returns [] if no data file
creates .data/proofs.json only after proof save
never commits .data/
```

### Task 4: Build Hedera helpers and doctor

**Objective:** make setup problems visible before users try a transaction.

**Files:**

```text
Create: packages/nextjs/src/lib/hedera/key.ts
Create: packages/nextjs/src/lib/hedera/account.ts
Create: packages/nextjs/src/lib/hedera/mirror.ts
Create: packages/nextjs/src/lib/hedera/client.ts
Create: packages/nextjs/src/lib/hedera/doctor.ts
Create: packages/nextjs/src/app/api/doctor/route.ts
Create: packages/nextjs/scripts/doctor.ts
```

**Validation:**

```bash
npm run doctor
```

Expected with no `.env.local`:

```text
Demo mode allowed.
Missing HEDERA_OPERATOR_ID/HEDERA_OPERATOR_KEY reported as setupRequired, not crash.
Mirror Node reachable check still runs.
```

Expected with env:

```text
network OK
operator ID OK
key format OK
balance read via mirror OK
HCS topic present or creatable
```

### Task 5: Build HCS submit and mirror verify

**Objective:** real Hedera proof lifecycle.

**Files:**

```text
Create: packages/nextjs/src/lib/hedera/hcs.ts
Create: packages/nextjs/src/app/api/proof/submit/route.ts
Create: packages/nextjs/src/app/api/proof/verify/route.ts
Create: packages/nextjs/scripts/audit-sample.ts
Create: packages/nextjs/scripts/verify-sample.ts
```

**Validation:**

```bash
npm run audit:sample
npm run verify:sample
```

Expected:

```text
sample proof submitted to HCS testnet
local index updated to submitted
mirror node returns matching message
local index updated to verified
Hashscan/mirror URL printed
```

### Task 6: Build UI

**Objective:** judge/dev can see the whole flow without reading code.

**Files:**

```text
Create: packages/nextjs/src/components/AdapterSelector.tsx
Create: packages/nextjs/src/components/ProofControlRoom.tsx
Create: packages/nextjs/src/components/ProofCard.tsx
Create: packages/nextjs/src/components/DoctorPanel.tsx
Create: packages/nextjs/src/app/page.tsx
Create: packages/nextjs/src/app/proofs/page.tsx
Create: packages/nextjs/src/app/doctor/page.tsx
```

**UI must show:**

```text
Core flow: normalize -> hash -> HCS -> mirror verify
Adapter tabs: Research Claim, AI Decision, Document / Office
Status: Demo / Local / Submitted / Verified / Failed
HCS topic, sequence, timestamp, hash, mirror/hashscan link
```

**Validation:**

```bash
npm run dev
```

Manual checks:

```text
/ loads
/doctor loads
/proofs loads
No console errors
No broken buttons
Can create local proof without credentials
Can submit+verify with credentials
```

### Task 7: Add docs

**Objective:** pass docs scoring and avoid AI slop.

**Files:**

```text
Modify: README.md
Modify: AGENTS.md
Create: docs/architecture.md
Create: docs/adapters.md
Create: docs/troubleshooting.md
Create: docs/verification.md
```

**README sections:**

```text
What this is
Quickstart
Core vs Core+
Env setup
Hedera Doctor
HCS proof model
Run a sample proof
Verify from Mirror Node
Working adapters
Roadmap adapters
Troubleshooting
Submission evidence
```

**AGENTS.md must tell coding agents:**

```text
Do not store raw secrets.
Do not treat HCS as DB.
Keep adapters input -> ProofEvent only.
Run lint/test/build before claiming done.
Use Mirror Node for reads.
Do not add heavy external tool dependencies without reason.
```

### Task 8: Add Harness validators optional but useful

**Objective:** show we used Hedera’s own validation style.

**Files:**

```text
Create: .harness/spec.yaml
Create: .harness/prd.md
Create: .harness/validators/static.json
Create: .harness/validators/yarn.json
Create: .harness/validators/playwright-smoke.yaml
Create: .harness/acceptance-contract.json
```

**Validation:**

```bash
npx hedera-harness doctor .harness/spec.yaml
npx hedera-harness validate .harness/spec.yaml
```

Only include chainValidation if credentials are ready and stable.

### Task 9: Fresh scaffold self-check

**Objective:** prove the actual bounty command works.

**Commands:**

```bash
mkdir -p C:/Users/azi/Documents/prro_grams/hackaton-now/hedera-bounty/_scaffold-tests
cd C:/Users/azi/Documents/prro_grams/hackaton-now/hedera-bounty/_scaffold-tests
npx create-scaffold-hbar@latest --template yomek/hedera-agent-proof-kit
cd <generated-app>
npm install
npm run doctor
npm run test
npm run lint
npm run build
npm run dev
```

Also test official form:

```bash
npm create scaffold-hbar@latest -- --template yomek/hedera-agent-proof-kit
```

### Task 10: Real testnet evidence

**Objective:** have judge-visible proof.

Need save in docs:

```text
HCS topic ID
sample proof local ID
payload hash
sequence number
consensus timestamp
mirror node URL
Hashscan URL if applicable
command used to reproduce
```

Do not save private key or `.env.local`.

### Task 11: External review before submission

**Objective:** inspect as if judge/dev opened it cold.

Reviewer checklist:

```text
Can I understand what this template does in 30 seconds?
Can I scaffold it with one command?
Can I run without credentials in demo mode?
Can I run with credentials and create real HCS proof?
Does README explain HCS is not a database?
Do the three Core+ adapters feel real, not decorative?
Is roadmap honest about not-yet-built adapters?
Are tests/build green?
Are there no secrets?
Is there any AI slop or huge filler text?
```

---

## 10. Test matrix

### Static gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

### Route smoke

```bash
curl -s http://localhost:3000/api/doctor
curl -s http://localhost:3000/api/proofs
```

### UI smoke

Use Playwright or browser manual:

```text
/ renders Control room
/doctor renders setup checks
/proofs renders index
adapter tabs switch
local proof can be created
error states are human-readable
```

### On-chain smoke

```bash
npm run doctor
npm run audit:sample
npm run verify:sample
```

Expected:

```text
HCS submit succeeds
mirror node sees message after delay/retry
verification status = verified
```

### Fresh scaffold smoke

```bash
npx create-scaffold-hbar@latest --template yomek/hedera-agent-proof-kit
npm install
npm run build
npm run dev
```

### Secret scan

```bash
git status --short
grep -RIn "PRIVATE\|sk-or-\|TEST_API_KEY\|BEGIN .*PRIVATE\|0x[a-fA-F0-9]\{64\}" README.md AGENTS.md docs packages template.json .env.example || true
```

Expected:

```text
No real secrets.
Only placeholder examples in .env.example.
No .env/.data committed.
```

---

## 11. Submission checklist

```text
[ ] Public GitHub repo
[ ] MIT license
[ ] template.json valid
[ ] README.md clear and short
[ ] AGENTS.md clear
[ ] packages/ monorepo layout
[ ] npm create scaffold-hbar command works
[ ] npx create-scaffold-hbar command works
[ ] install passes
[ ] lint passes
[ ] typecheck passes
[ ] tests pass
[ ] build passes
[ ] app boots
[ ] core routes return OK
[ ] HCS submit works with testnet account
[ ] Mirror verification works
[ ] one real testnet proof link saved
[ ] no .env committed
[ ] no secrets committed
[ ] docs explain Core/Core+/roadmap honestly
[ ] docs mention HCS-not-database pattern
[ ] demo video recorded
[ ] submission form filled
[ ] optional .harness validators pass if included
```

---

## 12. Risk control / scope guard

Hard rules:

```text
Do not start DEX/bridge/lending.
Do not build full x402 payment flow in Core.
Do not integrate Browser Use/RAGFlow/OfficeCLI/iFixAI as heavy dependencies now.
Do not add smart contracts unless there is a real reason.
Do not claim roadmap adapters are working.
Do not commit .env or .data.
Do not leave synthetic UI if backend path exists separately.
```

If time is short, cut in this order:

```text
1. Cut Harness validators first.
2. Cut /proofs page polish.
3. Cut roadmap adapter docs detail.
4. Keep Core and three Core+ adapters no matter what.
```

Do not cut:

```text
template.json
README
AGENTS.md
HCS submit
Mirror verify
fresh scaffold test
real testnet proof
```

---

## 13. Outside-view review

### Does it satisfy contest conditions?

Yes, if implemented as above:

```text
One public repo: yes.
Scaffold-hbar template: yes.
One-command scaffold: yes, must test.
Real Hedera service: yes, HCS.
Verifiable testnet transaction: yes, HCS message + mirror/hashscan evidence.
Docs: strong, if kept concise.
Code quality: strong, if small typed core + tests.
Ecosystem integration: acceptable/strong because Core+ adapters connect AI/research/document tools to Hedera proofs.
```

### Biggest weakness

```text
No deep DEX/oracle/bridge integration.
```

Why acceptable:

```text
The bounty examples are not mandatory.
The scoring says ecosystem integration/value, not “must use DeFi”.
Our integration value is making external AI/research/document tools auditable through Hedera.
```

Mitigation:

```text
Make tool-adapter story explicit in README and UI.
Make Research/AI/Document adapters actually work end-to-end.
Show real HCS verification in video.
```

### Final verdict

```text
Plan is coherent and fits the bounty.
Do not expand scope before Core is green.
Start development only after explicit user command.
```
