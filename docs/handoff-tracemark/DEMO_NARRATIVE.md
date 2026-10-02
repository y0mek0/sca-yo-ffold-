# Intended Demo Narrative and Transition Copy

## Audience promise

The film should answer three questions without forcing the audience to read code:

1. What did the system see?
2. What did Tracemark record?
3. How can anyone check that public record later?

The explanation must stay short, human, and concrete. Avoid slogans such as `Record it once. Verify it later.`

## Intro before `go`

### Slide 1 — THE PRODUCT

Explain the product in one coherent body:

```text
A proof layer for decisions, research, payments, and ecosystem data.

Tracemark shows what a system saw, what it recorded, and when.
It turns external data or an action into a structured record, creates a SHA-256 fingerprint, and publishes a compact proof to Hedera.

The full payload stays in private storage. Hedera keeps the public proof, and the Mirror Node lets anyone check that the record was not changed.
```

### Slide 2 — WHO USES IT

Show professions and examples, including DevOps/SRE, research/due diligence, legal/accounting, protocol research, DAO operations, and AI agents. Include Core+ adapters and typed factories without turning the slide into a feature dump.

### Slide 3 — THIS CONTROL ROOM

Explain the roles of Action Console, Deployment, Proof, Proof activity, and HashScan. Do not add a detached Flow block that competes with the main hierarchy.

## After the operator types `go`

The first visible Action Console message must be explicit:

```text
We are starting with a DevOps release decision.
We will read the release and its open issues, record the deployment decision, and verify the proof through Hedera.
```

The dashboard should simultaneously identify the active scenario:

```text
DEVOPS / SRE
Release Safety Gate
```

## Scenario 1 — DevOps / SRE

The visible story:

```text
GitHub release + open issues + security context
→ deployment analysis
→ DEPLOY or BLOCK decision
→ AI Decision proof
→ SHA-256
→ HCS
→ Mirror verification
```

The Action Console should narrate in short updates:

```text
We are reading the release the engineering team is considering.
Now we are checking the open issues that could affect the decision.
The inputs are normalized into one decision record.
The record has a deterministic SHA-256 fingerprint.
The compact proof is being published to Hedera.
Mirror Node is checking the same fingerprint back.
```

The scenario completion message:

```text
The release inputs and deployment decision are now recorded and publicly verifiable.
We will pause here before switching to a different kind of workflow.
```

Do not claim that the release is objectively safe. The demo proves what inputs and decision were recorded.

## Pause A

Use a deliberate short transition state, not an arbitrary blank delay:

```text
NEXT SCENARIO
The same proof layer will now follow a Web3 protocol snapshot.
The sources will change; the verification path will not.
```

The pause must be long enough to read, but not theatrical. Use the shared pause constant and a visible stable state.

## Scenario 2 — Web3 protocol research

The visible story:

```text
HBAR price + SaucerSwap pool + HTS token/treasury state + GitHub activity
→ protocol report
→ Research Claim proof
→ SHA-256
→ HCS
→ Mirror verification
```

The Action Console transition:

```text
Now we are using the same proof layer for a Web3 protocol snapshot.
We will read market, token, treasury, and development data, then record what the protocol looked like at this time.
```

The Action Console should narrate:

```text
We are reading the public HBAR price.
Now we are reading the SaucerSwap pool without executing a trade.
Next we are reading HTS token and treasury state from the Mirror Node.
These inputs are normalized into a protocol research record.
The protocol snapshot is being fingerprinted and published to Hedera.
Mirror Node is checking the public proof against the local fingerprint.
```

The scenario completion message:

```text
The protocol snapshot is recorded and verified.
This does not claim that the market was right; it shows exactly what data was observed and when.
```

## Final comparison

```text
The two workflows used different sources and adapters, but the proof layer stayed the same.
Both records became normalized events, received SHA-256 fingerprints, were anchored to Hedera, and were checked through the Mirror Node.
```

Final visual chain:

```text
source or action
→ normalized record
→ SHA-256
→ compact HCS proof
→ Mirror Node check
→ latest public HashScan transaction
```

## Proof activity copy

This block must stop repeating generic text. It should have one active title and one current explanation:

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

LATEST RESULT
Waiting for the next verification
```

When complete, show the real source/sequence/hash-match summary, not the same sentence for every record.
