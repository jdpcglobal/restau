import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../components/AddTableOrder/AddTableOrder.css";

const UpdatePopup = ({ table, onClose, onUpdate }) => {
  const [orderItems, setOrderItems] = useState(table.orderItems || []);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryItem, setCategoryItem] = useState("");
  const [customerName, setCustomerName] = useState(table.customerName || "");
  const [mobileNumber, setMobileNumber] = useState(table.mobileNumber || "");
  const [seatNumber, setSeatNumber] = useState(table.seatNumber || "");
  const [loading, setLoading] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, []);

  // Fetch items based on category
  useEffect(() => {
    const fetchItems = async () => {
      if (!category) return;

      try {
        const response = await fetch(`/api/itemtable?category=${category}`);
        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, [category]);

  // Add item to the order
  const handleAddItem = () => {
    if (!categoryItem) return;

    const selectedItem = items.find((item) => item.name === categoryItem);
    if (!selectedItem) return;

    const newItem = {
      name: selectedItem.name,
      price: selectedItem.price,
      quantity: 1,
      total: selectedItem.price,
      itemstatus: "Pending", // Default status
    };

    setOrderItems((prevItems) => {
      const pendingItems = prevItems.filter((item) => item.name === categoryItem && item.itemstatus === "Pending");
      if (pendingItems.length > 0) {
        return prevItems.map((item) =>
          item.name === categoryItem && item.itemstatus === "Pending"
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [...prevItems, newItem];
    });

    setCategoryItem(""); // Reset category item
  };

  // Change item quantity (only for "Pending" status)
  const handleQuantityChange = (index, delta) => {
    setOrderItems((prevItems) =>
      prevItems.map((item, i) => {
        if (i === index && item.itemstatus === "Pending") {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity, total: newQuantity * item.price };
        }
        return item;
      })
    );
  };

  // Delete item from the order
  const handleDeleteItem = (index) => {
    setOrderItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  // Calculate total order price
  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => total + item.total, 0);
  };

  // Handle status change
  const handleStatusChange = async (index, newStatus) => {
    // Update the status in the local state
    const updatedItems = [...orderItems];
    updatedItems[index].itemstatus = newStatus;
    setOrderItems(updatedItems);
  
    // Make an API call to update the status in the database
    try {
      const response = await fetch("/api/updateitems", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: table._id, // Table ID
          itemId: orderItems[index]._id, // Item ID
          newStatus, // New status selected by the user
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        // Show success toast notification
        toast.success("Status updated successfully!", { position: "top-right", autoClose: 3000 });
      } else {
        toast.error(result.message || "Failed to update status.", { position: "top-right", autoClose: 3000 });
      }
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error updating status.", { position: "top-right", autoClose: 3000 });
    }
  };
  

  // Handle update order and send to the backend
  const handleUpdateOrder = async () => {
    const updatedOrderData = {
      customerName,
      mobileNumber,
      seatNumber,
      orderItems,
      totalPrice: calculateTotalPrice(),
    };

    if (!table._id) {
      console.error("Table ID is missing");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/updatetable", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tableId: table._id,
          updatedOrderData,
        }),
      });

      const result = await response.json();
      setLoading(false);

      if (response.ok) {
        toast.success("Order updated successfully!", { autoClose: 3000 });
        onUpdate(result.table);
        onClose();
      } else {
        console.error(result.message || "Failed to update the order");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error updating order:", error);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="top-row">
          <h2>Table No: {table.tableNumber}</h2>
          <h2>Max Pax: {table.maxPax}</h2>
        </div>
        <div className="input-row">
          <input type="text" placeholder="Customer Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
          <input type="text" placeholder="Mobile Number" value={mobileNumber} onChange={(e) => setMobileNumber(e.target.value)} />
          <input type="number" placeholder="Pax" value={seatNumber} onChange={(e) => setSeatNumber(e.target.value)} />
        </div>
        <div className="input-row">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </select>
          <select value={categoryItem} onChange={(e) => setCategoryItem(e.target.value)} disabled={!category}>
            <option value="">Select Item</option>
            {items.map((item) => (
              <option key={item._id} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
          <button onClick={handleAddItem}>Add</button>
        </div>
        <div className="order-items-container">
          <table>
            <thead>
              <tr>
                <th>S.No.</th>
                <th>Item Name</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Price</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>
                  <div className="order-incress">
                  <div className="quantity-order">
                    <button onClick={() => handleQuantityChange(index, -1)} disabled={item.itemstatus !== "Pending"}>
                      -
                    </button>
                    {item.quantity}
                    <button onClick={() => handleQuantityChange(index, 1)} disabled={item.itemstatus !== "Pending"}>
                      +
                    </button>
                    </div>
                    </div>
                  </td>
                  <td>
                    <select  className="status-dropdown1" value={item.itemstatus} onChange={(e) => handleStatusChange(index, e.target.value)}>
                      <option value="Pending">Pending</option>
                      <option value="Preparing">Preparing</option>
                      <option value="Ready">Ready</option>
                      <option value="Served">Served</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td>{item.price}</td>
                  <td>{item.total}</td>
                  <td>
                    <button  className="delete-button" onClick={() => handleDeleteItem(index)} disabled={item.itemstatus !== "Pending"}>
                      <FontAwesomeIcon icon={faTimes} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bottom-row">
          <button onClick={onClose}>Close</button>
          <button onClick={handleUpdateOrder}>{loading ? "Updating..." : `Update Order (₹${calculateTotalPrice()})`}</button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePopup;
