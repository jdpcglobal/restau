import React, { useState, useEffect } from "react";
import "./ViewTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGroup } from "@fortawesome/free-solid-svg-icons";

const ViewTableContent = ({ onTableSelect }) => {
  const [selectedTable, setSelectedTable] = useState(null);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTables = async () => {
    try {
      const response = await fetch("/api/tablesview");
      if (!response.ok) {
        throw new Error("Failed to fetch tables");
      }
      const data = await response.json();
      setTables(data.tables);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleTableClick = (tableId, totalSeats) => {
    const newSelection = selectedTable === tableId ? null : tableId;
    setSelectedTable(newSelection);
    onTableSelect(newSelection, totalSeats); // Pass both table ID and total seats
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="table-container">
      <div className="table-row-order">
        {tables.map((table) => (
          <div
            key={table._id} // Use table's unique ID from the database
            className={`table-item-order ${selectedTable === table.tableName ? "selected" : ""}`}
            onClick={() => handleTableClick(table.tableName, table.seatNumber)}
          >
            <span className="table-label">{table.tableName}</span>
          
            <FontAwesomeIcon
              icon={faUserGroup}
              className={`people-icon ${selectedTable === table.tableName ? "selected-icon" : ""}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ViewTableContent;
