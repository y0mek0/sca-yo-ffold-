# Work Timeline and Decisions

## Product and demo direction

- Tracemark was defined as a proof layer for decisions, research, payments, and ecosystem data.
- The core formula was fixed as:

```text
external data or action
→ normalized JSON
→ SHA-256 fingerprint
→ HCS public proof log
→ full event off-chain
→ Mirror Node verification
```

- The final film was narrowed to two concrete scenarios: DevOps/SRE first, Web3 protocol research second.
- The user explicitly wanted the film to be human, short, understandable, and consistently styled.

## Control room decisions

- One Electron BrowserWindow only.
- Action Console accepts `go` and narrates the run.
- Deployment shows hidden Next.js/API readiness.
- Proof shows HCS and Mirror mechanics.
- Proof activity summarizes the run.
- HashScan remains an embedded official webview.
- No external Chrome/Edge/Opera launch.
- No local proof viewer replacing HashScan.

## UI work completed earlier

- Removed xterm helper-textarea problems and moved to simple `<pre>` terminal output.
- Added Windows-safe ASCII panel frames.
- Fixed executable quoting and Electron lifecycle cleanup.
- Added three intro slides with fixed navigation.
- Aligned slide typography and fixed the jumping navigation button.
- Grouped first-slide body text into one body treatment.
- Merged detached Flow text into the Proof explanation.

## Demo copy and scenario work

- Added professions, Core+ adapters, and typed factories to the intro.
- Added DevOps/SRE and protocol/Web3 narrative to the plan.
- Added transition copy to `panels.js` and scenario sequencing to `orchestrator.js`.
- Added real GitHub release/issues, HBAR, SaucerSwap, and HTS snapshot paths.
- Added deliberate `PAUSE` intervals between stages.

## Verification and failures

- Full project tests: 91 passed.
- Demo tests: 8 passed after replacing stale old tests.
- First real DevOps attempt failed correctly because `y0mek0/tracemark` had no releases (`404`).
- Source changed to `hashgraph/hedera-services`.
- Direct release adapter succeeded and produced a real HCS record.
- Full orchestrator later completed with five real records and all Mirror matches true.
- The user then tested the visible flow and reported that the Action Console and lower activity blocks still did not explain the scenario properly.

## Current stop

The work stopped at the boundary between backend proof correctness and audience-facing UI correctness. The next chat must fix visible state rendering, not add more backend functionality first.
