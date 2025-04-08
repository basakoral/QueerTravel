import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import { useData } from "../context/DataContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function LegendView() {
    const { categoryColors } = useData(); // Get colors from DataContext

    console.log("Legend category colors: ", categoryColors);

    const legendRef = useRef(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [legendSize, setLegendSize] = useState({ width: 250, height: 200 });

    return (
        <Draggable nodeRef={legendRef} handle=".drag-handle">
            <div
                ref={legendRef}
                style={{
                    position: "absolute",
                    bottom: "30px",
                    right: "10px",
                    zIndex: 1000,
                    background: "white",
                    padding: "10px",
                    borderRadius: "5px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                    width: isMinimized ? 150 : legendSize.width,
                    height: isMinimized ? 50 : legendSize.height,
                    transition: "width 0.3s, height 0.3s",
                    resize: "both", // Allow resizing
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
                    <span>Legend</span>
                    <FontAwesomeIcon
                        icon={isMinimized ? faPlus : faMinus}
                        style={{ cursor: "pointer" }}
                        onClick={() => setIsMinimized(!isMinimized)}
                    />
                </div>

                {!isMinimized && (
                    <div
                        style={{
                            padding: "10px",
                            maxHeight: "100%",
                            overflowY: "auto",
                        }}
                    >
                        {Object.entries(categoryColors).map(([category, color]) => (
                            <div
                                key={category}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: "5px",
                                }}
                            >
                                <div
                                    style={{
                                        width: "20px",
                                        height: "20px",
                                        backgroundColor: color,
                                        marginRight: "10px",
                                        borderRadius: "4px",
                                        border: `2px solid black`
                                    }}
                                />
                                <span>{category}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Draggable>
    );
}
