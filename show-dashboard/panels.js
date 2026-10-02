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
const proofRows = (proofs = []) => proofs.map((proof) => `${proof.source} / sequence ${proof.sequence} / HASH MATCH ${proof.hashMatch ? 'YES' : 'NO'}`).join('\n');
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
    console.log('\n' + paint('blue', '  THIS WINDOW'));
    console.log('  Next.js dev server runs hidden in the background.');
    console.log('  GET http://localhost:3000/api/doctor -> 200 OK');
    console.log('\n' + paint('yellow', '  TEMPLATE') + '  y0mek0/tracemark');
    console.log(paint('gray', '  PROCESS') + '  next dev / local app / API doctor');
  }
  if (role === 'proof') {
    console.log('\n' + paint('blue', '  THIS WINDOW'));
    console.log('  Shows the proof pipeline and the sequence numbers returned by Hedera.');
    console.log('\n' + paint('white', '  ACTION') + '   fetch → normalize → hash → HCS → Mirror');
    console.log(paint('white', '  NETWORK') + '  Hedera testnet');
  }
}
function eventFor(s) {
  if (s.status === 'error') return { label: 'ERROR', text: s.comment || 'The flow stopped.', colour: 'red' };
  if (s.stage === 'intro') return { label: 'START', text: 'We will begin with a DevOps release decision, then move to a Web3 protocol snapshot.', colour: 'yellow' };
  if (s.stage === 'scenario-transition' && s.scenario === 'devops') return { label: 'DEVOPS / SRE', text: 'First we check a release and its open issues before deciding whether to deploy.', colour: 'cyan' };
  if (s.stage === 'scenario-transition' && s.scenario === 'web3') return { label: 'WEB3 / PROTOCOL', text: 'Now the same proof layer records a protocol snapshot from public ecosystem data.', colour: 'cyan' };
  if (s.stage === 'scenario-complete' && s.scenario === 'devops') return { label: 'DEVOPS DECISION', text: 'The release inputs and deployment decision are now recorded and publicly verifiable.', colour: 'green' };
  if (s.stage === 'scenario-complete' && s.scenario === 'web3') return { label: 'PROTOCOL REPORT', text: 'The protocol snapshot is recorded. Next we compare the two scenarios and the shared proof layer.', colour: 'green' };
  if (s.stage === 'local-app') return { label: 'LOCAL APP', text: 'The Next.js app is running. The Doctor endpoint answered.', colour: 'green' };
  if (s.stage === 'template') return { label: 'TEMPLATE', text: 'The scaffold is running locally. Next is the first live adapter.', colour: 'blue' };
  if (s.stage === 'action') return { label: s.active || 'ACTION', text: s.comment || 'The adapter is running.', colour: 'yellow' };
  if (s.stage === 'document') return { label: 'DOCUMENT', text: 'Document metadata is being fingerprinted and anchored.', colour: 'yellow' };
  if (s.stage === 'submitted') return { label: s.active || 'SUBMITTED', text: 'Hedera returned a new sequence. Opening the proof page.', colour: 'green' };
  if (s.stage === 'verified') return { label: s.active || 'VERIFIED', text: 'The public record has the same fingerprint as the local record.', colour: 'green' };
  if (s.stage === 'infographic') return { label: 'FINAL MAP', text: 'The records are ready. Opening the workflow page.', colour: 'blue' };
  if (s.stage === 'complete') return { label: 'SHARED PROOF LAYER', text: 'The two workflows used different sources and adapters, but the proof layer stayed the same: normalized records, SHA-256 fingerprints, HCS anchors, and Mirror checks.', colour: 'green' };
  return { label: 'WAITING', text: 'Waiting for the controller.', colour: 'gray' };
}
function render(s) {
  const event = eventFor(s);
  const marker = JSON.stringify({ role, stage:s.stage, status:s.status, active:s.active, comment:s.comment, proofs:s.proofs?.map((p) => [p.source, p.sequence, p.hashMatch]) });
  if (marker === lastEvent) return;
  lastEvent = marker;
  console.log('\n' + paint('gray', '─'.repeat(88)));
  console.log(paint(event.colour, `  ${event.label}`));
  console.log(`  ${event.text}`);
  if (role === 'proof' && s.proofs?.length) console.log('\n' + proofRows(s.proofs));
  if (role === 'commentary' && s.stage === 'complete' && s.proofs?.length) console.log('\n' + paint('green', proofRows(s.proofs)));
  if (role === 'deployment' && s.stage === 'local-app') console.log('  http://localhost:3000  /  Doctor endpoint answered');
  if (role === 'proof' && s.stage === 'complete') console.log('\n' + paint('green', '  ALL PUBLIC PROOFS VERIFIED'));
}
async function main() {
  title(role === 'commentary' ? 'TRACEMARK — ACTION CONSOLE' : role === 'deployment' ? 'TRACEMARK — DEPLOYMENT' : 'TRACEMARK — PROOF', role === 'commentary' ? 'Live commands and the operator prompt.' : role === 'deployment' ? 'Template and local app.' : 'Hedera evidence and public verification.');
  if (role === 'commentary') intro(); else staticRole();
  const rl = controller ? readline.createInterface({ input: process.stdin, output: process.stdout }) : null;
  if (controller) {
    const answer = await new Promise((resolve) => rl.question('\nType go to start: ', resolve));
    rl.close();
    if (String(answer).trim().toLowerCase() !== 'go') { console.log('\nCancelled.'); return; }
    const child = spawn(process.execPath, [path.join(__dirname, 'orchestrator.js')], { cwd: __dirname, windowsHide: false, stdio: 'ignore' });
    child.on('exit', () => {});
  }
  while (true) { render(readState()); await sleep(350); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
