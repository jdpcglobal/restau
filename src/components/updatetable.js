import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { toast } from "react-toastify";  // Import toast
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toast
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

    setOrderItems((prevItems) => {
      const itemExists = prevItems.find((item) => item.name === selectedItem.name);
      if (itemExists) {
        // If the item already exists, increase its quantity
        return prevItems.map((item) =>
          item.name === selectedItem.name
            ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.price }
            : item
        );
      } else {
        // If the item doesn't exist, add it to the order
        return [
          ...prevItems,
          { name: selectedItem.name, price: selectedItem.price, quantity: 1, total: selectedItem.price },
        ];
      }
    });

    setCategoryItem(""); // Reset category item
  };

  // Change item quantity (increase or decrease)
  const handleQuantityChange = (index, delta) => {
    setOrderItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: Math.max(0, item.quantity + delta), // Prevent negative quantities
              total: (item.quantity + delta) * item.price,
            }
          : item
      ).filter((item) => item.quantity > 0) // Remove items with zero quantity
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

  // Handle update order and send to the backend
  const handleUpdateOrder = async () => {
    // Ensure the updated data is prepared correctly
    const updatedOrderData = {
      customerName, // Updated customer name
      mobileNumber, // Updated mobile number
      seatNumber,   // Updated seat number
      orderItems,   // Updated list of order items (with quantity and price)
      totalPrice: calculateTotalPrice(), // Updated total price
    };

    // Ensure you have the tableId
    if (!table._id) {
      console.error('Table ID is missing');
      return;
    }

    try {
      const response = await fetch('/api/updatetable', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId: table._id, // Ensure tableId is passed here
          updatedOrderData,   // Ensure updatedOrderData is passed here
        }),
      });

      const result = await response.json();

      if (response.ok) {
        console.log('Order updated successfully:', result);

        // Show success toast
        toast.success('Order updated successfully!', {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Pass the updated table data to the parent component
        onUpdate(result.table);  // Pass updated table data
        onClose();                // Close the popup after successful update
      } else {
        console.error(result.message || 'Failed to update the order');
      }
    } catch (error) {
      console.error('Error updating order:', error);
    }
  };
  const handleStatusChange = async (index, newStatus) => {
    const updatedItems = [...orderItems]; // Create a copy of the order items
    updatedItems[index].itemstatus = newStatus; // Update the status locally
  
    setOrderItems(updatedItems); // Update the local state
  
    try {
      // Make a PUT request to update the status in the backend
      const response = await fetch('/api/updateitemstatus', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tableId: table._id, // Assuming you have a `table` object available
          itemId: updatedItems[index]._id, // Use the unique ID of the item
          newStatus,
        }),
      });
  
      const result = await response.json();
  
      if (response.ok) {
        toast.success(`Item status updated to ${newStatus}`, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      } else {
        throw new Error(result.error || 'Failed to update status');
      }
    } catch (error) {
      toast.error(error.message || 'Error updating item status', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
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
          <input
            type="text"
            placeholder="Customer Name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Mobile Number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
          />
          <input
            type="number"
            placeholder="Pax"
            value={seatNumber}
            onChange={(e) => setSeatNumber(e.target.value)}
          />
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
          <select
            value={categoryItem}
            onChange={(e) => setCategoryItem(e.target.value)}
            disabled={!category}
          >
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
                        <button onClick={() => handleQuantityChange(index, -1)}>-</button>
                        {item.quantity}
                        <button onClick={() => handleQuantityChange(index, 1)}>+</button>
                      </div>
                    </div>
                  </td>
                  <td>
      <select
        value={item.itemstatus || "Pending"} // Default to "Pending" if no status is set
        onChange={(e) => handleStatusChange(index, e.target.value)} // Handle status change
        className="status-dropdown1"
      >
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
                    <button onClick={() => handleDeleteItem(index)} className="delete-button">
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
          <button onClick={handleUpdateOrder} disabled={loading}>
        {loading ? "Updating..." : `Update Order (₹${calculateTotalPrice()})`}
           {/* Update Order (₹{calculateTotalPrice()})  */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdatePopup;
