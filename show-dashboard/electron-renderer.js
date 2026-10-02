const outputs = new Map();
const inputById = new Map();
const TERMINAL_TEXT = '#e9eee9';

function cleanTerminalText(data) {
  return data
    .replace(/\x1b\][^\x07]*(?:\x07|\x1b\\)/g, '')
    .replace(/\x1b\[[0-?]*[ -/]*[@-~]/g, '')
    .replace(/[\u0000\r]/g, '')
    .replace(/\n{3,}/g, '\n\n');
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

function renderState(state) {
  const proofs = Array.isArray(state?.proofs) ? state.proofs : [];
  const status = state?.status || 'waiting';
  document.querySelector('#status').textContent = status;
  document.querySelector('#progress').textContent = `${proofs.length} / 4 records`;
  const latestProof = proofs[proofs.length - 1];
  const hashscan = latestProof?.hashscanUrl || '';
  const hashscanView = document.querySelector('#hashscan-view');
  if (hashscanView && hashscan && hashscanView.getAttribute('src') !== hashscan) hashscanView.setAttribute('src', hashscan);
  document.querySelector('#records').innerHTML = proofs.length ? proofs.map((p) => `<div class="record"><div class="rtype">${p.kind || 'proof'}</div><div><div class="rtitle">${p.title || p.source || 'Proof record'}</div><div class="rmeta">sequence ${p.sequence ?? 'pending'} · ${p.digest ? p.digest.slice(0, 18) + '…' : 'digest pending'}</div></div><div class="rstate ${p.status === 'failed' ? 'fail' : p.status === 'verified' ? '' : 'pending'}">${p.status || 'pending'}</div></div>`).join('') : '<div class="rmeta" style="padding-top:18px">No records yet. Type go to start.</div>';
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
renderState({ status: 'waiting', stage: 'Waiting for go', proofs: [] });
