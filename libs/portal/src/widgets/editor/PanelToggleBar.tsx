import React from "react";
import { PanelPosition } from "./SlidingPanel";

export interface PanelConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  position: PanelPosition;
}

interface PanelToggleBarProps {
  position: PanelPosition;
  panels: PanelConfig[];
  activePanels: Set<string>;
  onToggle: (panelId: string) => void;
}

export const PanelToggleBar: React.FC<PanelToggleBarProps> = ({
  position,
  panels,
  activePanels,
  onToggle,
}) => {
  const getBarStyles = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: "absolute",
      display: "flex",
      backgroundColor: "#0d0d0d",
    };

    switch (position) {
      case "left":
        return {
          ...baseStyle,
          flexDirection: "column",
          top: 0,
          left: 0,
          borderRight: "1px solid #333",
          height: "100%",
          zIndex: 103,
        };
      case "right":
        return {
          ...baseStyle,
          flexDirection: "column",
          top: 0,
          right: 0,
          borderLeft: "1px solid #333",
          height: "100%",
          zIndex: 103,
        };
      case "bottom":
        return {
          ...baseStyle,
          flexDirection: "row",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          borderTop: "1px solid #333",
          zIndex: 103,
        };
    }
  };

  return (
    <div style={getBarStyles()}>
      {panels.map((panel) => {
        const isActive = activePanels.has(panel.id);
        return (
          <button
            key={panel.id}
            onClick={() => onToggle(panel.id)}
            title={panel.label}
            style={{
              padding: 8,
              backgroundColor: "transparent",
              border: "none",
              borderBottom: position === "bottom" ? "none" : "1px solid #333",
              borderRight: position === "bottom" ? "1px solid #333" : "none",
              color: isActive ? "#fff" : "#555",
              fontSize: 16,
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: position === "bottom" ? 40 : 36,
              minHeight: position === "bottom" ? 36 : 40,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "#888";
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.color = "#555";
              }
            }}
          >
            {panel.icon}
          </button>
        );
      })}
    </div>
  );
};
