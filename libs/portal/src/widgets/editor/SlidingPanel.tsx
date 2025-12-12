import React, { ReactNode } from "react";

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
}) => {
  const toggleBarWidth = 36; // Width of the toggle bar

  const getStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: float ? "absolute" : "relative",
      backgroundColor: "#1a1a1a",
      border: "1px solid #333",
      zIndex: 101,
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), height 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
    };

    switch (position) {
      case "left":
        return {
          ...baseStyle,
          top: float ? 0 : undefined,
          left: float ? toggleBarWidth : undefined,
          width: isOpen ? width : 0,
          height: float ? "100%" : "100%",
          borderLeft: "none",
        };
      case "right":
        return {
          ...baseStyle,
          top: float ? 0 : undefined,
          right: float ? toggleBarWidth : undefined,
          width: isOpen ? width : 0,
          height: float ? "100%" : "100%",
          borderRight: "none",
        };
      case "bottom":
        return {
          ...baseStyle,
          bottom: float ? toggleBarWidth : undefined,
          left: float ? toggleBarWidth : undefined,
          right: float ? toggleBarWidth : undefined,
          height: isOpen ? height : 0,
          borderBottom: "none",
        };
    }
  };

  return (
    <div style={getStyles()}>
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
        }}
      >
        <div style={{ fontWeight: 600, fontSize: 12, color: "#e0e0e0" }}>{title}</div>
        <button
          onClick={onClose}
          style={{
            width: 18,
            height: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "transparent",
            border: "1px solid #555",
            borderRadius: 3,
            color: "#888",
            cursor: "pointer",
            fontSize: 12,
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
            e.currentTarget.style.borderColor = "#666";
            e.currentTarget.style.color = "#e0e0e0";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = "#555";
            e.currentTarget.style.color = "#888";
          }}
        >
          ×
        </button>
      </div>

      {/* Panel Content */}
      <div style={{ flex: 1, overflow: "auto", padding: 16 }}>{children}</div>
    </div>
  );
};
