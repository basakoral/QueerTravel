import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-regular-svg-icons";

export default function FilterPopup({
  column,
  data,
  filteredData,
  onClose,
  onApply,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedValues, setSelectedValues] = useState<string[]>([]);

  // Get all unique values for the column from the full dataset
  const allUniqueValues = Array.from(
    new Set(data.map((row) => row[column]))
  ).filter(Boolean);

  // Get unique values that are currently present in the filtered dataset
  const activeValues = new Set(filteredData.map((row) => row[column]));

  // Filter values based on search term
  const filteredValues = allUniqueValues.filter((value) =>
    value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ensure only the active ones are selected
  useEffect(() => {
    setSelectedValues(
      allUniqueValues.filter((value) => activeValues.has(value))
    );
  }, [filteredData]); // Update selection when filteredData changes

  // Handle selecting/deselecting values
  const handleToggleSelection = (value: string) => {
    setSelectedValues((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // Bulk Select/Deselect
  const selectAll = () => setSelectedValues([...allUniqueValues]);
  const deselectAll = () => setSelectedValues([]);

  return (
    <div
      style={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "white",
        borderRadius: "8px",
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)",
        zIndex: 2000,
        width: "320px",
        border: "1px solid #ccc",
      }}
    >
      {/* Header - Styled to Match Other Overlays */}
      <div
        style={{
          background: "#666",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px",
          borderTopLeftRadius: "8px",
          borderTopRightRadius: "8px",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "14px", fontWeight: "bold" }}>
          Filter {column}
        </h3>
        <FontAwesomeIcon
          icon={faWindowClose}
          style={{ cursor: "pointer", fontSize: "16px", color: "white" }}
          onClick={onClose}
        />
      </div>

      {/* Main Content */}
      <div style={{ padding: "10px" }}>
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "calc(100% - 2px)", // Adjusts for padding
            padding: "8px",
            marginBottom: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            fontSize: "14px",
            boxSizing: "border-box", // Ensures padding & border are included in width calculation
          }}
        />

        {/* Bulk Select/Deselect */}
        <div
          style={{
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={selectAll}
            style={{
              flex: 1,
              marginRight: "5px",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              fontSize: "12px",
            }}
          >
            Select All
          </button>
          <button
            onClick={deselectAll}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#666",
              color: "white",
              border: "none",
              fontSize: "12px",
            }}
          >
            Deselect All
          </button>
        </div>

        {/* Scrollable List */}
        <div
          style={{
            maxHeight: "200px",
            overflowY: "auto",
            border: "1px solid #ddd",
            padding: "5px",
            borderRadius: "4px",
            backgroundColor: "#f9f9f9",
          }}
        >
          {filteredValues.map((value) => (
            <div
              key={value}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <input
                type="checkbox"
                checked={selectedValues.includes(value)}
                onChange={() => handleToggleSelection(value)}
              />
              <span style={{ marginLeft: "8px", fontSize: "14px" }}>
                {value}
              </span>
            </div>
          ))}
        </div>

        {/* Apply & Close Buttons */}
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <button
            onClick={() => onApply(column, selectedValues)}
            style={{
              flex: 1,
              marginRight: "5px",
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#4285F4",
              color: "white",
              border: "none",
              fontSize: "14px",
            }}
          >
            Apply Filter
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "4px",
              backgroundColor: "#ddd",
              border: "none",
              fontSize: "14px",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}





