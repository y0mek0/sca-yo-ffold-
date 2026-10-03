const outputs = new Map();
const inputById = new Map();
const TERMINAL_TEXT = '#e9eee9';
const RECORD_TOTAL = 5;

function cleanTerminalText(data) {
  return data
    .replace(/\x1b\][^\x07]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/[\u0000\r]/g, '')
    .replace(/\n{3,}/g, '\n\n');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function setupTerminal(id) {
  const output = document.querySelector(`#term-${id} .terminal-output`);
  if (!output) return;
  output.style.setProperty('color', TERMINAL_TEXT, 'important');
  output.style.setProperty('background-color', '#10191a', 'important');
  output.style.setProperty('font-family', 'Consolas, "Courier New", monospace', 'important');
  output.style.setProperty('font-size', '14px', 'important');
  output.style.setProperty('line-height', '1.45', 'important');
  const input = document.createElement('input');
  input.className = 'terminal-input';
  input.type = 'text';
  input.placeholder = id === 'action' ? 'Type go and press Enter' : 'Live output — input disabled';
  input.disabled = id !== 'action';
  output.parentElement.appendChild(input);
  outputs.set(id, output);
  inputById.set(id, input);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      window.tracemark.writeTerminal(id, `${input.value}\r`);
      input.value = '';
    }
  });
}

['action', 'deployment', 'proof'].forEach(setupTerminal);

window.tracemark?.onTerminalData?.(({ id, data }) => {
  const output = outputs.get(id);
  if (!output) return;
  output.textContent += cleanTerminalText(data);
  if (output.textContent.length > 16000) output.textContent = output.textContent.slice(-14000);
  output.scrollTop = output.scrollHeight;
});

window.tracemark?.onTerminalExit?.(({ id, code }) => {
  const output = outputs.get(id);
  if (output) output.textContent += `\n[terminal exited: ${code}]\n`;
});

const SCENARIOS = {
  devops: {
    label: 'DEVOPS / SRE',
    title: 'Release Safety Gate',
    description: 'We are reading a GitHub release and its open issues, then recording the deployment decision and checking it through Hedera.',
  },
  web3: {
    label: 'WEB3 / PROTOCOL',
    title: 'Protocol Health Dashboard',
    description: 'We are reading market, token, treasury, and development data, then recording what this protocol snapshot looked like at this time.',
  },
  final: {
    label: 'SHARED PROOF LAYER',
    title: 'Two workflows, one verification path',
    description: 'Different sources and adapters became normalized records, received SHA-256 fingerprints, were anchored to Hedera, and were checked through the Mirror Node.',
  },
};

function scenarioFor(state) {
  return SCENARIOS[state?.scenario] || {
    label: 'TRACEMARK',
    title: 'Proof activity',
    description: 'Waiting for the operator to start the run.',
  };
}

function stageFor(state) {
  const stage = state?.stage;
  if (stage === 'error') return { current: 'Verification failed', index: -1 };
  if (stage === 'complete' || stage === 'infographic' || stage === 'scenario-complete') return { current: 'check', index: 4 };
  if (stage === 'verified') return { current: 'check', index: 4 };
  if (stage === 'submitted') return { current: 'write', index: 3 };
  if (stage === 'action' || stage === 'template') return { current: 'normalize', index: 1 };
  if (stage === 'normalize') return { current: 'normalize', index: 1 };
  if (stage === 'hash') return { current: 'hash', index: 2 };
  if (stage === 'local-app' || stage === 'scenario-transition' || stage === 'intro') return { current: 'read', index: 0 };
  return { current: 'read', index: 0 };
}

function resultFor(state, latestProof) {
  if (state?.status === 'error') return state.comment || 'The flow stopped before verification completed.';
  if (latestProof?.sequence && latestProof.hashMatch === true) return `sequence ${latestProof.sequence} · HASH MATCH YES`;
  if (latestProof?.sequence && latestProof.hashMatch === false) return `sequence ${latestProof.sequence} · HASH MATCH NO`;
  if (state?.stage === 'complete') return 'All public proofs verified';
  return 'Waiting for the next verification';
}

function activityContextFor(state, latestProof) {
  if (state?.status === 'error') return state.comment || 'Verification stopped before completion.';
  if (state?.stage === 'intro') return 'Run is starting. No proof record has been written yet.';
  if (state?.stage === 'local-app') return 'Runtime is ready; waiting for the first source record.';
  if (state?.stage === 'action') return `Source adapter active: ${state.source || state.active || 'pending'}.`;
  if (state?.stage === 'normalize') return `Normalized record prepared for ${state.source || state.active || 'the current source'}.`;
  if (state?.stage === 'hash') return latestProof?.digest ? `SHA-256 fingerprint generated: ${latestProof.digest.slice(0, 18)}…` : 'SHA-256 fingerprint is being generated.';
  if (state?.stage === 'submitted') return latestProof?.sequence ? `HCS sequence ${latestProof.sequence} returned. Mirror check is in progress.` : 'HCS receipt returned. Mirror check is in progress.';
  if (state?.stage === 'verified') return latestProof?.hashMatch === true ? `Mirror digest matches the local fingerprint for ${state.source || state.active || 'this record'}.` : 'Mirror verification did not match the local fingerprint.';
  if (state?.stage === 'scenario-complete') return `${state.proofs?.length || 0} record(s) are verified in this scenario.`;
  if (state?.stage === 'infographic') return 'Both workflows use the same normalized-record and public-proof path.';
  if (state?.stage === 'complete') return 'All recorded sources have a matching public proof.';
  return scenarioFor(state).description;
}

function renderPipeline(state) {
  const active = stageFor(state).index;
  document.querySelectorAll('.pipeline .step').forEach((step, index) => {
    step.classList.toggle('done', active > index);
    step.classList.toggle('on', active === index);
  });
}

function renderRecords(proofs) {
  if (!proofs.length) return '<div class="rmeta" style="padding-top:18px">No records yet. Type go to start.</div>';
  return proofs.map((proof) => {
    const verified = proof.hashMatch === true;
    const failed = proof.hashMatch === false || proof.status === 'failed';
    const state = failed ? 'failed' : verified ? 'verified' : 'pending';
    const digest = proof.digest ? `${proof.digest.slice(0, 18)}…` : 'digest pending';
    return `<div class="record"><div class="rtype">${escapeHtml(proof.kind || proof.source || 'proof')}</div><div><div class="rtitle">${escapeHtml(proof.title || proof.source || 'Proof record')}</div><div class="rmeta">sequence ${escapeHtml(proof.sequence ?? 'pending')} · ${escapeHtml(digest)}</div></div><div class="rstate ${failed ? 'fail' : verified ? '' : 'pending'}">${state}</div></div>`;
  }).join('');
}

function liveNarrativeFor(state) {
  const source = state?.source || state?.active || 'the current source';
  const scenario = state?.scenario;
  const stage = state?.stage;
  if (stage === 'intro') return { label: 'SCENARIO 1 · DEVOPS / SRE', title: 'Release Safety Gate', text: 'We are starting with a DevOps release decision. We will read the release and its open issues, turn those inputs into a record, and check the public proof through Hedera.', look: 'LOOK HERE · THIS PAGE FIRST, THEN PROOF ACTIVITY' };
  if (stage === 'local-app') return { label: 'RUNTIME READY', title: 'The local control room is ready', text: 'The local app and Doctor endpoint are ready. The first workflow is a DevOps release decision based on a release and its open issues.', look: 'LOOK HERE · DEPLOYMENT FOR RUNTIME READINESS' };
  if (stage === 'scenario-transition' && scenario === 'devops') return { label: 'SCENARIO 1 · DEVOPS / SRE', title: 'Release Safety Gate', text: 'We are reading the release the engineering team is considering, checking open issues, and recording what this decision used. Tracemark will prove what was observed and recorded, not that the release is objectively safe.', look: 'LOOK HERE · ACTION CONSOLE FOR THE LIVE SOURCE' };
  if (stage === 'template' && scenario === 'devops') return { label: 'DEVOPS / SRE', title: 'From source inputs to one decision record', text: 'The release and issue inputs will become one normalized record. Proof activity will show the current record; Proof will show only the technical Hedera receipt.', look: 'LOOK HERE · PROOF ACTIVITY FOR THE CURRENT RECORD' };
  if (stage === 'action' && scenario === 'devops') return { label: `DEVOPS · ${source}`, title: source === 'GITHUB RELEASE' ? 'Reading the release under consideration' : 'Checking open issues', text: source === 'GITHUB RELEASE' ? 'We are reading the release the engineering team is considering.' : 'We are checking the open issues that could affect the release decision.', look: 'LOOK HERE · ACTION CONSOLE FOR THE TECHNICAL FETCH' };
  if (stage === 'normalize') return { label: `${scenario === 'web3' ? 'WEB3' : 'DEVOPS'} · NORMALIZE`, title: 'The source becomes a normalized record', text: `The ${source} response is now represented as one structured Tracemark record. The full payload remains off-chain; this record is the input to the fingerprint step.`, look: 'LOOK HERE · PROOF ACTIVITY FOR THE CURRENT RECORD' };
  if (stage === 'hash') return { label: `${scenario === 'web3' ? 'WEB3' : 'DEVOPS'} · SHA-256`, title: 'The record receives a deterministic fingerprint', text: 'The normalized record now has a SHA-256 fingerprint. This digest identifies the recorded payload without putting the full payload into the public HCS message.', look: 'LOOK HERE · PROOF FOR THE DIGEST' };
  if (stage === 'submitted') return { label: `${scenario === 'web3' ? 'WEB3' : 'DEVOPS'} · HCS`, title: 'The compact proof is anchored to Hedera', text: 'The compact proof has produced a Hedera sequence. The public record contains the digest and minimal metadata; the full payload stays off-chain.', look: 'LOOK HERE · PROOF FOR TOPIC, SEQUENCE, AND DIGEST' };
  if (stage === 'verified') return { label: `${scenario === 'web3' ? 'WEB3' : 'DEVOPS'} · MIRROR`, title: 'Mirror Node checks the same fingerprint', text: 'Mirror Node returned the Hedera record, and the digest matches the local fingerprint. This confirms what Tracemark recorded and when; it does not prove the external source was correct.', look: 'LOOK HERE · PROOF AND HASH MATCH YES' };
  if (stage === 'scenario-complete' && scenario === 'devops') return { label: 'DEVOPS · RECORDED', title: 'The first workflow is complete', text: 'The release and issue inputs are recorded and publicly verifiable. Now we pause before switching to a different source set: a Web3 protocol snapshot.', look: 'LOOK HERE · HASHSCAN FOR THE PUBLIC TRANSACTION' };
  if (stage === 'scenario-transition' && scenario === 'web3') return { label: 'SCENARIO 2 · WEB3 / PROTOCOL', title: 'Protocol Health Dashboard', text: 'The first workflow is complete. Now we use the same proof layer for a protocol snapshot. The sources change; the verification path does not.', look: 'LOOK HERE · THIS PAGE FOR THE NEW WORKFLOW' };
  if (stage === 'template' && scenario === 'web3') return { label: 'WEB3 / PROTOCOL', title: 'A read-only protocol snapshot', text: 'We will read public market, token, treasury, and development data. These are observations at this time, not claims that the market or protocol state is objectively correct.', look: 'LOOK HERE · ACTION CONSOLE FOR EACH SOURCE' };
  if (stage === 'action' && scenario === 'web3') {
    const text = source === 'HBAR PRICE' ? 'We are reading the public HBAR price used by this protocol snapshot.' : source === 'SAUCERSWAP POOL' ? 'We are reading a SaucerSwap pool snapshot. This is read-only market data; no trade is executed.' : 'We are reading public HTS token and treasury state from the Hedera Mirror Node.';
    return { label: `WEB3 · ${source}`, title: 'Reading a protocol input', text, look: 'LOOK HERE · ACTION CONSOLE FOR THE TECHNICAL FETCH' };
  }
  if (stage === 'scenario-complete' && scenario === 'web3') return { label: 'WEB3 · RECORDED', title: 'The protocol snapshot is complete', text: 'The observed protocol inputs are recorded and verified. This does not claim that the market was right; it shows what data was observed and when.', look: 'LOOK HERE · PROOF FOR THE VERIFIED RECEIPTS' };
  if (stage === 'infographic') return { label: 'FINAL COMPARISON', title: 'Two workflows, one verification path', text: 'The DevOps and Web3 workflows used different sources and adapters. Both became normalized records, received SHA-256 fingerprints, and were checked through the same Hedera and Mirror proof path.', look: 'LOOK HERE · PROOF ACTIVITY AND HASHSCAN' };
  if (stage === 'complete') return { label: 'DEMO COMPLETE', title: 'The shared proof layer is verified', text: 'Tracemark recorded what each workflow observed, created a deterministic fingerprint, anchored a compact proof to Hedera, and checked it through Mirror Node. The public transaction is available in HashScan.', look: 'LOOK HERE · PROOF FOR ALL RECORDS · HASHSCAN FOR PUBLIC EVIDENCE' };
  return { label: 'LIVE PRESENTATION', title: 'Waiting for the next technical step', text: 'The presentation will continue as the real adapter and proof flow advances.', look: 'LOOK HERE · ACTION CONSOLE / PROOF / HASHSCAN' };
}

function renderLiveNarrative(state) {
  const live = document.querySelector('#live-narrative');
  const intro = document.querySelector('#intro-slides');
  if (!live || !intro) return;
  const active = state?.status && state.status !== 'waiting' && state.stage && state.stage !== 'waiting';
  live.classList.toggle('active', Boolean(active));
  intro.style.display = active ? 'none' : '';
  if (!active) return;
  const narrative = liveNarrativeFor(state);
  document.querySelector('#live-label').textContent = narrative.label;
  document.querySelector('#live-title').textContent = narrative.title;
  document.querySelector('#live-text').textContent = narrative.text;
  document.querySelector('#live-look').textContent = narrative.look;
}

function renderState(state) {
  const proofs = Array.isArray(state?.proofs) ? state.proofs : [];
  const status = state?.status || 'waiting';
  const scenario = scenarioFor(state);
  const currentStage = stageFor(state);
  const latestProof = proofs[proofs.length - 1];
  renderLiveNarrative(state);
  document.querySelector('#status').textContent = status;
  document.querySelector('#progress').textContent = `${proofs.length} / ${RECORD_TOTAL} records`;
  document.querySelector('#activity-title').textContent = `${scenario.label} · ${scenario.title}`;
  document.querySelector('#activity-context').textContent = activityContextFor(state, latestProof);
  document.querySelector('#records').innerHTML = renderRecords(proofs);
  renderPipeline(state);

  const hashscan = latestProof?.hashscanUrl || '';
  const hashscanView = document.querySelector('#hashscan-view');
  if (hashscanView && hashscan && hashscanView.getAttribute('src') !== hashscan) hashscanView.setAttribute('src', hashscan);

  const currentRecord = state?.source || latestProof?.source || 'Waiting for the first record';
  const activityRecord = document.querySelector('#activity-record');
  if (activityRecord) activityRecord.textContent = `CURRENT RECORD · ${currentRecord} · STAGE ${currentStage.current} · ${resultFor(state, latestProof)}`;
}

let introSlide = 0;
const introSlides = [...document.querySelectorAll('.intro-slide')];
const introNext = document.querySelector('#intro-next');
const introCount = document.querySelector('#intro-count');
introNext?.addEventListener('click', () => {
  introSlide = (introSlide + 1) % introSlides.length;
  introSlides.forEach((slide, index) => slide.classList.toggle('active', index === introSlide));
  introCount.textContent = `${introSlide + 1} / ${introSlides.length}`;
  introNext.textContent = introSlide === introSlides.length - 1 ? 'Review again' : 'Next';
});

window.tracemark?.onState?.(renderState);
renderState({ status: 'waiting', stage: 'waiting', scenario: null, proofs: [] });
