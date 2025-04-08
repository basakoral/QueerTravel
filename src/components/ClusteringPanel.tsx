import React, { useState, useRef } from "react";
import Draggable from "react-draggable";
import { useData } from "../context/DataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function ClusteringPanel() {
  const { classifyData, csvData } = useData();

  const clusteringRef = useRef(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [clusteringSize, setClusteringSize] = useState({
    width: 300,
    height: 200,
  });

  // State for algorithm selection and number of clusters
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("k-means");
  const [numClusters, setNumClusters] = useState(5);

  // Clustering algorithms available
  const clusteringAlgorithms = [
    "k-means",
    "jenks",
    "quantile",
    "equal-interval",
    "std-dev",
  ];

  // Execute clustering when the button is clicked
  const handleApplyClustering = () => {
    if (csvData.length === 0) {
      alert("No data available for clustering.");
      return;
    }
    classifyData(csvData, selectedAlgorithm, numClusters);
  };

  return (
    <Draggable nodeRef={clusteringRef} handle=".drag-handle">
      <div
        ref={clusteringRef}
        style={{
          position: "absolute",
          visibility: "hidden",
          top: "150px",
          left: "20px",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "5px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          width: isMinimized ? 200 : clusteringSize.width,
          height: isMinimized ? 50 : clusteringSize.height,
          transition: "width 0.3s, height 0.3s",
          resize: "both",
        }}
      >
        {/* Drag Handle & Minimize Button */}
        <div
          className="drag-handle"
          style={{
            background: "gray",
            color: "white",
            padding: "10px",
            cursor: "grab",
            fontWeight: "bold",
            borderRadius: "5px 5px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Clustering Control</span>
          <FontAwesomeIcon
            icon={isMinimized ? faPlus : faMinus}
            style={{ cursor: "pointer" }}
            onClick={() => setIsMinimized(!isMinimized)}
          />
        </div>

        {!isMinimized && (
          <div style={{ padding: "10px" }}>
            {/* Algorithm Selection */}
            <label style={{ fontWeight: "bold" }}>Algorithm:</label>
            <select
              value={selectedAlgorithm}
              onChange={(e) => setSelectedAlgorithm(e.target.value)}
              style={{
                width: "100%", // Ensure full width
                padding: "8px", // Consistent padding
                marginBottom: "10px",
                boxSizing: "border-box", // Ensures consistent width calculation
              }}
            >
              {clusteringAlgorithms.map((algo) => (
                <option key={algo} value={algo}>
                  {algo}
                </option>
              ))}
            </select>

            <input
              type="number"
              value={numClusters}
              min="2"
              max="10"
              onChange={(e) => setNumClusters(parseInt(e.target.value))}
              style={{
                width: "100%", // Ensure full width
                padding: "8px",
                marginBottom: "10px",
                boxSizing: "border-box",
              }}
            />

            {/* Apply Clustering Button */}
            <button
              onClick={handleApplyClustering}
              style={{
                width: "100%",
                padding: "10px",
                background: "#4285F4",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Apply Clustering
            </button>
          </div>
        )}
      </div>
    </Draggable>
  );
}
