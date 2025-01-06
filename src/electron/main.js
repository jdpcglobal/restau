const { app, BrowserWindow, ipcMain, ipcRenderer, session } = require('electron');
const path = require('path');

// Create the Electron window
function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'randerer.js'), // Preload script to expose Electron functionality
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadURL('http://localhost:3000'); // Change this to your Next.js app URL
}

// Handle the 'get-printers' IPC call
ipcMain.handle('get-printers', () => {
  const printers = require('electron').webContents.getPrinters(); // Get printers list
  return printers;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
