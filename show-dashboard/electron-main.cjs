const { app, BrowserWindow, ipcMain, session, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const http = require('node:http');
const { spawn } = require('node:child_process');
const pty = require('node-pty');

const DEMO_DIR = __dirname;
const REPO = process.env.TRACEMARK_REPO || 'C:\\Users\\azi\\Documents\\prro_grams\\hackaton-now\\hedera-bounty';
const STATE_FILE = path.join(DEMO_DIR, 'runtime', 'state.json');
const PORT = 4173;
let mainWindow;
let demoServer;
let bridgeServer;
const terminals = new Map();
let stateTimer;
let cleanedUp = false;
const rawNodeCommand = process.env.TRACEMARK_NODE || 'node';
const nodeCommand = rawNodeCommand.replace(/^\"|\"$/g, '');


app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-gpu-compositing');

function resetState() {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify({
    stage: 'waiting',
    status: 'waiting',
    scenario: null,
    active: null,
    source: null,
    proofs: []
  }, null, 2));
}

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8')); }
  catch { return { stage: 'intro', status: 'waiting', active: 'START', proofs: [] }; }
}

function startDemoServer() {
  demoServer = spawn(nodeCommand, [path.join(DEMO_DIR, 'serve-demo.cjs')], {
    cwd: DEMO_DIR,
    env: process.env,
    windowsHide: true,
    detached: true,
    stdio: 'ignore'
  });
  demoServer.unref();
}

function startBridge() {
  bridgeServer = http.createServer((req, res) => {
    if (req.method !== 'POST' || req.url !== '/evidence') {
      res.writeHead(404); res.end(); return;
    }
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        openEvidence(payload.url, Number(payload.holdMs) || 3200);
        res.writeHead(204); res.end();
      } catch (error) {
        res.writeHead(400, { 'Content-Type': 'text/plain' }); res.end(error.message);
      }
    });
  });
  bridgeServer.listen(4174, '127.0.0.1');
}

function openEvidence(url) {
  if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isDestroyed()) {
    mainWindow.webContents.send('hashscan-url', url);
  }
}

function spawnTerminal(id, command, args, cwd = DEMO_DIR) {
  const shell = process.platform === 'win32' ? 'cmd.exe' : process.env.SHELL || 'bash';
  const quote = (value) => /[\s&()]/.test(value) ? `"${value.replaceAll('"', '\\"')}"` : value;
  const commandLine = [command, ...args].map(quote).join(' ');
  const shellArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', `chcp 65001>nul && ${commandLine}`]
    : [command, ...args];
  const child = pty.spawn(shell, shellArgs, {
    name: 'xterm-color', cols: 120, rows: 30, cwd,
    env: {
      ...process.env,
      TRACEMARK_REPO: REPO,
      TRACEMARK_EVIDENCE_BRIDGE: 'http://127.0.0.1:4174/evidence',
      FORCE_COLOR: '1',
      TERM: 'xterm-256color'
    },
    useConpty: true
  });
  terminals.set(id, child);
  child.onData((data) => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isDestroyed()) {
      mainWindow.webContents.send('terminal-data', { id, data });
    }
  });
  child.onExit((event) => {
    if (terminals.get(id) === child) terminals.delete(id);
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isDestroyed()) {
      mainWindow.webContents.send('terminal-exit', { id, code: event.exitCode });
    }
  });
}

function startTerminals() {

  spawnTerminal('action', nodeCommand, [path.join(DEMO_DIR, 'panels.js'), 'commentary', '--controller']);
  spawnTerminal('deployment', nodeCommand, [path.join(DEMO_DIR, 'panels.js'), 'deployment']);
  spawnTerminal('proof', nodeCommand, [path.join(DEMO_DIR, 'panels.js'), 'proof']);
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    minWidth: 1180,
    minHeight: 720,
    title: 'TRACEMARK / CONTROL ROOM',
    backgroundColor: '#202729',
    autoHideMenuBar: true,
    webPreferences: { preload: path.join(DEMO_DIR, 'electron-preload.cjs'), contextIsolation: true, sandbox: false, webviewTag: true }
  });
  mainWindow.loadFile(path.join(DEMO_DIR, 'electron-shell.html'));
  mainWindow.webContents.once('did-finish-load', () => {
    startTerminals();
    stateTimer = setInterval(() => {
      if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.webContents.isDestroyed()) {
        mainWindow.webContents.send('state', readState());
      }
    }, 400);
  });
  mainWindow.on('closed', () => {
    mainWindow = null;
    cleanup();
  });
}

ipcMain.on('terminal-input', (_event, { id, data }) => terminals.get(id)?.write(data));
ipcMain.on('terminal-resize', (_event, { id, cols, rows }) => terminals.get(id)?.resize(cols, rows));
ipcMain.handle('open-external', async (_event, url) => {
  if (typeof url !== 'string' || !/^https:\/\/(hashscan\.io|testnet\.mirrornode\.hedera\.com)\//.test(url)) return false;
  await shell.openExternal(url);
  return true;
});

const singleInstance = app.requestSingleInstanceLock();
if (!singleInstance) {
  app.quit();
} else {
  app.on('second-instance', () => mainWindow?.show());
  app.whenReady().then(() => {
    resetState();
    session.defaultSession.setPermissionRequestHandler((_webContents, _permission, callback) => callback(false));
    startDemoServer();
    startBridge();
    createWindow();
  });
}

function cleanup() {
  if (cleanedUp) return;
  cleanedUp = true;
  if (stateTimer) { clearInterval(stateTimer); stateTimer = null; }
  for (const [id, terminal] of terminals) {
    terminals.delete(id);
    try { terminal.kill(); } catch {}
  }
  try { bridgeServer?.close(); } catch {}
  try { demoServer?.kill(); } catch {}
}

app.on('before-quit', cleanup);
app.on('window-all-closed', () => {
  cleanup();
  if (process.platform !== 'darwin') app.quit();
});
