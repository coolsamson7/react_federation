import React, { ReactNode, useState, useRef, useEffect } from "react";

export type PanelPosition = "left" | "right" | "bottom";

interface SlidingPanelProps {
  position: PanelPosition;
  isOpen: boolean;
  title: string;
  width?: number;
  height?: number;
  float?: boolean; // If true, panel floats over content; if false, pushes content
  children: ReactNode;
  onClose: () => void;
  panelId: string; // For persisting sizes
}

export const SlidingPanel: React.FC<SlidingPanelProps> = ({
  position,
  isOpen,
  title,
  width = 300,
  height = 250,
  float = false,
  children,
  onClose,
  panelId,
}) => {
  const toggleBarWidth = 36; // Width of the toggle bar

  // Load saved size from localStorage or use default
  const getSavedSize = () => {
    const saved = localStorage.getItem(`panel-size-${panelId}`);
    return saved ? parseInt(saved, 10) : (position === "bottom" ? height : width);
  };

  const [currentSize, setCurrentSize] = useState(getSavedSize);
  const [isResizing, setIsResizing] = useState(false);
  const startPosRef = useRef(0);
  const startSizeRef = useRef(0);

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (position === "left") {
        const delta = e.clientX - startPosRef.current;
        const newSize = Math.max(150, Math.min(800, startSizeRef.current + delta));
        setCurrentSize(newSize);
      } else if (position === "right") {
        const delta = startPosRef.current - e.clientX;
        const newSize = Math.max(150, Math.min(800, startSizeRef.current + delta));
        setCurrentSize(newSize);
      } else if (position === "bottom") {
        const delta = startPosRef.current - e.clientY;
        const newSize = Math.max(100, Math.min(600, startSizeRef.current + delta));
        setCurrentSize(newSize);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      localStorage.setItem(`panel-size-${panelId}`, currentSize.toString());
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing, position, currentSize, panelId]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
    startPosRef.current = position === "bottom" ? e.clientY : e.clientX;
    startSizeRef.current = currentSize;
  };

  const getStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: float ? "absolute" : "relative",
      backgroundColor: "#1a1a1a",
      border: "1px solid #333",
      zIndex: position === "right" ? 102 : 101, // Right panels above left panels
      transition: isResizing ? "none" : "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    };

    switch (position) {
      case "left":
        return {
          ...baseStyle,
          top: 0,
          left: float ? toggleBarWidth : undefined,
          width: isOpen ? currentSize : 0,
          height: "100%",
          borderLeft: "none",
        };
      case "right":
        return {
          ...baseStyle,
          top: 0,
          right: float ? toggleBarWidth : undefined,
          width: isOpen ? currentSize : 0,
          height: "100%",
          borderRight: "none",
        };
      case "bottom":
        return {
          ...baseStyle,
          bottom: float ? toggleBarWidth : undefined,
          left: float ? toggleBarWidth : undefined,
          right: float ? toggleBarWidth : undefined,
          height: isOpen ? currentSize : 0,
          borderBottom: "none",
        };
    }
  };

  return (
    <div style={getStyles()}>
      {/* Resize Handle - Left side for right panels, right side for left panels */}
      {isOpen && (
        <div
          onMouseDown={handleResizeStart}
          style={{
            position: "absolute",
            [position === "left" ? "right" : position === "right" ? "left" : "top"]: 0,
            [position === "bottom" ? "left" : "top"]: 0,
            [position === "bottom" ? "right" : "bottom"]: 0,
            width: position === "bottom" ? "100%" : "8px",
            height: position === "bottom" ? "8px" : "100%",
            cursor: position === "bottom" ? "ns-resize" : "ew-resize",
            backgroundColor: isResizing ? "#4A90E2" : "#1a1a1a",
            transition: "background-color 0.2s ease",
            zIndex: 102,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => {
            if (!isResizing) {
              e.currentTarget.style.backgroundColor = "#2a2a2a";
            }
          }}
          onMouseLeave={(e) => {
            if (!isResizing) {
              e.currentTarget.style.backgroundColor = "#1a1a1a";
            }
          }}
        >
          {/* Visual indicator line */}
          <div
            style={{
              width: position === "bottom" ? "40px" : "2px",
              height: position === "bottom" ? "2px" : "40px",
              backgroundColor: "#555",
              borderRadius: 1,
            }}
          />
        </div>
      )}

      {/* Panel Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "6px 12px",
          backgroundColor: "#0d0d0d",
          borderBottom: "1px solid #333",
          minHeight: 30,
          flexShrink: 0,
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 12, color: "#e0e0e0" }}>{title}</div>
        <button
          onClick={onClose}
          style={{
            width: 20,
            height: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            border: "none",
            color: "#666",
            cursor: "pointer",
            transition: "all 0.2s ease",
            padding: 0,
            zIndex: 103,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#e0e0e0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "#666";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8 2.146 2.854Z"/>
          </svg>
        </button>
      </div>

      {/* Panel Content */}
      <div style={{ flex: 1, overflow: "auto", display: "flex", flexDirection: "column" }}>{children}</div>
    </div>
  );
};
