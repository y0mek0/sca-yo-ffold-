# Tracemark Handoff — Read This First

## Purpose

This folder is the complete handoff for continuing Tracemark in a new chat. It describes the product goal, the hackathon angle, the control-room architecture, the exact demo narrative, what has been implemented, what was verified, what failed, and the next work that must happen.

This is documentation only. Do not add project comments or scattered notes elsewhere. Keep future handoff updates inside this folder.

## Current one-sentence state

The repository contains a new `show-dashboard/` Electron demo copy with a real two-scenario orchestrator and verified real Hedera records, but the visible post-`go` Action Console and Proof activity presentation is not yet audience-ready: the current UI does not clearly narrate the active scenario and lower panels still show overly generic/repeated text.

## Read order in a new chat

1. `README.md` — orientation and non-negotiable constraints.
2. `CURRENT_STATE.md` — exact stop point and current defect.
3. `ARCHITECTURE.md` — window roles and data/state relationships.
4. `DEMO_NARRATIVE.md` — the intended film, transition copy, and timing.
5. `ERRORS_AND_LESSONS.md` — failures already encountered and how not to repeat them.
6. `PLAN.md` — the next implementation sequence and acceptance gates.
7. `COMPETITION_CHECK.md` — local bounty alignment and remaining manual checks.
8. `NEW_CHAT_PROMPT.md` — paste this into the new chat after saying to inspect this folder.

## Project locations

- Repository: `C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty`
- Demo copy: `C:\Users\azi\Documents\prro_grams\hackaton-now\hedera-bounty\show-dashboard`
- Historical/live working demo directory: `C:\Users\azi\AppData\Local\TracemarkDemo`
- Current branch: `main`

## Product goal

Tracemark is a Hedera-native proof layer for AI decisions, research, payments, and verifiable ecosystem data. It converts an external source or action into a normalized event, creates a SHA-256 fingerprint, publishes a compact proof to HCS, keeps the full payload off-chain, and checks the public proof through the Mirror Node.

The product boundary is important: Tracemark proves what was recorded and when. It does not prove that the external source was true, that the market was fair, or that an AI decision was correct.

## Demo goal

The audience should understand the product through two concrete scenarios, not through a list of technical features:

1. Non-Web3 DevOps / SRE — Release Safety Gate.
2. Web3 protocol research — Protocol Health Dashboard.

Both must visibly use the same proof architecture while changing only the sources and adapters.

## Current user-facing problem

The user launched the demo and reported:

- after pressing `go`, the first window did not clearly say what viewers were about to see;
- the scenario transition was not visible as a short human explanation;
- the lower activity blocks contained repetitive generic text instead of meaningful stage-specific information;
- the result therefore felt like a technical backend run, not the planned film.

This is the active defect. Do not claim the demo is finished until the actual Electron window is re-launched and the visible output is corrected and inspected.

## Non-negotiable working style

- Communicate with the user in concise Russian.
- Keep all repository/project-facing copy in natural English.
- Do not invent proof IDs, hashes, API responses, or success states.
- Verify the exact launcher and the actual visible Electron window.
- Keep one Electron window and embedded real HashScan webview.
- Never open Chrome, Edge, or Opera automatically.
- Do not expose secrets or save `.env.local`, keys, tokens, passwords, or connection strings.
- Keep the Tracemark sharp editorial style: no pills, no rounded cards, no decorative redesign.
- Do not rewrite the flow or copy repeatedly without checking the real UI.
- Use deliberate pauses between phases so the viewer can understand the change of scenario.
