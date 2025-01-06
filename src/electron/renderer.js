const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electron', {
  getPrinters: () => ipcRenderer.invoke('get-printers'),
});
