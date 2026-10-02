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

function renderState(state) {
  const proofs = Array.isArray(state?.proofs) ? state.proofs : [];
  const status = state?.status || 'waiting';
  const scenario = scenarioFor(state);
  const currentStage = stageFor(state);
  const latestProof = proofs[proofs.length - 1];
  document.querySelector('#status').textContent = status;
  document.querySelector('#progress').textContent = `${proofs.length} / ${RECORD_TOTAL} records`;
  document.querySelector('#activity-title').textContent = `${scenario.label} · ${scenario.title}`;
  document.querySelector('#activity-context').textContent = state?.comment || scenario.description;
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
