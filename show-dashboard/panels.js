const fs = require('node:fs');
const path = require('node:path');
const { spawn } = require('node:child_process');
const readline = require('node:readline');

const role = process.argv[2] || 'commentary';
const controller = process.argv.includes('--controller');
const stateFile = path.join(__dirname, 'runtime', 'state.json');
const c = { reset:'\x1b[0m', bold:'\x1b[1m', cyan:'\x1b[36m', blue:'\x1b[94m', green:'\x1b[92m', yellow:'\x1b[93m', red:'\x1b[91m', white:'\x1b[97m', gray:'\x1b[90m', magenta:'\x1b[95m' };
const paint = (name, text) => `${c[name]}${text}${c.reset}`;
const readState = () => { try { return JSON.parse(fs.readFileSync(stateFile, 'utf8')); } catch { return { stage:'waiting', status:'waiting', proofs:[] }; } };
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const proofRows = (proofs = []) => proofs.map((proof) => {
  const match = proof.hashMatch === true ? 'YES' : proof.hashMatch === false ? 'NO' : 'PENDING';
  return `${proof.source} / sequence ${proof.sequence} / HASH MATCH ${match}`;
}).join('\n');
const shortDigest = (proof) => proof?.digest ? `${proof.digest.slice(0, 18)}…` : 'digest pending';
let lastEvent = '';

function title(label, subtitle) {
  const line = '+----------------------------------------------------------------------------------+';
  console.log(paint('magenta', line));
  console.log(paint('magenta', '|') + paint('bold', `  ${label.padEnd(80)}`) + paint('magenta', '|'));
  console.log(paint('magenta', '|') + paint('white', `  ${subtitle.padEnd(80)}`) + paint('magenta', '|'));
  console.log(paint('magenta', line));
}

function intro() {
  console.log('\n' + paint('cyan', '  HOW TO READ THIS DEMO'));
  console.log('  First we will use Tracemark for a DevOps release decision.');
  console.log('  Then we will use the same proof layer for a Web3 protocol snapshot.');
  console.log('  The sources change. The proof flow stays the same: read, normalize, hash, publish, verify.');
  console.log('  This window explains what the system saw, recorded, and checked.');
}

function staticRole() {
  if (role === 'deployment') {
    console.log('\n' + paint('blue', '  RUNTIME STATUS'));
    console.log('  process=starting');
    console.log('  template=y0mek0/tracemark');
  }
  if (role === 'proof') {
    console.log('\n' + paint('blue', '  HEDERA RECEIPTS'));
    console.log('  network=hedera-testnet');
    console.log('  pipeline=fetch -> normalize -> hash -> HCS -> Mirror');
  }
}

function commentaryEvent(s) {
  if (s.status === 'error') return { label: 'ERROR', text: `The live run stopped here. ${s.comment || 'Check the technical panels for the failure.'}`, colour: 'red' };
  if (s.stage === 'intro') return { label: 'STARTING THE PRESENTATION', text: 'The introduction is over. We are starting with a DevOps release decision. Watch this panel for the explanation; Deployment will show local readiness, Proof will show Hedera receipts, and Proof activity will summarize the current record.', colour: 'yellow' };
  if (s.stage === 'local-app') return { label: 'RUNTIME READY', text: 'The local app and Doctor endpoint are ready. Now look at the first scenario: a DevOps release decision based on a release and its open issues.', colour: 'green' };
  if (s.stage === 'scenario-transition' && s.scenario === 'devops') return { label: 'SCENARIO 1 · DEVOPS / SRE', text: 'This is the Release Safety Gate. We will read the release the engineering team is considering, check open issues, record the deployment decision, and make that decision publicly verifiable.', colour: 'cyan' };
  if (s.stage === 'template' && s.scenario === 'devops') return { label: 'HOW TO READ SCENARIO 1', text: 'The source data will become one decision record. As each source is processed, Proof will show the technical receipt and Proof activity will show which record is current.', colour: 'blue' };
  if (s.stage === 'action' && s.scenario === 'devops') {
    if (s.source === 'GITHUB RELEASE') return { label: 'DEVOPS · RELEASE', text: 'We are reading the release the engineering team is considering. The next proof will preserve the release data that this decision used.', colour: 'yellow' };
    if (s.source === 'GITHUB ISSUES') return { label: 'DEVOPS · OPEN ISSUES', text: 'Now we are checking the open issues that could affect the release decision. These inputs will be recorded alongside the release context.', colour: 'yellow' };
  }
  if (s.stage === 'submitted') return { label: `${s.active || 'RECORD'} · HCS RECEIPT`, text: 'The local record has produced a Hedera sequence. Look at Proof for the sequence and digest; HashScan is the public transaction view.', colour: 'green' };
  if (s.stage === 'verified') return { label: `${s.active || 'RECORD'} · VERIFIED`, text: 'Mirror Node returned the same fingerprint as the local record. Proof activity now marks this source as verified.', colour: 'green' };
  if (s.stage === 'scenario-complete' && s.scenario === 'devops') return { label: 'DEVOPS · DECISION RECORDED', text: 'The release inputs and deployment decision are now recorded and publicly verifiable. Read this pause before we switch to a Web3 protocol snapshot.', colour: 'green' };
  if (s.stage === 'scenario-transition' && s.scenario === 'web3') return { label: 'SCENARIO 2 · WEB3 / PROTOCOL', text: 'The first workflow is complete. Now we use the same proof layer for a protocol snapshot. The sources change; the verification path does not.', colour: 'cyan' };
  if (s.stage === 'template' && s.scenario === 'web3') return { label: 'HOW TO READ SCENARIO 2', text: 'We will read market, token, treasury, and development data. Watch Action Console for the meaning of each source; Proof will only show the technical receipts.', colour: 'blue' };
  if (s.stage === 'action' && s.scenario === 'web3') {
    if (s.source === 'HBAR PRICE') return { label: 'WEB3 · HBAR PRICE', text: 'We are reading the public HBAR price used by this protocol snapshot. No transaction is executed by this read.', colour: 'yellow' };
    if (s.source === 'SAUCERSWAP POOL') return { label: 'WEB3 · SAUCERSWAP', text: 'Now we are reading a SaucerSwap pool snapshot. This is read-only market data; no trade is executed.', colour: 'yellow' };
    if (s.source === 'HTS TREASURY') return { label: 'WEB3 · HTS TREASURY', text: 'Next we are reading public HTS token and treasury state from the Hedera Mirror Node.', colour: 'yellow' };
  }
  if (s.stage === 'scenario-complete' && s.scenario === 'web3') return { label: 'WEB3 · REPORT RECORDED', text: 'The protocol snapshot is recorded and verified. This does not claim that the market was right; it shows exactly what data was observed and when.', colour: 'green' };
  if (s.stage === 'infographic') return { label: 'FINAL COMPARISON', text: 'Different sources and adapters produced different records, but the proof path stayed the same. We are now comparing the two workflows.', colour: 'blue' };
  if (s.stage === 'complete') return { label: 'DEMO COMPLETE', text: 'Both workflows became normalized records, received SHA-256 fingerprints, were anchored to Hedera, and were checked through the Mirror Node. The latest public transaction is visible in HashScan.', colour: 'green' };
  return { label: 'WAITING', text: 'Waiting for the operator to start the technical presentation.', colour: 'gray' };
}

function deploymentEvent(s) {
  if (s.status === 'error') return { label: 'RUNTIME ERROR', text: s.comment || 'runtime failure', colour: 'red' };
  if (s.stage === 'intro') return { label: 'RUNTIME / IDLE', text: 'waiting for local app readiness', colour: 'gray' };
  if (s.stage === 'local-app') return { label: 'DOCTOR / 200 OK', text: 'GET http://localhost:3000/api/doctor → 200 OK', colour: 'green' };
  if (s.stage === 'scenario-transition') return { label: 'RUNTIME / READY', text: `app ready · scenario=${s.scenario} · no deployment action`, colour: 'blue' };
  if (s.stage === 'template') return { label: 'RUNTIME / READY', text: `app ready · active=${s.active || 'scenario'}`, colour: 'blue' };
  if (s.stage === 'action') return { label: 'RUNTIME / READY', text: `app ready · source=${s.source || s.active || 'active'}`, colour: 'blue' };
  if (s.stage === 'submitted') return { label: 'RUNTIME / READY', text: `app ready · HCS receipt pending Mirror check · source=${s.source || s.active || 'active'}`, colour: 'blue' };
  if (s.stage === 'verified') return { label: 'RUNTIME / READY', text: `app ready · proof verified · source=${s.source || s.active || 'active'}`, colour: 'green' };
  if (s.stage === 'complete') return { label: 'RUNTIME / COMPLETE', text: 'local app remained ready for the full demonstration', colour: 'green' };
  return { label: 'RUNTIME / READY', text: 'local app process available', colour: 'blue' };
}

function proofEvent(s) {
  const latest = s.proofs?.[s.proofs.length - 1];
  if (s.status === 'error') return { label: 'PROOF ERROR', text: s.comment || 'proof failure', colour: 'red' };
  if (s.stage === 'intro') return { label: 'PROOF / IDLE', text: 'waiting for source adapter output', colour: 'gray' };
  if (s.stage === 'local-app') return { label: 'PROOF / READY', text: 'Hedera testnet · topic 0.0.10426202', colour: 'blue' };
  if (s.stage === 'scenario-transition') return { label: `SOURCE SET / ${String(s.scenario || '').toUpperCase()}`, text: 'adapter set selected · no HCS write yet', colour: 'blue' };
  if (s.stage === 'template') return { label: 'PIPELINE / READY', text: 'fetch → normalize → hash → HCS → Mirror', colour: 'blue' };
  if (s.stage === 'action') return { label: `FETCH / ${s.source || s.active || 'SOURCE'}`, text: 'adapter running · local event pending', colour: 'yellow' };
  if (s.stage === 'submitted') return { label: `HCS / ${s.source || s.active || 'SOURCE'}`, text: latest ? `sequence ${latest.sequence} · digest ${shortDigest(latest)}` : 'sequence pending', colour: 'green' };
  if (s.stage === 'verified') return { label: `MIRROR / ${s.source || s.active || 'SOURCE'}`, text: latest ? `sequence ${latest.sequence} · hashMatch=${latest.hashMatch ? 'true' : 'false'} · consensus ${latest.consensus || 'pending'}` : 'Mirror result pending', colour: latest?.hashMatch ? 'green' : 'red' };
  if (s.stage === 'scenario-complete') return { label: 'SCENARIO / VERIFIED', text: `${s.proofs?.length || 0} verified record(s) in current scenario`, colour: 'green' };
  if (s.stage === 'infographic') return { label: 'PROOF / COMPARISON', text: 'different adapters · same normalized proof path', colour: 'blue' };
  if (s.stage === 'complete') return { label: 'PROOF / COMPLETE', text: `${s.proofs?.length || 0} records · all public proofs verified`, colour: 'green' };
  return { label: 'PROOF / IDLE', text: 'waiting for source adapter output', colour: 'gray' };
}

function eventFor(s) {
  if (role === 'commentary') return commentaryEvent(s);
  if (role === 'deployment') return deploymentEvent(s);
  return proofEvent(s);
}

function render(s) {
  const event = eventFor(s);
  const marker = JSON.stringify({ role, stage:s.stage, status:s.status, scenario:s.scenario, active:s.active, source:s.source, comment:s.comment, proofs:s.proofs?.map((p) => [p.source, p.sequence, p.hashMatch]) });
  if (marker === lastEvent) return;
  lastEvent = marker;
  console.log('\n' + paint('gray', '─'.repeat(88)));
  console.log(paint(event.colour, `  ${event.label}`));
  console.log(`  ${event.text}`);
  if (role === 'proof' && s.proofs?.length) console.log('\n' + proofRows(s.proofs));
  if (role === 'commentary' && s.stage === 'complete' && s.proofs?.length) console.log('\n' + paint('green', proofRows(s.proofs)));
}

function acceptedGoBriefing() {
  console.log('\n' + paint('cyan', '  GO ACCEPTED'));
  console.log('  The technical presentation is starting with Scenario 1: DevOps / SRE.');
  console.log('  Action Console will explain the live steps. Deployment will report runtime readiness. Proof will report HCS and Mirror receipts.');
}

async function main() {
  title(role === 'commentary' ? 'TRACEMARK — ACTION CONSOLE' : role === 'deployment' ? 'TRACEMARK — DEPLOYMENT' : 'TRACEMARK — PROOF', role === 'commentary' ? 'Live explanation and operator prompt.' : role === 'deployment' ? 'LOCAL RUNTIME' : 'HEDERA RECEIPTS');
  if (role === 'commentary') intro(); else staticRole();
  const rl = controller ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
  if (controller) {
    const answer = await new Promise((resolve) => rl.question('\nType go to start: ', resolve));
    rl.close();
    if (String(answer).trim().toLowerCase() !== 'go') { console.log('\nCancelled.'); return; }
    acceptedGoBriefing();
    const child = spawn(process.execPath, [path.join(__dirname, 'orchestrator.js')], { cwd: __dirname, windowsHide: true, stdio: 'ignore' });
    child.on('exit', () => {});
  }
  while (true) { render(readState()); await sleep(350); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
