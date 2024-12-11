import React, { useState, useEffect } from "react";
import "./ViewBillPopup.css";

const ViewBillPopup = ({ table, onClose }) => {
  const [extraDiscount, setExtraDiscount] = useState(0);
  const [finalPrice, setFinalPrice] = useState(table.totalPrice);

  useEffect(() => {
    calculateFinalPrice();
  }, [extraDiscount]);

  const calculateFinalPrice = () => {
    const totalDiscount = table.orderItems.reduce((total, item) => {
      const itemPrice = item.price * item.quantity;
      return total + (itemPrice * item.discount) / 100;
    }, 0);

    const discountedTotal = table.totalPrice - totalDiscount;

    // Extra discount on the already discounted total
    const extraDiscountAmount = (discountedTotal * extraDiscount) / 100;

    // GST on the final discounted amount
    const gstAmount = table.orderItems.reduce((gstTotal, item) => {
      const itemPrice = item.price * item.quantity;
      const itemDiscountedPrice = itemPrice - (itemPrice * item.discount) / 100;
      const itemExtraDiscountedPrice = itemDiscountedPrice - (itemDiscountedPrice * extraDiscount) / 100;
      return gstTotal + (itemExtraDiscountedPrice * item.gstRate) / 100;
    }, 0);

    // Final price calculation
    const calculatedFinalPrice = discountedTotal - extraDiscountAmount + gstAmount;
    setFinalPrice(calculatedFinalPrice);
  };

  const totalDiscount = table.orderItems.reduce((total, item) => {
    return total + (item.price * item.quantity * item.discount) / 100;
  }, 0);

  const gstOnDiscountedPrice = table.orderItems.reduce((gstTotal, item) => {
    const itemPrice = item.price * item.quantity;
    const discountedPrice = itemPrice - (itemPrice * item.discount) / 100;
    return gstTotal + (discountedPrice * item.gstRate) / 100;
  }, 0);

  return (
    <div className="popup-overlay1">
      <div className="popup-content1">
        <div className="popup-header1">
          <h2>Restaurant Table Order</h2>
          <button className="close-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        {/* Customer and Table Details */}
        <div className="details-row">
          <div className="details-item">
            <strong className="customer-name1">Customer Name:</strong>
            <span className="customer-name"> {table.customerName}</span>
          </div>
          <div className="details-item">
            <strong className="customer-name1">Table Number:</strong>
            <span className="customer-name"> {table.tableNumber}</span>
          </div>
        </div>
        <div className="details-row">
          <div className="details-item">
            <strong className="customer-name1">Bill Amount:</strong>
            <span className="customer-name"> ₹{finalPrice.toFixed(2)}</span>
          </div>
          <div className="details-item">
            <strong className="customer-name1">Bill Date:</strong>
            <span className="customer-name">
              {new Date(table.createdAt).toLocaleDateString()}{" "}
              {new Date(table.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>

        {/* Ordered Items */}
        <div className="food-items">
          <h3 className="center-title">Ordered Food</h3>
          <table className="food-table">
            <thead>
              <tr>
                <th>S.No</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Price (₹)</th>
              </tr>
            </thead>
            <tbody>
              {table.orderItems.map((item, index) => (
                <tr key={item.itemId}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.quantity}</td>
                  <td>{(item.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Discounts and GST Section */}
        <div className="extra-section">
          <div className="extra-item">
            <strong className="customer-name1">Total Price:</strong>
            <span className="customer-name"> ₹{table.totalPrice.toFixed(2)}</span>
          </div>
          <div className="extra-item">
            <strong className="customer-name1">Discount:</strong>
            <span className="customer-name"> -₹{totalDiscount.toFixed(2)}</span>
          </div>
          <div className="extra-item">
            <strong className="customer-name1">Extra Discount:</strong>
            <span className="customer-name">
              -₹{(
                ((table.totalPrice - totalDiscount) * extraDiscount) / 100
              ).toFixed(2)}
            </span>
          </div>
          <div className="extra-item">
            <strong className="customer-name1">GST:</strong>
            <span className="customer-name"> +₹{gstOnDiscountedPrice.toFixed(2)}</span>
          </div>
          <div className="extra-item extra-discount">
            <input
              type="number"
              className="discount-input"
              placeholder="Enter Extra Discount (%)"
              value={extraDiscount || ""}
              onChange={(e) => setExtraDiscount(Number(e.target.value) || 0)}
              style={{ width: "150px" }}
            />
          </div>
        </div>

        {/* Footer Section */}
        <div className="popup-footer">
          <button className="print-btn" onClick={() => window.print()}>
            Print Bill
          </button>
          <div className="final-total">
            <strong>Final Total:</strong> ₹{finalPrice.toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewBillPopup;
