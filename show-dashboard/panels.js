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
  console.log('\n' + paint('cyan', '  ACTION CONSOLE / OPERATOR INPUT'));
  console.log('  input=go');
  console.log('  presentation=large left panel');
  console.log('  output=technical state and receipt events');
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
  if (s.status === 'error') return { label: 'ERROR', text: `status=error comment=${s.comment || 'runtime failure'}`, colour: 'red' };
  const scenario = s.scenario || 'none';
  const source = s.source || s.active || 'none';
  const proofs = Array.isArray(s.proofs) ? s.proofs.length : 0;
  return { label: `STATE / ${String(s.stage || 'waiting').toUpperCase()}`, text: `scenario=${scenario} source=${source} proofs=${proofs} status=${s.status || 'waiting'}`, colour: s.stage === 'verified' || s.stage === 'complete' ? 'green' : 'blue' };
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
  if (s.stage === 'normalize') return { label: `NORMALIZE / ${s.source || s.active || 'SOURCE'}`, text: 'normalized record ready · local payload retained', colour: 'blue' };
  if (s.stage === 'hash') return { label: `HASH / ${s.source || s.active || 'SOURCE'}`, text: latest ? `sha256 ${shortDigest(latest)}` : 'digest pending', colour: 'blue' };
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
  console.log('  presentation=large left panel');
  console.log('  state=technical run started');
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
