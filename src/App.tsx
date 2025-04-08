import React, { useState } from "react";
import MapView from "./components/MapView";
import TableView from "./components/TableView";
import LegendView from "./components/LegendView";
import SearchBar from './components/SearchBar';
import { ControlsPanel } from "./components/ControlsPanel";
import ClusteringPanel from "./components/ClusteringPanel";
import { DataProvider } from "./context/DataContext";
import InputPanel from './components/InputPanel';



export default function App() {
  const [center, setCenter] = useState<[number, number]>([0, 20]); // Default map center
  const [zoomLevel, setZoomLevel] = useState<number>(2); // Default zoom level

  // Function to handle location selection from SearchBar
  const handleSearchSelect = (center: [number, number], zoom: number = 6) => {
    setCenter(center); // Update the map center when a location is selected
    setZoomLevel(zoom); // Set the zoom level when a location is selected
  };

  return (
    <DataProvider>
      <div style={{ 
        display: "flex",
        flexDirection: "column",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        position: "relative"
      }}>
        <MapView center={center} zoomLevel={zoomLevel} />

        {/* Floating Button */}
        {/* <div style={{
          position: "absolute",
          bottom: "1.5rem",
          left: "1.5rem",
          zIndex: 1000
        }}>
          <InputPanel />
        </div> */}
        <TableView /> 
        <LegendView />
        {/* <ClusteringPanel /> */}
        <SearchBar onSearchSelect={handleSearchSelect} />
        {/* <ControlsPanel /> */}
      </div>
    </DataProvider>
  );
}





