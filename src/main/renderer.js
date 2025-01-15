const { ipcRenderer } = require('electron');

const connectToPrinter = async () => {
  try {
    const printer = await ipcRenderer.invoke('connect-printer');
    console.log('Printer connected:', printer);

    // You can now start monitoring and use the printer object as needed
  } catch (error) {
    console.error('Error connecting to printer:', error);
  }
};

// Call connectToPrinter when needed, like on a button click
document.getElementById('connect-btn').addEventListener('click', connectToPrinter);
