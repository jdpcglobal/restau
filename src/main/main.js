const { app, BrowserWindow, ipcMain } = require('electron');
const noble = require('noble');  // For Bluetooth scanning
const printer = require('printer');  // For USB and Wi-Fi printers

let mainWindow;

// Create the window
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,  // Enable node integration in the renderer process
    },
  });

  mainWindow.loadURL('http://localhost:3000');  // Your React app URL
}

// Function to list USB and Wi-Fi printers
function getPrinters() {
  const usbWiFiPrinters = printer.getPrinters();  // Get available USB and Wi-Fi printers
  return usbWiFiPrinters;
}

// Function to scan for Bluetooth devices
function scanBluetooth() {
  return new Promise((resolve, reject) => {
    let bluetoothDevices = [];

    noble.on('stateChange', (state) => {
      if (state === 'poweredOn') {
        noble.startScanning([], true);  // Start scanning for Bluetooth devices
      } else {
        reject('Bluetooth is not powered on');
      }
    });

    noble.on('discover', (peripheral) => {
      if (peripheral.advertisement.localName) {
        bluetoothDevices.push({
          name: peripheral.advertisement.localName,
          address: peripheral.address,
        });
      }
    });

    // Stop scanning after 5 seconds to avoid endless scanning
    setTimeout(() => {
      noble.stopScanning();
      resolve(bluetoothDevices);
    }, 5000);
  });
}

// IPC handler to get printers
ipcMain.handle('getPrinters', async () => {
  try {
    // Fetch USB and Wi-Fi printers
    const usbWiFiPrinters = getPrinters();
    // Fetch Bluetooth printers
    const bluetoothPrinters = await scanBluetooth();

    // Combine both types of printers (USB/Wi-Fi and Bluetooth)
    const allPrinters = [
      ...usbWiFiPrinters.map(printer => ({ name: printer.name, type: 'USB/Wi-Fi' })),
      ...bluetoothPrinters.map(device => ({ name: device.name, type: 'Bluetooth' })),
    ];

    return allPrinters;  // Return combined list of printers
  } catch (error) {
    console.error('Error retrieving printers:', error);
    return [];
  }
});

app.whenReady().then(() => {
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
