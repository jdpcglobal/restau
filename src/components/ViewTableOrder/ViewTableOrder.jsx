import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import UpdatePopup from "../../components/updatetable"; // Ensure the path to UpdatePopup is correct
import "react-toastify/dist/ReactToastify.css"; // Import styles for react-toastify
import "./ViewTableOrder.css"; // Ensure your CSS file path is correct

const AddTableContent = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTable, setSelectedTable] = useState(null); // For the update popup
  const [showPopup, setShowPopup] = useState(false); // Toggle the update popup visibility

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await fetch("/api/findtables");
        const data = await response.json();
        if (response.ok) {
          setTables(data);
        } else {
          setError(data.message || "Something went wrong");
        }
      } catch (err) {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchTables();
  }, []);

  const handleStatusChange = async (tableId, newStatus) => {
    try {
      const response = await fetch(`/api/updatestatus`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tableId, status: newStatus }),
      });

      if (response.ok) {
        setTables((prevTables) =>
          prevTables.map((table) =>
            table._id === tableId ? { ...table, status: newStatus } : table
          )
        );
        toast.success("Status updated successfully!");
      } else {
        const data = await response.json();
        toast.error(data.message || "Failed to update status");
      }
    } catch (err) {
      toast.error("Error updating status");
    }
  };

  const formatDate = (date) => {
    const newDate = new Date(date);
    return `${newDate.toLocaleDateString()} ${newDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  const handleUpdateClick = (table) => {
    setSelectedTable(table); // Set the table for updating
    setShowPopup(true); // Show the update popup
  };

  const handlePopupClose = () => {
    setShowPopup(false); // Close the popup
  };

  const handleUpdate = (updatedTable) => {
    setTables((prevTables) =>
      prevTables.map((table) =>
        table._id === updatedTable._id ? { ...table, ...updatedTable } : table
      )
    );
    setShowPopup(false); // Close the popup
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div className="table-container1">
      <div className="table-header1">
        <div>S.No</div>
        <div>Customer Name</div>
        <div>Table Name</div>
        <div>Bill Date</div>
        <div>Bill Amount (₹)</div>
        <div>Status</div>
        <div>Update</div>
        <div>View Bills</div>
      </div>
      <div className="table-body1">
        {tables
          .slice()
          .reverse()
          .map((table, index) => (
            <div key={table._id} className="table-row1">
              <div>{tables.length - index}</div>
              <div>{table.customerName}</div>
              <div>{table.tableNumber}</div>
              <div>{formatDate(table.createdAt)}</div>
              <div>{table.totalPrice}</div>
              <div>
                <select
                  value={table.status}
                  onChange={(e) => handleStatusChange(table._id, e.target.value)}
                  className="status-dropdown"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <button
                  className="btn edit-btn"
                  onClick={() => handleUpdateClick(table)} // Trigger the update popup
                >
                  Update
                </button>
              </div>
              <div>
                <button className="btn view-btn">View Bills</button>
              </div>
            </div>
          ))}
      </div>

      {/* Render the UpdatePopup when showPopup is true */}
      {showPopup && (
        <UpdatePopup
          table={selectedTable}
          onClose={handlePopupClose}
          onUpdate={handleUpdate} // Pass the update handler to the popup
        />
      )}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default AddTableContent;
