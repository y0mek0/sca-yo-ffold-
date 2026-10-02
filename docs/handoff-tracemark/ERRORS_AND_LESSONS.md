# Errors, Missteps, and Lessons

## Active defect — visible scenario narration is missing

### User report

After launching and pressing `go`:

- the first window did not clearly say what the audience would see next;
- the lower blocks showed repetitive, generic text;
- the result did not feel like a coherent scenario film.

### Likely technical cause

The orchestrator writes scenario fields and terminal panels print some transition lines, but `electron-renderer.js` only renders generic status, record rows, and HashScan URL. It does not render a structured scenario narrative or a live Proof activity model from `state.scenario`, `state.active`, `state.comment`, and stage fields.

The next implementation must fix the renderer and visible HTML together, then inspect the actual Electron window. Do not solve this only by adding more backend comments.

## Context drift failure

A large context compaction occurred earlier. The assistant then over-trusted backend test results and claimed audience readiness without verifying the exact native window after `go`.

Lesson: after any compaction or handoff, inspect the original files and run the exact launcher before claiming the visible flow works.

## Wrong scope of verification

The orchestrator completed real HCS/Mirror records, but that did not prove the film was understandable. Backend correctness and audience-facing correctness are separate gates.

Required gates:

1. static/syntax;
2. unit/demo tests;
3. real HCS/Mirror correlation;
4. native Electron window;
5. exact `go` interaction;
6. screenshots and geometry;
7. cleanup and final report.

## Incomplete initial copy

The first `show-dashboard` copy omitted `document-proof.cjs` and `infographic-template.html`, even though `orchestrator.js` referenced them. They were added later.

Lesson: when copying a runnable kit, use the exact launcher/test dependency graph, not a guessed list of top-level files.

## Stale copied tests

The copied `tests/demo.test.js` looked for old files:

- `tracemark-demo.js`;
- `run-demo.bat`;
- `run-three-panel.bat`;
- the old SaucerSwap-only flow.

The tests were rewritten for the current Electron kit and two-scenario orchestrator. Current demo tests pass, but they are static/regression tests and do not replace native visual QA.

## Invalid repository source

`y0mek0/tracemark` returned a real GitHub release `404`. The DevOps scenario was changed to `hashgraph/hedera-services`, which has real releases and issues.

Lesson: test every live external source before hardcoding it into a real demo.

## Hidden orchestrator failure

`runProof()` initially threw only `GITHUB RELEASE command failed`, hiding useful adapter output. Error details were expanded to include status and the last safe command output.

Lesson: never hide the reason for a real adapter failure during development.

## Side effects and artifacts

The real run created:

- `show-dashboard/runtime/`;
- `show-dashboard/recordings/`;
- local `show-dashboard/node_modules/`.

These are local artifacts and must not be committed. Add/update local ignore rules before staging.

## Known unverified area

The exact visual state of the native Electron window after `go` is the current blocker. Do not close this handoff by saying the demo is complete until that issue is fixed and visually verified.
