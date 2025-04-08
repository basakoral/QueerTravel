import React, { useRef, useState } from "react";
import Draggable from "react-draggable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

export function ControlsPanel() {
    const panelRef = useRef(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [panelSize, setPanelSize] = useState({ width: 250, height: 150 });
    const [userFeedbackMode, setUserFeedbackMode] = useState(false);

    return (
        <Draggable nodeRef={panelRef} handle=".drag-handle">
            <div
                ref={panelRef}
                style={{
                    position: "absolute",
                    visibility: "hidden",
                    top: "100px",
                    left: "10px",
                    zIndex: 1000,
                    background: "rgba(255, 255, 255, 0.8)",
                    padding: "10px",
                    borderRadius: "8px",
                    boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
                    overflow: "hidden",
                    width: isMinimized ? 150 : panelSize.width,
                    height: isMinimized ? 50 : panelSize.height,
                    transition: "width 0.3s, height 0.3s",
                    resize: "both", // Allow resizing
                    backdropFilter: "blur(8px)"
                }}
            >
                {/* Drag Handle & Minimize Button */}
                <div
                    className="drag-handle"
                    style={{
                        background: "#6c757d",
                        color: "white",
                        padding: "10px",
                        cursor: "grab",
                        fontWeight: "bold",
                        borderRadius: "8px 8px 0 0",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <span>Controls</span>
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
                        <div className="flex items-center">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="sr-only peer" 
                                    checked={userFeedbackMode} 
                                    onChange={() => setUserFeedbackMode(!userFeedbackMode)} 
                                />
                                <div className="w-11 h-6 bg-gray-300 rounded-full peer peer-checked:bg-blue-500 after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-5"></div>
                            </label>
                            <span className="ml-3 text-black font-medium">Enable User Feedback Mode</span>
                        </div>
                    </div>
                )}
            </div>
        </Draggable>
    );
}
