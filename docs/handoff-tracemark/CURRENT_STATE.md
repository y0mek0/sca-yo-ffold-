# Current State and Exact Stop Point

## What is committed to the working tree right now

The repository has these current categories of changes:

- existing Tracemark application changes in `packages/nextjs/`;
- a new `show-dashboard/` runnable Electron copy;
- a saved implementation plan under `.hermes/plans/`;
- this handoff folder.

The working tree was not clean before this handoff. The final commit must explicitly describe the current visible-flow defect and must not include generated runtime evidence or dependencies.

## `show-dashboard/` contents

The intended source files are:

- `electron-main.cjs` — one Electron BrowserWindow, PTY wiring, lifecycle, embedded webview support;
- `electron-preload.cjs` — renderer IPC bridge;
- `electron-shell.html` — control-room layout, intro slides, terminal areas, Proof activity area, embedded HashScan webview;
- `electron-renderer.js` — terminal rendering, state rendering, intro navigation, HashScan URL switching;
- `panels.js` — Action Console, Deployment, and Proof panel processes;
- `orchestrator.js` — local readiness, scenario sequencing, real adapters, HCS writes, Mirror checks, HashScan URL state;
- `document-proof.cjs` — document proof helper retained by the demo kit;
- `serve-demo.cjs` — local static server;
- `infographic-template.html`, `infographic.html`, `dashboard.html`, `proof-viewer.html` — existing supporting artifacts;
- `run-control-room.bat` — exact launcher;
- `tests/demo.test.js` — demo-kit static/regression tests;
- `package.json` and `package-lock.json` — shell dependencies.

Generated and local-only directories must stay uncommitted:

- `show-dashboard/node_modules/`;
- `show-dashboard/runtime/`;
- `show-dashboard/recordings/`.

## Current real-run evidence

A direct orchestrator run completed with:

```text
stage=complete
status=complete
```

The latest successful run recorded and Mirror-verified five real Hedera testnet proofs:

```text
GITHUB RELEASE   sequence 92  HASH MATCH true
GITHUB ISSUES    sequence 94  HASH MATCH true
HBAR PRICE       sequence 96  HASH MATCH true
SAUCERSWAP POOL  sequence 97  HASH MATCH true
HTS TREASURY     sequence 98  HASH MATCH true
```

The latest direct adapter test also produced sequence `89` for `hashgraph/hedera-services`. Do not treat any sequence as a permanent product fact; it is evidence from this working session only.

## Why the DevOps repository is `hashgraph/hedera-services`

The initial implementation used `y0mek0/tracemark`, but its GitHub releases endpoint returned a real `404`. The Release Safety Gate needs a public repository with releases and issues, so the scenario was changed to `hashgraph/hedera-services`. That is a valid public source for the demo and keeps the DevOps story relevant to Hedera.

## Checks already passing

Latest successful checks before this handoff:

```text
show-dashboard tests: 8 passed / 0 failed
main project tests:   91 passed / 0 failed
node --check for changed JavaScript: passed
```

These checks prove source/test consistency, not audience-ready visual behavior.

## What is not yet proven

- The exact user-facing Electron window after `go` has not been adequately inspected for scenario narration.
- Proof activity does not yet visibly present a clean stage-specific story.
- The lower UI currently risks showing repeated generic text instead of explaining the active DevOps/Web3 phase.
- The Action Console terminal and the dashboard state are not yet synchronized as a polished film.
- No final screenshot set exists for intro, DevOps transition, DevOps proof, Web3 transition, Web3 proof, and final comparison.

## Immediate next action

Do not add more backend adapters first. Launch the exact `show-dashboard/run-control-room.bat`, inspect the native window, type `go`, capture the actual three panel outputs and state changes, then implement the missing visible narration and activity rendering.
