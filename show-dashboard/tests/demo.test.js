const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { spawnSync } = require('node:child_process');

const DEMO_DIR = path.resolve(__dirname, '..');
const files = {
  shell: path.join(DEMO_DIR, 'electron-shell.html'),
  main: path.join(DEMO_DIR, 'electron-main.cjs'),
  preload: path.join(DEMO_DIR, 'electron-preload.cjs'),
  renderer: path.join(DEMO_DIR, 'electron-renderer.js'),
  orchestrator: path.join(DEMO_DIR, 'orchestrator.js'),
  panels: path.join(DEMO_DIR, 'panels.js'),
  documentProof: path.join(DEMO_DIR, 'document-proof.cjs'),
  infographicTemplate: path.join(DEMO_DIR, 'infographic-template.html'),
  launcher: path.join(DEMO_DIR, 'run-control-room.bat')
};

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

test('show-dashboard contains the runnable Electron entry points', () => {
  for (const file of Object.values(files)) assert.equal(fs.existsSync(file), true, file);
});

test('show-dashboard JavaScript has valid syntax', () => {
  for (const file of [files.main, files.preload, files.renderer, files.orchestrator, files.panels, files.documentProof]) {
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    assert.equal(result.status, 0, `${file}: ${result.stderr || result.stdout}`);
  }
});

test('orchestrator contains the two planned scenarios and real verification', () => {
  const source = read(files.orchestrator);
  assert.match(source, /DEVOPS \/ SRE|RELEASE SAFETY GATE/);
  assert.match(source, /WEB3 \/ PROTOCOL|PROTOCOL HEALTH DASHBOARD/);
  assert.match(source, /watch-github-release\.ts/);
  assert.match(source, /watch-github-issues\.ts/);
  assert.match(source, /watch-hbar-price\.ts/);
  assert.match(source, /watch-saucerswap-snapshot\.ts/);
  assert.match(source, /watch-hts-treasury\.ts/);
  assert.match(source, /Mirror digest mismatch/);
  assert.match(source, /hashscanUrl/);
  assert.match(source, /await sleep\(PAUSE\)/);
});

test('presentation narration lives in the large left panel', () => {
  const shell = read(files.shell);
  const renderer = read(files.renderer);
  const panels = read(files.panels);
  assert.match(shell, /live-narrative/);
  assert.match(renderer, /liveNarrativeFor/);
  assert.match(renderer, /Release Safety Gate/);
  assert.match(renderer, /SHA-256 fingerprint/);
  assert.match(panels, /presentation=large left panel/);
  assert.match(panels, /STATE \/ /);
  assert.doesNotMatch(panels, /STARTING THE PRESENTATION/);
});

test('fresh launcher resets the previous run before showing intro', () => {
  const main = read(files.main);
  assert.match(main, /function resetState\(\)/);
  assert.match(main, /stage: 'waiting'/);
  assert.match(main, /proofs: \[\]/);
  assert.match(main, /resetState\(\);/);
});

test('HashScan evidence opens as a real child transaction window', () => {
  const main = read(files.main);
  assert.match(main, /hashscanWindow/);
  assert.match(main, /title: 'HashScan \/ Hedera transaction'/);
  assert.match(main, /loadURL\('https:\/\/hashscan\.io'\)/);
  assert.match(main, /history\.pushState/);
});

test('launcher points at the repository and starts the control room', () => {
  const launcher = read(files.launcher);
  assert.match(launcher, /TRACEMARK_REPO=/);
  assert.match(launcher, /npm start/);
  assert.match(launcher, /electron/);
});

test('panels use persistent updates instead of clear-screen flicker', () => {
  const panels = read(files.panels);
  assert.doesNotMatch(panels, /function clear\(/);
  assert.match(panels, /lastEvent/);
  assert.match(panels, /proofRows/);
});

test('intro copy preserves the two scenario explanation', () => {
  const html = read(files.shell);
  assert.match(html, /THE PRODUCT/);
  assert.match(html, /WHO USES IT/);
  assert.match(html, /THIS CONTROL ROOM/);
  assert.match(html, /Action Console/);
  assert.match(html, /HashScan/);
});
