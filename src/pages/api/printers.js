// pages/api/printers.js

export default async function handler(req, res) {
    const { getPrinters } = require('electron').remote.require('./electron/renderer');
  
    // Call the Electron function to get the printers list
    try {
      const printers = await getPrinters();
      res.status(200).json(printers);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get printers' });
    }
  }
  