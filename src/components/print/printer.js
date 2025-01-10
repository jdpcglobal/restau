import React, { useState, useEffect } from 'react';
import './Printer.css'; // Import the CSS file for styles

const Printer = () => {
  const [printers, setPrinters] = useState([]);
  const [deliveryBillPrinters, setDeliveryBillPrinters] = useState([]);
  const [tableBillPrinters, setTableBillPrinters] = useState([]);
  const [kitchenBillPrinters, setKitchenBillPrinters] = useState([]);

  useEffect(() => {
    // Mock fetching printers (replace this with real API or Electron function)
    setPrinters(['Printer 1', 'Printer 2', 'Printer 3']);
  }, []);

  const handlePrinterChange = (type, value) => {
    if (value === '') return;

    if (type === 'delivery') {
      setDeliveryBillPrinters([...deliveryBillPrinters, value]);
    } else if (type === 'table') {
      setTableBillPrinters([...tableBillPrinters, value]);
    } else if (type === 'kitchen') {
      setKitchenBillPrinters([...kitchenBillPrinters, value]);
    }
  };

  const handlePrinterDelete = (type, index) => {
    if (type === 'delivery') {
      const updatedPrinters = deliveryBillPrinters.filter((_, i) => i !== index);
      setDeliveryBillPrinters(updatedPrinters);
    } else if (type === 'table') {
      const updatedPrinters = tableBillPrinters.filter((_, i) => i !== index);
      setTableBillPrinters(updatedPrinters);
    } else if (type === 'kitchen') {
      const updatedPrinters = kitchenBillPrinters.filter((_, i) => i !== index);
      setKitchenBillPrinters(updatedPrinters);
    }
  };

  const getAvailablePrinters = (type) => {
    const selectedPrinters =
      type === 'delivery'
        ? deliveryBillPrinters
        : type === 'table'
        ? tableBillPrinters
        : kitchenBillPrinters;
    return printers.filter((printer) => !selectedPrinters.includes(printer));
  };

  return (
    <div className="printer-container1">
      <h3 className="printer-title1">Select Printers for Delivery, Table, and Kitchen Bills</h3>
      <div className="printer-columns1">
        {/* Delivery Bill Column */}
        <div className="printer-column1">
          <h4 className="column-title1">Delivery Bill</h4>
          {deliveryBillPrinters.map((selectedPrinter, index) => (
            <div key={`delivery-${index}`} className="printer-row1 selected1">
              <label className="printer-label1">Printer {index + 1}:</label>
              <span className="printer-name1">{selectedPrinter}</span>
              <span
                className="delete-icon1"
                onClick={() => handlePrinterDelete('delivery', index)}
              >
                <img src="bin.png" alt="Delete" className="delete-icon-image1" />
              </span>
            </div>
          ))}
          {getAvailablePrinters('delivery').length > 0 && (
            <div className="printer-row1">
              <label className="printer-label1">Add Printer:</label>
              <select
                className="printer-select1"
                onChange={(e) => handlePrinterChange('delivery', e.target.value)}
                value=""
              >
                <option value="">-- Select Printer --</option>
                {getAvailablePrinters('delivery').map((printer, i) => (
                  <option key={`delivery-option-${i}`} value={printer}>
                    {printer}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Table Bill Column */}
        <div className="printer-column1">
          <h4 className="column-title1">Table Bill</h4>
          {tableBillPrinters.map((selectedPrinter, index) => (
            <div key={`table-${index}`} className="printer-row1 selected1">
              <label className="printer-label1">Printer {index + 1}:</label>
              <span className="printer-name1">{selectedPrinter}</span>
              <span
                className="delete-icon1"
                onClick={() => handlePrinterDelete('table', index)}
              >
                <img src="bin.png" alt="Delete" className="delete-icon-image1" />
              </span>
            </div>
          ))}
          {getAvailablePrinters('table').length > 0 && (
            <div className="printer-row1">
              <label className="printer-label1">Add Printer:</label>
              <select
                className="printer-select1"
                onChange={(e) => handlePrinterChange('table', e.target.value)}
                value=""
              >
                <option value="">-- Select Printer --</option>
                {getAvailablePrinters('table').map((printer, i) => (
                  <option key={`table-option-${i}`} value={printer}>
                    {printer}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Kitchen Bill Column */}
        <div className="printer-column1">
          <h4 className="column-title1">Kitchen Bill</h4>
          {kitchenBillPrinters.map((selectedPrinter, index) => (
            <div key={`kitchen-${index}`} className="printer-row1 selected1">
              <label className="printer-label1">Printer {index + 1}:</label>
              <span className="printer-name1">{selectedPrinter}</span>
              <span
                className="delete-icon1"
                onClick={() => handlePrinterDelete('kitchen', index)}
              >
                <img src="bin.png" alt="Delete" className="delete-icon-image1" />
              </span>
            </div>
          ))}
          {getAvailablePrinters('kitchen').length > 0 && (
            <div className="printer-row1">
              <label className="printer-label1">Add Printer:</label>
              <select
                className="printer-select1"
                onChange={(e) => handlePrinterChange('kitchen', e.target.value)}
                value=""
              >
                <option value="">-- Select Printer --</option>
                {getAvailablePrinters('kitchen').map((printer, i) => (
                  <option key={`kitchen-option-${i}`} value={printer}>
                    {printer}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Printer;
