import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import "./AddTableOrder.css";
import { toast, ToastContainer } from "react-toastify"; // Importing toast and ToastContainer
import "react-toastify/dist/ReactToastify.css";

const AddTableOrder = ({ selectedTable, totalSeats, onClose, onPlaceOrder }) => {
  const [customerName, setCustomerName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [seatNumber, setSeatNumber] = useState("");
  const [category, setCategory] = useState("");
  const [categoryItem, setCategoryItem] = useState("");
  const [orderItems, setOrderItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [customerNameError, setCustomerNameError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

  // Fetch items for a selected category
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

  // Add item to order
  const handleAddItem = () => {
    if (!categoryItem) return;

    const selectedItem = items.find((item) => item.name === categoryItem);
    if (!selectedItem) return;

    const existingItemIndex = orderItems.findIndex((item) => item.name === selectedItem.name);

    if (existingItemIndex !== -1) {
      setOrderItems((prevItems) =>
        prevItems.map((item, index) =>
          index === existingItemIndex
            ? {
                ...item,
                quantity: item.quantity + 1,
                total: (item.quantity + 1) * item.price,
              }
            : item
        )
      );
    } else {
      const newItem = {
        name: selectedItem.name,
        price: selectedItem.price,
        quantity: 1,
        total: selectedItem.price,
      };
      setOrderItems((prevItems) => [...prevItems, newItem]);
    }

    setCategoryItem("");
  };

  // Handle quantity change
  const handleQuantityChange = (index, delta) => {
    setOrderItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              quantity: item.quantity + delta,
              total: (item.quantity + delta) * item.price,
            }
          : item
      ).filter((item) => item.quantity > 0)
    );
  };

  // Delete item from order
  const handleDeleteItem = (index) => {
    setOrderItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return orderItems.reduce((total, item) => total + item.total, 0);
  };

  // Place order and save to database
  const handlePlaceOrder = async () => {
    if (!customerName) {
      setCustomerNameError(true);
      return;
    }
  
    const orderData = {
      customerName,
      mobileNumber,
      seatNumber,
      tableNumber: selectedTable,
      maxPax: totalSeats,
      orderItems,
      totalPrice: calculateTotalPrice(),
    };
  
    try {
      setLoading(true);
      const response = await fetch("/api/savetable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        // Update table status to "occupied"
        const updateResponse = await fetch("/api/updatestatus1", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tableName: selectedTable,
            status: "occupied",
          }),
        });
  
        const updateData = await updateResponse.json();
  
        if (updateResponse.ok) {
          toast.success("Order added and table status updated successfully!", {
            autoClose: 3000,
          });
  
          // Reset form and close popup
          onClose();
          onPlaceOrder(data);
          setCustomerName("");
          setMobileNumber("");
          setSeatNumber("");
          setOrderItems([]);
        } else {
          toast.error(updateData.error || "Failed to update table status", {
            autoClose: 3000,
          });
        }
      } else {
        toast.error(data.message || "Failed to place the order", {
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast.error("An error occurred while placing the order", {
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <div className="top-row">
          <h2>Table No: {selectedTable}</h2>
          <h2>Max Pax: {totalSeats}</h2>
        </div>

        <div className="input-row">
          <input
            type="text"
            placeholder="Customer Name *"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className={customerNameError ? "error" : ""}
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
          <button onClick={handlePlaceOrder} disabled={loading}>
            {loading ? "Placing Order..." : `Place Order (₹${calculateTotalPrice()})`}
          </button>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default AddTableOrder;
