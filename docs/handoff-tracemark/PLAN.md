# Continuation Plan After Handoff

## Phase 0 — Safe repository handoff

- Add `show-dashboard/.gitignore` for `node_modules/`, `runtime/`, and `recordings/`.
- Keep this handoff folder as the only detailed continuation documentation.
- Commit the current state with an honest error-focused message.
- Do not commit secrets or generated proof artifacts.

## Phase 1 — Observe the actual UI before editing

1. Stop stale Electron/demo processes carefully.
2. Launch the exact `show-dashboard/run-control-room.bat`.
3. Inspect the native window at its real viewport.
4. Record the visible Action Console startup text.
5. Enter `go` once.
6. Capture the Action Console, Deployment, Proof, Proof activity, and HashScan state at:
   - DevOps transition;
   - first DevOps record;
   - DevOps verified;
   - pause;
   - Web3 transition;
   - first Web3 record;
   - final state.
7. Save screenshots outside the committed source or in a separately ignored evidence directory.

## Phase 2 — Implement audience state rendering

### Files

- `show-dashboard/electron-shell.html`
- `show-dashboard/electron-renderer.js`
- `show-dashboard/panels.js`
- `show-dashboard/orchestrator.js` only if state fields are insufficient

### Required renderer behavior

Create a single shared mapping from state to visible audience copy:

```text
waiting
intro
local-app
scenario-transition/devops
action/devops
submitted/devops
verified/devops
scenario-complete/devops
scenario-transition/web3
action/web3
submitted/web3
verified/web3
scenario-complete/web3
infographic/final
complete
error
```

Render, at minimum:

- active scenario label;
- short human explanation;
- current record source;
- current proof stage;
- progress through the current scenario;
- latest verified sequence;
- latest HashScan transaction;
- explicit failure text when verification fails.

Do not put all narration into the static HTML. Keep the style/layout static and the stage-specific text in one renderer mapping so both scenarios remain consistent.

## Phase 3 — Fix Proof activity

Replace repeated generic rows with a stateful activity block:

```text
PROOF ACTIVITY
What this run has recorded

SCENARIO
DevOps / SRE — Release Safety Gate

CURRENT RECORD
GitHub release

STAGE
read → normalize → hash → write to HCS → check

NETWORK
Hedera testnet

RESULT
sequence 92 · HASH MATCH YES
```

For Web3, the scenario and current record must change. Do not show `4 records` when the current real run can produce five or more proofs; use a dynamic count or a scenario-specific count.

## Phase 4 — Synchronize transitions

Use the orchestrator state as the source of truth. The visible Action Console, Proof activity, and terminal must update from the same state transition.

A transition is complete only when:

- Action Console names the scenario;
- Proof activity names the same scenario;
- Proof terminal shows the same source;
- HashScan changes only after a verified proof;
- the pause state is visibly readable;
- no stale previous scenario remains on screen.

## Phase 5 — Visual and runtime verification

Run in this order:

```bash
node --test show-dashboard/tests/demo.test.js
node --check show-dashboard/electron-main.cjs
node --check show-dashboard/electron-preload.cjs
node --check show-dashboard/electron-renderer.js
node --check show-dashboard/orchestrator.js
node --check show-dashboard/panels.js
npm test
```

Then run the exact launcher and verify the native window. Tests alone are insufficient.

## Phase 6 — Real proof verification

Only after the visible flow is correct:

1. Run `go` once.
2. Correlate source, normalized event, digest, HCS sequence, Mirror digest, and HashScan URL.
3. Confirm every displayed success has `hashMatch === true`.
4. Confirm no fake fallback data appears.
5. Cleanly stop all demo processes.
6. Keep runtime/recordings ignored.

## Phase 7 — Final film

The final film is:

```text
intro
→ go
→ DevOps explanation
→ DevOps real proof
→ readable pause
→ Web3 explanation
→ Web3 real proof
→ shared architecture explanation
→ final HashScan evidence
```

Do not add payment to this film unless separately approved. Payment is a valid repository capability but is not required to explain the two selected scenarios and would add unnecessary noise.
