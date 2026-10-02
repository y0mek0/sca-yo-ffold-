# Show Dashboard Proof Flow Plan

> **For Hermes:** Use this plan to implement and verify the public demo flow inside `show-dashboard/`.

**Goal:** Make the demo clearly show what Tracemark reads, what it normalizes, what it hashes, what it writes to Hedera, and how the public proof is verified.

**Architecture:** Keep the existing single Electron control room and the current post-`go` flow. The Action Console narrates the story, Deployment proves the local environment is ready, Proof shows the technical pipeline, Proof activity summarizes records, and the embedded HashScan webview shows the latest public transaction. Do not open external browsers or add another Electron window.

**Tech Stack:** Electron, Node.js, node-pty, local HTTP server, Hedera HCS, Mirror Node, embedded Electron `<webview>`, existing `show-dashboard/` copy.

---

## Exact demo narrative

The demo is not a generic list of all professions. It shows the same proof layer through two concrete stories, in this order:

### Story 1: Non-Web3 — DevOps / SRE

Show a **Release Safety Gate**:

```text
GitHub release + critical issues + security notes
→ deployment analysis
→ DEPLOY or BLOCK decision
→ AI Decision proof
→ SHA-256
→ HCS
→ Mirror verification
```

The viewer must understand the practical meaning first: Tracemark records what the engineering system saw, which deployment decision was made, and when. It does not claim that the release was objectively safe; it proves the inputs and decision that were recorded.

### Story 2: Web3 — Protocol researcher / crypto data analyst

Then show a **Protocol Health Dashboard**:

```text
HBAR price + SaucerSwap pool + HTS token/treasury state + GitHub activity
→ protocol report
→ Research Claim proof
→ SHA-256
→ HCS
→ Mirror verification
```

The viewer must see that the Web3 version uses different adapters and public data sources, but the proof architecture is unchanged. It records the market/protocol state observed at a specific time; it does not claim that the market data was true or that a trade would be profitable.

### Final explanation

After both stories, explicitly explain the common architecture:

```text
Different source and adapter
→ same normalized proof event
→ same SHA-256 fingerprint
→ same Hedera HCS proof
→ same Mirror Node check
```

The full payload stays off-chain. Hedera receives only the compact digest and minimal metadata. The Mirror Node confirms that the digest read back from Hedera matches the local digest.

---

## 1. Pre-run presentation

### Objective

Ensure the viewer understands the product before any transaction begins.

### Existing screens to preserve

1. `THE PRODUCT`
   - One serif headline.
   - One unified explanatory body.
   - No extra `Flow` block.

2. `WHO USES IT`
   - One headline.
   - Two-column profession/use-case grid.
   - Core+ adapters and typed factories below the grid.

3. `THIS CONTROL ROOM`
   - One headline.
   - Two-column dashboard map.
   - Flow explanation stays integrated with `Proof`, not as a detached module.

### Acceptance criteria

- `Next` has the same `top` and `bottom` coordinates on slides 1, 2, and 3.
- `Review again` returns to slide 1.
- No overlap, clipping, scrolling, or old `complete`/`Current step` UI.
- The intro does not execute HCS or payment transactions.

---

## 2. Start command and visible story

### Objective

Make the one user action obvious and show the complete run in a predictable sequence.

### User action

The operator enters:

```text
go
```

in the Action Console terminal.

### Action Console must show

1. The run has started.
2. The source or external action being processed.
3. The normalized event type.
4. The digest being calculated.
5. The HCS submission beginning.
6. The Mirror verification beginning.
7. The final verification result.

The console should use large, readable English commentary with clear stages:

```text
READ
NORMALIZE
HASH
WRITE TO HCS
VERIFY
RESULT
```

Do not expose credentials, private keys, tokens, connection strings, or environment values. Replace sensitive values with `[REDACTED]`.

---

## 3. Deployment panel

### Objective

Prove that the local demo environment is running without distracting from the proof.

### Deployment output

Show only technical readiness information:

```text
Next.js dev server runs hidden in the background.
GET http://localhost:3000/api/doctor -> 200 OK
TEMPLATE y0mek0/tracemark
PROCESS next dev / local app / API doctor
```

### Acceptance criteria

- No external Chrome, Edge, or Opera opens.
- `dashboard.html` is not opened after `go`.
- The local server remains hidden and the panel stays inside Electron.

---

## 4. Normalize the source event

### Objective

Show the transformation from an external observation or action into a deterministic Tracemark record.

### Data shown in Proof

Display a compact safe summary, not the full private payload:

```text
SOURCE        [source name]
EVENT TYPE    [typed factory / adapter]
RECORDED AT   [timestamp]
PAYLOAD       [private payload]
```

The UI should explain that the original payload remains private while the proof contains the normalized record needed for verification.

### Typed event examples

Use the existing README-backed vocabulary where applicable:

- Research Claim
- AI Decision
- Document / Office
- Browser Action
- Payment Intent
- Watcher Signal
- RAG Memory

Do not invent a new event type only for the presentation.

---

## 5. Create and display the SHA-256 fingerprint

### Objective

Make the digest step understandable to an external viewer.

### Proof output

Show:

```text
NORMALIZED RECORD READY
SHA-256 DIGEST CREATED
DIGEST: [safe abbreviated digest]
```

The full digest may be shown in the terminal if readable, but the dashboard summary should remain compact.

### Verification rule

The same normalized record must produce the same digest before and after the HCS round trip. Do not claim a match unless the code compares the values.

---

## 6. Publish the compact proof to Hedera HCS

### Objective

Show exactly what is published and distinguish it from the private payload.

### HCS message content

The HCS message should contain the compact public proof required by the existing implementation, including the digest and safe metadata. It must not contain secrets or unnecessary private payload data.

### Proof terminal output

Show:

```text
WRITE TO HCS
TOPIC: [topic id]
TRANSACTION: [transaction id]
SEQUENCE: [sequence number]
STATUS: SUBMITTED
```

The existing real HCS transaction behavior must remain unchanged. The plan does not authorize fake hashes, fake transaction IDs, or local proof substitutes.

---

## 7. Read back through the Mirror Node

### Objective

Prove the public record can be checked independently after publication.

### Proof terminal output

Show the actual read-back sequence:

```text
MIRROR NODE READ
MESSAGE FOUND
DIGEST FROM HEDERA: [digest]
LOCAL DIGEST: [digest]
HASH MATCH YES
```

Only show `HASH MATCH YES` after a real comparison succeeds.

### Failure behavior

If Mirror Node verification fails, show an explicit failure state and stop the success narration. Do not continue to a success claim after a failed read-back.

---

## 8. Proof activity dashboard

### Objective

Give the audience a compact summary without duplicating the terminal output.

### Activity stages

The activity panel should update in this order:

```text
read → normalize → hash → write to HCS → check
```

For each created record, show a compact safe row containing:

- record type;
- short title or event name;
- status;
- sequence number or public reference when available.

Keep private payload content out of this panel.

---

## 9. Embedded HashScan evidence

### Objective

Let the viewer inspect the latest public Hedera transaction in the same Electron window.

### Behavior

1. After a successful HCS submission, obtain the real HashScan transaction URL.
2. Send that URL to the renderer.
3. Navigate the existing `#hashscan-view` webview to the latest URL.
4. Keep the webview embedded in the evidence column.
5. Do not use `target="_blank"`, popup windows, or `proof-viewer.html` as a replacement.

### Acceptance criteria

- Only the latest transaction is displayed.
- The HashScan URL is real and corresponds to the proof shown in the current run.
- No external browser process is opened by the demo.

---

## 10. End state shown to the audience

### Successful result

The final visible state should make this chain obvious:

```text
external source or action
→ normalized record
→ SHA-256 digest
→ HCS public proof
→ Mirror Node read-back
→ HASH MATCH YES
→ latest transaction in embedded HashScan
```

The final commentary should explain what was proven:

```text
Tracemark recorded what the system saw, created a deterministic fingerprint,
published the compact proof to Hedera, and verified the same proof through
the Mirror Node.
```

Do not claim that Hedera proves the external source was truthful. It proves what was recorded and when, and that the recorded digest was not changed after publication.

---

## 11. Files likely to change

- Modify: `show-dashboard/electron-shell.html`
  - Only layout or visible labels needed for the presentation.
- Modify: `show-dashboard/electron-renderer.js`
  - Intro navigation, activity rendering, and embedded HashScan URL handling if needed.
- Modify: `show-dashboard/electron-main.cjs`
  - Only IPC or webview lifecycle changes required for the single-window flow.
- Modify: `show-dashboard/orchestrator.js`
  - Only if the displayed proof stages do not reflect the existing real HCS/Mirror flow.
- Modify: `show-dashboard/panels.js`
  - Commentary, Deployment, and Proof terminal text.
- Test: `show-dashboard/tests/demo.test.js`
  - Add assertions for stage order, safe output, and successful state transitions.

Do not copy `node_modules/`, `runtime/`, `recordings/`, debug logs, or local credentials into the project.

---

## 12. Verification plan

### Static checks

Run from the repository root:

```bash
npm run check
node --check show-dashboard/electron-main.cjs
node --check show-dashboard/electron-preload.cjs
node --check show-dashboard/electron-renderer.js
node --check show-dashboard/orchestrator.js
node --check show-dashboard/panels.js
```

### Intro interaction checks

Using the real Electron window:

1. Capture slide 1 screenshot.
2. Click `Next`; capture slide 2.
3. Click `Next`; capture slide 3.
4. Confirm navigation coordinates are identical.
5. Click `Review again`; confirm return to slide 1.
6. Confirm the Action Console input is still available.

### Real flow checks

1. Launch `show-dashboard/run-control-room.bat`.
2. Enter `go` once.
3. Confirm all three terminals update.
4. Confirm activity stages update in order.
5. Confirm a real Hedera transaction ID and sequence appear.
6. Confirm Mirror Node read-back and digest comparison.
7. Confirm `HASH MATCH YES` only after comparison.
8. Confirm the embedded HashScan webview navigates to the latest transaction.
9. Check `runtime/electron-debug.log` for renderer, webview, or unexpected browser errors.
10. Stop and clean up all demo processes.

### Final acceptance criteria

- The audience can understand what was read, written, and verified without reading source code.
- The visible proof is backed by a real HCS transaction and Mirror Node response.
- The original payload remains private.
- No secrets appear in the UI, logs, screenshots, or committed files.
- The demo remains a single Electron window with embedded HashScan.

---

## 13. Staged development and review loop

Do not build both stories at once. Finish and verify each stage before moving to the next one.

### Stage A — Non-Web3 story

Build only the DevOps / SRE Release Safety Gate flow first. Keep the Web3 story disabled or out of the visible path while this stage is being tuned.

**Transition copy for the Action Console:**

```text
First, we will use Tracemark for a DevOps release decision.
We will read the release and its open issues, then record the decision and verify the proof.
```

After the DevOps proof finishes:

```text
The release inputs and deployment decision are now recorded and publicly verifiable.
We will pause here before switching to a different kind of workflow.
```

Checkpoint:

- intro → Action Console → Deployment → Proof → activity → HashScan;
- release/issues input is real or clearly identified as the selected demo fixture;
- `DEPLOY` or `BLOCK` decision is visible;
- HCS transaction and Mirror verification are real;
- screenshots and logs are captured;
- all processes cleanly stop after the run.

### Pause A

Do a visual and technical review before starting Web3. Compare the first stage against the fixed Tracemark style:

- same panel roles;
- same typography hierarchy;
- short commentary;
- no extra slogans;
- no unexplained technical output;
- no fake success state.

### Stage B — Web3 story

Add the Protocol Health Dashboard flow using the public HBAR, SaucerSwap, HTS, and GitHub sources described in `docs/USE_CASES.md`.

**Transition copy for the Action Console:**

```text
Now we will use the same proof layer for a Web3 protocol snapshot.
The sources change — market, token, treasury, and development data — but the proof path stays the same.
```

After the Web3 proof finishes:

```text
The protocol snapshot is recorded and verified.
The point is not to claim that the market was right; it is to show exactly what data was observed and when.
```

Checkpoint:

- the viewer sees the protocol inputs;
- the report or Research Claim is understandable;
- the same proof stages run;
- the HCS/Mirror result belongs to the Web3 record;
- HashScan points to the latest transaction from this stage;
- no Stage A behavior regresses.

### Pause B

Run the Web3 flow independently, then compare its panel geometry, commentary length, and final state with Stage A. Fix differences in the shared components rather than creating one-off styling.

### Stage C — Final film

Connect the stages into one polished presentation:

```text
intro
→ short pause
→ Non-Web3 story
→ short pause
→ Web3 story
→ shared architecture explanation
→ final proof and HashScan
```

The pauses must be intentional and visible, not arbitrary sleeps. Use a short on-screen transition or a stable waiting state so the audience can understand that the scenario changed.

---

## 14. What can go wrong and how to catch it

### UI and layout risks

- A longer scenario pushes the navigation or terminal panels.
- A panel changes height between stages.
- Commentary becomes too long to read during the live run.
- Text styles diverge between Non-Web3 and Web3 screens.
- HashScan or evidence content visually dominates the explanation.
- The final state remains stale from the previous scenario.

Detection:

- screenshot every stage;
- measure panel and navigation bounding boxes;
- compare coordinates between Stage A and Stage B;
- assert no document overflow or clipped active content;
- inspect the Electron window, not only static HTML preview.

### Runtime and synchronization risks

- A PTY panel starts late or exits without updating the UI.
- Action Console output arrives before the corresponding dashboard state.
- A timer or process from Stage A writes into Stage B.
- The intro listener or IPC bridge fails and the flow continues silently.
- The launcher exits with code 0 while Electron has already crashed.

Detection:

- wait for explicit readiness markers, not arbitrary sleeps;
- check panel process IDs and exit codes;
- inspect `runtime/electron-debug.log` after every clean run;
- verify renderer console errors are empty;
- verify the visible stage matches the latest orchestrator state.

### Proof and Hedera risks

- The displayed hash is not the hash that was published.
- The displayed transaction ID belongs to an earlier run.
- Mirror Node is delayed or returns a different sequence.
- HashScan opens a stale transaction.
- A payment or HCS write is attempted before the viewer is ready.
- A failure is visually presented as success.

Detection:

- correlate local digest, HCS message, sequence, transaction ID, Mirror response, and HashScan URL;
- show success only after the real Mirror comparison;
- preserve a clear failure state;
- never fabricate fallback transaction data;
- do not start real writes during intro or layout-only checks.

### Safety and secrecy risks

- `.env.local`, keys, tokens, or connection strings enter the copied demo folder.
- Debug logs reveal secrets or private payloads.
- Full source documents are shown where only a proof summary is needed.

Detection:

- scan copied and committed files before each final run;
- redact sensitive values as `[REDACTED]`;
- keep runtime state and recordings outside the committed demo folder;
- verify HCS receives only the compact proof and minimal metadata.

---

## 15. Fix loop for every discovered issue

For each issue:

1. Reproduce it in the smallest affected stage.
2. Capture screenshot, console output, and relevant runtime log lines.
3. Identify whether the cause is layout, renderer state, IPC, orchestrator timing, or Hedera verification.
4. Fix the shared layer where possible; avoid scenario-specific hacks.
5. Run static checks.
6. Re-run the affected stage.
7. Re-run the previous stage to catch regressions.
8. Re-run the complete film only after both isolated stages pass.
9. Record the exact evidence: screenshot, transaction ID, sequence, Mirror result, and cleanup status.

The final claim must be based on this evidence, not only on a successful launcher exit code.
