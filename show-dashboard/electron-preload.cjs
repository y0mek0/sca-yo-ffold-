const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('tracemark', {
  writeTerminal(id, data) { ipcRenderer.send('terminal-input', { id, data }); },
  resizeTerminal(id, cols, rows) { ipcRenderer.send('terminal-resize', { id, cols, rows }); },
  onTerminalData(callback) { ipcRenderer.on('terminal-data', (_event, payload) => callback(payload)); },
  onTerminalExit(callback) { ipcRenderer.on('terminal-exit', (_event, payload) => callback(payload)); },
  onState(callback) { ipcRenderer.on('state', (_event, state) => callback(state)); }
});
