
import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Draggable from "react-draggable";
import { useData } from "../context/DataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FilterPopup from "./FilterPopup";
import RangeSlider from "./RangeSlider"; // Import the RangeSlider component  
import {
  faSortAmountDownAlt,
  faSortAmountDown,
  faSortAlphaDownAlt,
  faSortAlphaDown,
  faMinus,
  faPlus,
  faFilter,
} from "@fortawesome/free-solid-svg-icons";

export default function TableView() {
  const { csvData, categoryColors, setSelectedCountryOnTable, selectedCountryOnMap} = useData();
  const [filteredData, setFilteredData] = useState([...csvData]);
  const [columns, setColumns] = useState(
    csvData.length ? Object.keys(csvData[0]) : []
  );
  const [sortStates, setSortStates] = useState<Record<string, "asc" | "desc">>(
    {}
  );
  // const [filters, setFilters] = useState<Record<string, [number, number]>>({});
  const [filters, setFilters] = useState<
    Record<string, { type: "categorical" | "numerical"; values: any }>
  >({});

  // Store the column that is being filtered
  const [filterColumn, setFilterColumn] = useState<string | null>(null);

  const tableRef = useRef(null);
  const [tableSize, setTableSize] = useState({ width: 1200, height: 500 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [draggingRow, setDraggingRow] = useState<number | null>(null);
  const [draggingColumn, setDraggingColumn] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const brushRefs = useRef<Record<string, SVGSVGElement | null>>({});
  const rowRefs = useRef({});
  const [brushSelections, setBrushSelections] = useState({});

  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});



  const [selectedRows, setSelectedRows] = useState<Record<string, boolean>>(
    () => Object.fromEntries(csvData.map(row => [row.Country, false])) // All rows start as false
  );
  



  useEffect(() => {
    if (csvData.length) {
      const initialValues = Object.fromEntries(
        columns
          .filter((header) => filteredData.every((row) => !isNaN(parseFloat(row[header]))))
          .map((header) => [header, sliderValues[header] || 50]) // Default value = 50
      );
  
      setSliderValues(initialValues);
      console.log("Initial values ", initialValues);
    }
  }, [csvData, columns]);
  

    useEffect(() => {

      console.log(selectedCountryOnMap)

      if (selectedCountryOnMap && rowRefs.current[selectedCountryOnMap]) {
          rowRefs.current[selectedCountryOnMap].scrollIntoView({
              behavior: "smooth",
              block: "center",
          });
      }

      setSelectedRows((prev) => ({
        ...prev,
        [selectedCountryOnMap]: true, // Toggle selection state
      }));

  }, [selectedCountryOnMap]);


  useEffect(() => {
    console.log("Table Data: ", csvData);
    setFilteredData([...csvData]);
    setColumns(csvData.length ? Object.keys(csvData[0]) : []);
  }, [csvData]);


  const handleSort = (columnKey: string) => {
    setSortStates((prevSortStates) => {
      console.log("Previous sort states: ", prevSortStates);
  
      const newDirection = prevSortStates[columnKey] === "asc" ? "desc" : "asc";
  
      // Sort existing `filteredData` instead of modifying `csvData` directly
      const sortedData = [...filteredData].sort((a, b) => {
        const aValue = a[columnKey];
        const bValue = b[columnKey];
        const aNum = parseFloat(aValue);
        const bNum = parseFloat(bValue);
        const isNumeric = !isNaN(aNum) && !isNaN(bNum);
  
        return isNumeric
          ? newDirection === "asc"
            ? aNum - bNum
            : bNum - aNum
          : newDirection === "asc"
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
  
      setFilteredData(sortedData);
  
      return { ...prevSortStates, [columnKey]: newDirection };
    });
  };
  

  /** ********** SORTING FUNCTION *********** */
  // const handleSort = (columnKey: string) => {
  //   setSortStates((prevSortStates) => {
  //     console.log("Previous sort states: ", prevSortStates);

  //     const newDirection = prevSortStates[columnKey] === "asc" ? "desc" : "asc";

  //     const sortedData = [...filteredData].sort((a, b) => {
  //       const aValue = a[columnKey];
  //       const bValue = b[columnKey];
  //       const aNum = parseFloat(aValue);
  //       const bNum = parseFloat(bValue);
  //       const isNumeric = !isNaN(aNum) && !isNaN(bNum);

  //       return isNumeric
  //         ? newDirection === "asc"
  //           ? aNum - bNum
  //           : bNum - aNum
  //         : newDirection === "asc"
  //         ? String(aValue).localeCompare(String(bValue))
  //         : String(bValue).localeCompare(String(aValue));
  //     });

  //     setFilteredData(sortedData);
  //     return { ...prevSortStates, [columnKey]: newDirection };
  //   });
  // };

  // Handle opening the filter popup
  const handleFilterClick = (column: string) => {
    setFilterColumn(column);
  };

  const handleMouseDown = (e) => {
    // Store the initial position
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    setIsDragging(false);
  };
  
  const handleMouseMove = (e) => {
    // Check if movement exceeds threshold (consider it dragging)
    const dx = Math.abs(e.clientX - dragStartPos.current.x);
    const dy = Math.abs(e.clientY - dragStartPos.current.y);
  
    if (dx > 5 || dy > 5) {
      setIsDragging(true);
    }
  };
  
  const handleMouseUp = (e, row) => {
    if (!isDragging) {
      console.log("Clicked! Perform click action here.");
      console.log(`${row.Country} is clicked`)
      setSelectedCountryOnTable(row.Country); 
      // console.log("Selected Country: ", selectedCountryOnMap);
      setSelectedRows((prev) => ({
        ...prev,
        [row.Country]: !prev[row.Country], // Toggle selection state
      }));
      console.log(selectedRows);

    } else {
      console.log("Drag ended!");
    }
  };



  const handleApplyFilter = (column: string, selectedValues: string[]) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [column]: { type: "categorical", values: selectedValues }, // Store selected categories correctly
    }));
    setFilterColumn(null); // Close popup
  };

  const handleColumnDragStart = (columnName: string) =>
    setDraggingColumn(columnName);

  const handleColumnDrop = (columnName: string) => {
    if (!draggingColumn || draggingColumn === columnName) return;
    const newColumns = [...columns];
    const fromIndex = newColumns.indexOf(draggingColumn);
    const toIndex = newColumns.indexOf(columnName);
    newColumns.splice(fromIndex, 1);
    newColumns.splice(toIndex, 0, draggingColumn);
    setColumns(newColumns);
    setDraggingColumn(null);
  };

  const handleRowDragStart = (index: number) => setDraggingRow(index);

  const handleRowDrop = (index: number) => {
    if (draggingRow === null || draggingRow === index) return;
    const updatedData = [...filteredData];
    const movedRow = updatedData.splice(draggingRow, 1)[0];
    updatedData.splice(index, 0, movedRow);
    setFilteredData(updatedData);
    setDraggingRow(null);
  };

  // useEffect(() => {
  //   if (!csvData.length) return; // Exit if no data

  //   // console.log("Brushed Refs: ", brushRefs);
  //   // console.log("Columns: ", columns, "AAA");

  //   columns.forEach((col) => {
  //     if (!brushRefs.current[col]) return;

  //     const svg = d3.select(brushRefs.current[col]);
  //     svg.selectAll("*").remove(); // Clear previous brush

  //     // Get Actual SVG Width
  //     console.log("SVG: ", svg);
  //     const columnWidth = svg.node()?.getBoundingClientRect().width || 120;
  //     console.log("Column width: ", columnWidth); // 83.5703125

  //     // // Update SVG Attributes
  //     // svg.attr("width", "100%").attr("height", 30); // Maintain responsive width

  //     // Define Normalized X-Scale (Using SVG Width)
  //     const xScale = d3
  //       .scaleLinear()
  //       .domain([0, 1]) // Normalized range
  //       .range([10, columnWidth-10]); // FULL width of SVG

  //     // Define X-axis with only THREE tick marks (0, 0.5, 1)
  //     const xAxis = d3
  //       .axisBottom(xScale)
  //       .tickValues([0, 0.5, 1]) // Only 3 ticks
  //       .tickFormat(d3.format(".1f")); // Format numbers as "0.0"

  //     // Append Axis
  //     svg
  //       .append("g")
  //       .attr("transform", `translate(0, 18)`) // Position axis under brush
  //       .call(xAxis)
  //       .selectAll("text")
  //       .attr("font-size", "10px")
  //       .attr("fill", "#555")
  //       .style("text-anchor", "middle");

  //     // Define Brush with Dynamic Width
  //     const brush = d3
  //       .brushX()
  //       .extent([
  //         [10, 0],
  //         [columnWidth - 10, 20], // Match full width of the SVG
  //       ])
  //       .on("brush end", (event) => {
  //         if (!event.selection) return;
  //           let [x0, x1] = event.selection.map(xScale.invert);
  //           console.log("X0: " + x0 + " X1: " + x1);
  //         if(x0 === x1 && (x0 === 0 || x0 === 1)){
  //           x0 = 0;
  //           x1 = 1;
  //         }

  //         setFilters((prev) => ({
  //           ...prev,
  //           [col]: { type: "numerical", values: [x0, x1] },
  //         }));
  //       });

  //     // Append Brush
  //     const brushGroup = svg.append("g").attr("class", "brush").call(brush);

  //     // Style Brush Handles
  //     brushGroup
  //       .selectAll(".handle")
  //       .attr("rx", 5) // Rounded edges for handles
  //       .attr("fill", "#4285F4"); // Blue color for visibility

  //     brushGroup
  //       .selectAll("rect.selection")
  //       .attr("fill", "#4285F4") // Blue selection
  //       .attr("opacity", 0.5);
  //   });
  // }, [csvData, columns, isMinimized]);

  useEffect(() => {
    if (!csvData.length) return; // Exit if no data
  
    // Delay execution to ensure table resizing completes
    setTimeout(() => {
      columns.forEach((col) => {
        if (!brushRefs.current[col]) return;
  
        const svg = d3.select(brushRefs.current[col]);
        svg.selectAll("*").remove(); // Clear previous brush
  
        // Get Actual SVG Width AFTER DOM is fully updated
        const columnWidth = svg.node()?.getBoundingClientRect().width || 120;
        console.log(`Updated Column width for ${col}: `, columnWidth);
  
        // Define Normalized X-Scale (Using Updated Width)
        const xScale = d3
          .scaleLinear()
          .domain([0, 1]) // Normalized range
          .range([10, columnWidth - 10]); // FULL width of SVG
  
        // Define X-axis with three tick marks
        const xAxis = d3
          .axisBottom(xScale)
          .tickValues([0, 0.5, 1]) // Only 3 ticks
          .tickFormat(d3.format(".1f")); // Format numbers as "0.0"
  
        // Append Axis
        svg.append("g")
          .attr("transform", `translate(0, 18)`) // Position axis under brush
          .call(xAxis)
          .selectAll("text")
          .attr("font-size", "10px")
          .attr("fill", "#555")
          .style("text-anchor", "middle");
  
        // Define Brush with Dynamic Width
        const brush = d3
          .brushX()
          .extent([
            [10, 0],
            [columnWidth - 10, 20], // Match full width of the SVG
          ])
          .on("brush end", (event) => {
            if (!event.selection) return;
            let [x0, x1] = event.selection.map(xScale.invert);
            console.log("X0: " + x0 + " X1: " + x1);
            // if(x0 === x1 && (x0 === 0 || x0 === 1)){
            //   x0 = 0;
            //   x1 = 1;
            // }
            
            setBrushSelections((prev) => ({
              ...prev,
              [col]: [x0, x1],
            }))

            setFilters((prev) => ({
              ...prev,
              [col]: { type: "numerical", values: x0 === x1 && (x0 === 0 || x0 === 1) ? [0,1] : [x0, x1]},
            }));
          });
  
        // Append Brush
        const brushGroup = svg.append("g").attr("class", "brush").call(brush);
        
        if(brushSelections[col]){
          const [storedX0, storedX1] = brushSelections[col].map(xScale);
          brushGroup.call(brush.move, [storedX0, storedX1]);
        }

        // Style Brush Handles
        brushGroup
          .selectAll(".handle")
          .attr("rx", 5) // Rounded edges for handles
          .attr("fill", "#4285F4"); // Blue color for visibility

        brushGroup
          .selectAll("rect.selection")
          .attr("fill", "#4285F4") // Blue selection
          .attr("opacity", 0.5);
      });
    }, 100); // Small delay (100ms) to wait for re-render
  }, [csvData, columns, isMinimized]); // `isMinimized` added as a dependency
  
  // useEffect(() => {
  //   console.log("Table Data Updated: ", csvData);
  
  //   let newFilteredData = [...csvData]; // Copy of updated data
  
  //   // Apply existing sorting direction after data updates
  //   Object.entries(sortStates).forEach(([columnKey, sortDirection]) => {
  //     newFilteredData.sort((a, b) => {
  //       const aValue = a[columnKey];
  //       const bValue = b[columnKey];
  //       const aNum = parseFloat(aValue);
  //       const bNum = parseFloat(bValue);
  //       const isNumeric = !isNaN(aNum) && !isNaN(bNum);
  
  //       return isNumeric
  //         ? sortDirection === "asc"
  //           ? aNum - bNum
  //           : bNum - aNum
  //         : sortDirection === "asc"
  //         ? String(aValue).localeCompare(String(bValue))
  //         : String(bValue).localeCompare(String(aValue));
  //     });
  //   });
  
  //   setFilteredData(newFilteredData);
  // }, [csvData, sortStates]); // Ensure sorting is applied when csvData updates
  

  useEffect(() => {
    setFilteredData(() => {
      return csvData
        .filter((row) => {
          // Apply categorical filters (REMOVE unmatched rows)
          return Object.entries(filters).every(([col, filter]) => {
            if (!filter || !filter.type || filter.type === "numerical")
              return true; // Ignore undefined filters

            if (filter.type === "categorical") {
              // Categorical Filtering: Check if row value is in selected categories
              return (
                filter.values.length === 0 || filter.values.includes(row[col])
              );
            }
          });
        })
        .map((row) => {
          // Apply numerical filters (DO NOT remove, only adjust opacity)
          const isNumericallyActive = Object.entries(filters).every(
            ([col, filter]) => {
              if (filter.type === "numerical") {
                const value = parseFloat(row[col]);
                console.log("Value: ", value);
                console.log("Filter: ", filter.values);
                return value >= filter.values[0] && value <= filter.values[1];
              } else {
                return true;
              }
            }
          );

          console.log("Active: ", isNumericallyActive);

          return { ...row, isActive: isNumericallyActive };
        });
    });
    console.log("Filtered Data: ", filteredData);
    console.log("Filters: ", filters);
  }, [filters, csvData]);

  return (
    <Draggable nodeRef={tableRef} handle=".drag-handle">
      <div
        ref={tableRef}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
          background: "rgba(255, 255, 255, 0.9)",
          padding: "10px", // padding between div and table
          borderRadius: "5px",
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
          overflow: "hidden",
          width: isMinimized ? 200 : tableSize.width,
          height: isMinimized ? 50 : tableSize.height,
          transition: "width 0.3s, height 0.3s",
          resize: "both", // MAKES THE TABLE RESIZABLE
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          className="drag-handle"
          style={{
            background: "gray",
            color: "white",
            padding: "10px", //padding header of the div (Country Safety Data)
            cursor: "grab",
            fontWeight: "bold",
            borderRadius: "5px 5px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Country Safety Data</span>
          <FontAwesomeIcon
            icon={isMinimized ? faPlus : faMinus}
            style={{ cursor: "pointer" }}
            onClick={() => setIsMinimized(!isMinimized)}
          />
        </div>

        {!isMinimized && (
          <div
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              border: "1px solid #ddd",
              overflowY: "auto",
              position: "relative",
            }}
          >
            {/* Resizable Table Wrapper */}
            <div
              style={{
                // overflowY: "auto",
                // maxWidth: "100%",
                // maxHeight: "65vh",
                position: "relative",
                // minHeight: "150px",
                height: "calc(100vh - 150px)", // Allows it to grow dynamically
                // height: "calc(100vh - 175px)", // Leaves space for other UI elements
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  tableLayout: "fixed",
                }}
              >
                <thead style={{ position: "sticky", top: 0, background: "white", zIndex: 10 }}>
                  <tr>
                    {/* Wrap all headers inside a single <tr> */}
                    {columns.map((header) => {
                      const isNumeric = filteredData.every(
                        (row) => !isNaN(parseFloat(row[header]))
                      );
                    return (
                      <th
                        key={header}
                        style={{padding: "4px", fontSize: "12px" }} // padding icon group in the header
                      >
                        {/* {header} */}

                        {/* Sort and Filter Icons */}
                        <FontAwesomeIcon
                          icon={
                            sortStates[header] === "asc"
                              ? isNumeric ? faSortAmountDownAlt : faSortAlphaDown
                              : sortStates[header] === "desc"
                              ? isNumeric ? faSortAmountDown : faSortAlphaDownAlt
                              : isNumeric ? faSortAmountDown : faSortAlphaDown
                          }
                          style={{ marginLeft: "5px", cursor: "pointer" }}
                          onClick={() => handleSort(header)}
                        />

                        {!isNumeric && (
                          <FontAwesomeIcon
                            icon={faFilter}
                            style={{ marginLeft: "5px", cursor: "pointer" }}
                            onClick={() => handleFilterClick(header)}
                          />
                        )}
                      </th>
                    )})}
                  </tr>
                </thead>

                <thead style={{ position: "sticky", top: 20, background: "white", zIndex: 9 }}>
                  <tr>
                    {columns.map((header) => {
                      
                      return (
                        <th
                          key={header}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move";
                            handleColumnDragStart(header);
                          }}
                          onDrop={() => handleColumnDrop(header)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "move";
                          }}
        
                          style={{
                            position: "sticky",
                            // borderBottom: "2px solid #ddd",
                            fontSize: "12px",
                            cursor: "grab",
                          }}
                        >
                          {header}
                        </th>
                      );
                    })}
                  </tr>
                </thead>


                {/* Weight Adjustment */}
                <thead style={{ position: "sticky", top: 62, background: "white", zIndex: 8 }}>
                  <tr>
                    {columns.map((header) => {
                      const isNumeric = filteredData.every(
                        (row) => !isNaN(parseFloat(row[header]))
                      );
                      return isNumeric && header !== "Total Score" ? (
                        <th
                          key={header}
                          
                          style={{
                            position: "sticky",
                            width: "100%",
                            // borderBottom: "2px solid #ddd",
                          }}
                        >

                          {/* <RangeSlider header={header}/> */}
                          <RangeSlider
                            header={header}
                            value={sliderValues[header] || 50} // Use stored value or default
                            onChange={(value) => handleSliderChange(header, value)}
                          />

                          {/* <input
                            type="range"
                            id={"weight-" + header}
                            name={"weight-"+header}
                            min="0"
                            max="100"
                            value={50}
                            style={{ width: "50px" }}
                            // onChange={(e) => setWeight(e.target.value)}
                            //className="w-64"
                          /> */}

                          {/* <svg
                            width="100%"
                            height="50"
                            ref={(el) => (brushRefs.current[header] = el)}
                            // ref={(el) => (brushRefs[header] = el)}
                          /> */}
                        </th>
                      ) : (
                        <th
                          key={header}
                          // style={{ borderBottom: "2px solid #ddd" }}
                        ></th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Brushable X-Axis for numeric columns */}
                <thead style={{ position: "sticky", top: 80, background: "white", zIndex: 7 }}>
                  <tr>
                    {columns.map((header) => {
                      const isNumeric = filteredData.every(
                        (row) => !isNaN(parseFloat(row[header]))
                      );
                      return isNumeric ? (
                        <th
                          key={header}
                          
                          style={{
                            position: "sticky",
                            width: "100%",
                            borderBottom: "2px solid #ddd",
                          }}
                        >
                          <svg
                            width="100%"
                            height="50"
                            ref={(el) => (brushRefs.current[header] = el)}
                            // ref={(el) => (brushRefs[header] = el)}
                          />
                        </th>
                      ) : (
                        <th
                          key={header}
                          style={{ borderBottom: "2px solid #ddd" }}
                        ></th>
                      );
                    })}
                  </tr>
                </thead>

                {/* Draggable Rows & Bars */}
                <tbody>
                  {filteredData.map((row, index) => (
                    <tr
                      key={index}
                      ref={(el) => (rowRefs.current[row.Country] = el)}

                      style={{
                        opacity: row.isActive ? 1 : 0.3, // Reduce transparency when numerically inactive
                        color: row.isActive ? "black" : "gray", // Make text gray when numerically inactive
                        transition: "opacity 0.3s ease", // Smooth transition effect
                        cursor: "grab",
                        position: "relative",
                        backgroundColor: selectedRows[row.Country]? "rgba(255, 255, 0, 0.2)" : "transparent",
                        border: selectedRows[row.Country] ? "2px solid black" : "none",
                      }}
                      draggable
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={(e) => handleMouseUp(e,row)}
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = "move";
                        handleRowDragStart(index);
                      }}
                      onDrop={() => handleRowDrop(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      // style={{ cursor: "grab" }}
                    >
                      {columns.map((header, i) => {
                        const value = row[header];
                        const isNumeric = !isNaN(parseFloat(value));
                        const maxValue = Math.max(
                          ...filteredData.map((r) => parseFloat(r[header]) || 0)
                        );
                        const barColor =
                          header === "Total Score"
                            ? categoryColors[row["Safety Category"]] ||
                              "#B4B4B4"
                            : "#B4B4B4";

                        return (
                          <td
                            key={i}
                            style={{
                              padding: "1px",
                              // borderBottom: "1px solid #ddd",
                              minWidth: "100px",
                              fontSize: "12px",
                            }}
                          >
                            {isNumeric ? (
                              <div
                                style={{
                                  position: "relative",
                                  width: "100%",
                                  display: "flex",
                                  alignItems: "center",
                                }}
                              >
                                <span
                                  style={{
                                    position: "absolute",
                                    left: "4px",
                                    fontSize: "10px",
                                    fontWeight: "bold",
                                    color: "black",
                                    zIndex: 2,
                                  }}
                                >
                                  {header !== "Total Score"
                                    ? parseFloat(value).toFixed(2)
                                    : parseFloat(value).toFixed(3)}
                                </span>
                                <div
                                  style={{
                                    height: "20px",
                                    backgroundColor: barColor,
                                    width: `${
                                      (parseFloat(value) / 1) * 100
                                    }%`,
                                    minWidth: "5px",
                                    position: "relative",
                                    zIndex: 1,
                                  }}
                                />
                              </div>
                            ) : (
                              value
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Render the filter popup if a column is selected */}
              {filterColumn && (
                <FilterPopup
                  column={filterColumn}
                  data={csvData}
                  filteredData={csvData}
                  onClose={() => setFilterColumn(null)}
                  onApply={handleApplyFilter}
                />
              )}
            </div>
          </div>
        )}
      </div>
    </Draggable>
  );
}

