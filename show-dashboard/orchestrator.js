const fs = require('node:fs');
const path = require('node:path');
const { spawn, spawnSync } = require('node:child_process');

const DEMO_DIR = __dirname;
const REPO = process.env.TRACEMARK_REPO || 'C:\\Users\\azi\\Documents\\prro_grams\\hackaton-now\\hedera-bounty';
const STATE_DIR = path.join(DEMO_DIR, 'runtime');
const STATE_FILE = path.join(STATE_DIR, 'state.json');
const RECORDINGS = path.join(DEMO_DIR, 'recordings');
const TOPIC_ID = '0.0.10426202';
const PAUSE = Number(process.env.DEMO_PAUSE_MS || '5500');
const EVIDENCE_LIMIT = Number(process.env.DEMO_EVIDENCE_LIMIT || '3');
let appProcess;
let webProcess;
let evidenceCount = 0;

function state(patch) {
  const current = fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')) : {};
  const next = { ...current, ...patch, updatedAt: new Date().toISOString() };
  fs.mkdirSync(STATE_DIR, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(next, null, 2));
  return next;
}
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const clean = (text) => text.replace(/\x1b\[[0-9;]*m/g, '');
function allMatches(text, regex) { return [...clean(text).matchAll(regex)].map((m) => m[1]); }
function runTsx(scriptName, args = []) {
  const cli = path.join(REPO, 'node_modules', 'tsx', 'dist', 'cli.mjs');
  const script = path.join(REPO, 'packages', 'nextjs', 'scripts', scriptName);
  return spawnSync(process.execPath, [cli, script, ...args], { cwd: REPO, env: { ...process.env, FORCE_COLOR: '1' }, encoding: 'utf8', maxBuffer: 4 * 1024 * 1024, windowsHide: false });
}
function openUrl(url) {
  try {
    if (process.platform === 'win32') {
      const result = spawnSync(process.env.ComSpec || 'cmd.exe', ['/d', '/c', 'start', '', url], { windowsHide: true, stdio: 'ignore' });
      if (result.error) state({ browserNotice: `Open manually: ${url}` });
    } else {
      spawnSync('xdg-open', [url], { stdio: 'ignore' });
    }
  } catch {
    state({ browserNotice: `Open manually: ${url}` });
  }
}
function findBrowser() {
  const candidates = [
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Google', 'Chrome', 'Application', 'chrome.exe') : '',
    process.env.PROGRAMFILES ? path.join(process.env.PROGRAMFILES, 'Microsoft', 'Edge', 'Application', 'msedge.exe') : ''
  ].filter(Boolean);
  return candidates.find((candidate) => fs.existsSync(candidate));
}
function openEvidenceWindow(url, holdMs = 3200) {
  if (!process.env.TRACEMARK_EVIDENCE_BRIDGE) {
    state({ browserNotice: `Evidence kept inside control room: ${url}` });
    return;
  }
  fetch(process.env.TRACEMARK_EVIDENCE_BRIDGE, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ url, holdMs })
  }).catch(() => {});
}
async function waitForDemoWeb() {
  try { const response = await fetch('http://127.0.0.1:4173/'); if (response.ok) return true; } catch {}
  webProcess = spawn(process.execPath, [path.join(DEMO_DIR, 'serve-demo.cjs')], { cwd: DEMO_DIR, env: process.env, windowsHide: true, stdio: 'ignore', detached: true });
  webProcess.unref();
  for (let i = 0; i < 15; i += 1) {
    await sleep(250);
    try { const response = await fetch('http://127.0.0.1:4173/'); if (response.ok) return true; } catch {}
  }
  return false;
}
async function waitForApp() {
  try { const response = await fetch('http://127.0.0.1:3000/api/doctor'); if (response.ok) return true; } catch {}
  const nextCli = path.join(REPO, 'node_modules', 'next', 'dist', 'bin', 'next');
  appProcess = spawn(process.execPath, [nextCli, 'dev'], { cwd: path.join(REPO, 'packages', 'nextjs'), env: process.env, windowsHide: true, detached: false, stdio: 'ignore' });
  appProcess.unref();
  for (let i = 0; i < 45; i += 1) {
    await sleep(1000);
    try { const response = await fetch('http://127.0.0.1:3000/api/doctor'); if (response.ok) return true; } catch {}
  }
  return false;
}
async function mirror(sequence, digest) {
  const url = `https://testnet.mirrornode.hedera.com/api/v1/topics/${TOPIC_ID}/messages/${sequence}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Mirror Node HTTP ${response.status}`);
  const body = await response.json();
  const envelope = JSON.parse(Buffer.from(body.message, 'base64').toString('utf8'));
  const mirrorDigest = envelope?.hash?.digest;
  const tx = body.chunk_info?.initial_transaction_id;
  const hashscanUrl = tx?.account_id && tx?.transaction_valid_start
    ? `https://hashscan.io/testnet/transaction/${tx.account_id}@${tx.transaction_valid_start}`
    : `https://hashscan.io/testnet/topic/${TOPIC_ID}`;
  return { sequence, digest, mirrorDigest, hashMatch: mirrorDigest === digest, mirrorUrl: url, hashscanUrl, consensus: body.consensus_timestamp };
}
function parseProofs(output, source) {
  const sequences = allMatches(output, /"sequenceNumber"\s*:\s*"?(\d+)/g);
  const digests = allMatches(output, /\b([a-f0-9]{64})\b/gi);
  const fallback = allMatches(output, /sequence (\d+)/gi);
  const count = Math.max(sequences.length, digests.length);
  const proofs = [];
  for (let index = 0; index < count; index += 1) {
    const sequence = sequences[index] || fallback[index];
    const digest = digests[index];
    if (sequence && digest) proofs.push({ source, sequence, digest });
  }
  if (!proofs.length) throw new Error(`${source}: sequence or digest missing from command output`);
  return proofs;
}
function parsePaymentProofs(output) {
  const start = output.indexOf('{');
  const end = output.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('PAYMENT EXECUTION: JSON details missing from command output');
  const details = JSON.parse(output.slice(start, end + 1));
  const proofs = [
    { source: 'PAYMENT INTENT', sequence: String(details.intent.sequenceNumber), digest: details.intent.hash.digest },
    { source: 'PAYMENT EXECUTION', sequence: String(details.execution.sequenceNumber), digest: details.execution.hash.digest }
  ];
  if (proofs.some((proof) => !proof.sequence || !proof.digest)) throw new Error('PAYMENT EXECUTION: intent or execution proof missing');
  return proofs;
}
async function runProof({ source, script, args, comment }) {
  state({ stage: 'action', status: 'running', active: source, comment, source, proofs: [] });
  await sleep(PAUSE);
  const result = runTsx(script, args);
  const output = `${result.stdout || ''}\n${result.stderr || ''}`;
  if (result.status !== 0) throw new Error(`${source} command failed (status ${result.status ?? 'unknown'}): ${clean(result.stderr || result.stdout || 'no command output').slice(-600)}`);
  const rawProofs = source === 'PAYMENT EXECUTION' ? parsePaymentProofs(output) : parseProofs(output, source);
  state({ stage: 'normalize', status: 'running', active: source, comment: `The ${source.toLowerCase()} response is now a normalized Tracemark record.`, source, proofs: rawProofs });
  await sleep(PAUSE);
  state({ stage: 'hash', status: 'running', active: source, comment: 'The normalized record now has a deterministic SHA-256 fingerprint.', source, proofs: rawProofs });
  await sleep(PAUSE);
  state({ stage: 'submitted', status: 'running', active: source, comment: 'Hedera returned new sequence numbers. Opening the public records.', source, proofs: rawProofs });
  const proofs = [];
  for (const proof of rawProofs) {
    const verified = await mirror(proof.sequence, proof.digest);
    const record = { ...proof, ...verified };
    proofs.push(record);
    if (evidenceCount < EVIDENCE_LIMIT && source !== 'PAYMENT INTENT') {
      evidenceCount += 1;
      openEvidenceWindow(record.hashscanUrl, 3200);
      await sleep(3200);
      openEvidenceWindow(`http://127.0.0.1:4173/proof-viewer.html?sequence=${proof.sequence}&digest=${proof.digest}`, 2600);
      await sleep(2600);
    }
    fs.mkdirSync(RECORDINGS, { recursive: true });
    fs.writeFileSync(path.join(RECORDINGS, `${source.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${proof.sequence}.json`), JSON.stringify(record, null, 2));
    if (!verified.hashMatch) throw new Error(`${source}: Mirror digest mismatch at sequence ${proof.sequence}`);
  }
  state({ stage: 'verified', status: 'running', active: source, comment: 'Each public Mirror Node record matches its local fingerprint.', source, proofs });
  await sleep(PAUSE);
  return proofs;
}
function runDocumentProof() {
  const script = path.join(DEMO_DIR, 'document-proof.cjs');
  const result = spawnSync(process.execPath, [script], { cwd: DEMO_DIR, env: { ...process.env, TRACEMARK_REPO: REPO }, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024, windowsHide: false });
  return result;
}
async function main() {
  state({ stage: 'intro', status: 'running', scenario: null, active: 'START', comment: 'First a DevOps release decision. Then a Web3 protocol snapshot. The proof layer stays the same.', proofs: [], sequence: null, digest: null, mirrorDigest: null, mirrorUrl: null, hashMatch: null, error: null });
  const appReady = await waitForApp();
  state({ stage: 'local-app', status: appReady ? 'running' : 'error', active: 'LOCAL APP', comment: appReady ? 'The local Next.js app is running and the Doctor endpoint answered.' : 'The local app did not become ready.', appUrl: 'http://localhost:3000' });
  if (!appReady) throw new Error('Local app did not become ready');
  const demoWebReady = await waitForDemoWeb();
  if (!demoWebReady) throw new Error('Demo browser server did not become ready');

  state({ stage: 'scenario-transition', status: 'running', scenario: 'devops', active: 'DEVOPS / SRE', comment: 'First we check a release and its open issues before deciding whether to deploy.' });
  await sleep(PAUSE);
  state({ stage: 'template', status: 'running', scenario: 'devops', active: 'RELEASE SAFETY GATE', comment: 'GitHub release, open issues, and security notes become inputs to a deployment decision.' });
  await sleep(PAUSE);

  const proofs = [];
  proofs.push(...await runProof({ source: 'GITHUB RELEASE', script: 'watch-github-release.ts', args: ['--owner', 'hashgraph', '--repo', 'hedera-services'], comment: 'We read the release that the engineering team is considering.' }));
  proofs.push(...await runProof({ source: 'GITHUB ISSUES', script: 'watch-github-issues.ts', args: ['--owner', 'hashgraph', '--repo', 'hedera-services', '--limit', '5'], comment: 'We read the open issues that could affect the release decision.' }));
  state({ stage: 'scenario-complete', status: 'running', scenario: 'devops', active: 'DEPLOY DECISION', comment: 'The release inputs are recorded. The demo decision is DEPLOY, and its inputs can be checked later.', proofs });
  await sleep(PAUSE);

  state({ stage: 'scenario-transition', status: 'running', scenario: 'web3', active: 'WEB3 / PROTOCOL', comment: 'Now the same proof layer records a protocol snapshot from public ecosystem data.' });
  await sleep(PAUSE);
  state({ stage: 'template', status: 'running', scenario: 'web3', active: 'PROTOCOL HEALTH DASHBOARD', comment: 'We combine market, token, treasury, and development signals into a protocol report.' });
  await sleep(PAUSE);

  proofs.push(...await runProof({ source: 'HBAR PRICE', script: 'watch-hbar-price.ts', args: [], comment: 'We capture the public HBAR price used by the protocol snapshot.' }));
  proofs.push(...await runProof({ source: 'SAUCERSWAP POOL', script: 'watch-saucerswap-snapshot.ts', args: ['--pool-id', '0'], comment: 'We capture a read-only SaucerSwap pool snapshot. No trade is executed.' }));
  proofs.push(...await runProof({ source: 'HTS TREASURY', script: 'watch-hts-treasury.ts', args: ['--token-id', '0.0.429274'], comment: 'We capture public token and treasury state from the Hedera Mirror Node.' }));
  state({ stage: 'scenario-complete', status: 'running', scenario: 'web3', active: 'PROTOCOL REPORT', comment: 'The Web3 snapshot is recorded. The same proof layer handled both scenarios.', proofs });
  await sleep(PAUSE);

  state({ stage: 'infographic', status: 'running', scenario: 'final', active: 'SHARED PROOF LAYER', comment: 'Different sources and adapters produced the same verifiable proof path.' , proofs });
  const finalState = state({ stage: 'complete', status: 'complete', scenario: 'final', active: 'COMPLETE', comment: 'DevOps and Web3 scenarios are complete. The records, Hedera proofs, and public checks are ready to review.', proofs });
  fs.writeFileSync(path.join(STATE_DIR, 'infographic-data.json'), JSON.stringify(finalState, null, 2));
  const template = fs.readFileSync(path.join(DEMO_DIR, 'infographic-template.html'), 'utf8');
  fs.writeFileSync(path.join(DEMO_DIR, 'infographic.html'), template.replace('__DATA__', JSON.stringify(finalState).replace(/</g, '\\u003c')));
  await sleep(PAUSE * 2);
  process.exit(0);
}
main().catch((error) => { state({ stage: 'error', status: 'error', active: 'ERROR', comment: error.message }); process.exitCode = 1; });
