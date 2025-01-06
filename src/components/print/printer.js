import React, { useState, useEffect } from 'react';
import './Printer.css'; // Import the CSS file for styles

const Printer = () => {
  const [printers, setPrinters] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState('');

  useEffect(() => {
    // Ensure the code runs only on the client-side (browser environment)
    if (typeof window !== 'undefined' && window.electron) {
      const fetchPrinters = async () => {
        const printerList = await window.electron.getPrinters(); // Access the getPrinters function from preload.js
        setPrinters(printerList);
      };

      fetchPrinters();
    }
  }, []);

  const handlePrinterChange = (event) => {
    setSelectedPrinter(event.target.value);
  };

  return (
    <div className="printer-container">
      <h3 className="printer-title">Select a Printer</h3>
      <select
        className="printer-select"
        value={selectedPrinter}
        onChange={handlePrinterChange}
      >
        <option value="">-- Select Printer --</option>
        {printers.map((printer, index) => (
          <option key={index} value={printer}>
            {printer}
          </option>
        ))}
      </select>

      <div className="printer-info">
        <p>Selected Printer: {selectedPrinter || 'None'}</p>
      </div>
    </div>
  );
};

export default Printer;
