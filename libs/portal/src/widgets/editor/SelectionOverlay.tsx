import React, { ReactNode } from "react";

interface SelectionOverlayProps {
  isSelected: boolean;
  label: string;
  children: ReactNode;
  onClick?: (e: React.MouseEvent) => void;
}

/**
 * Reusable selection overlay component that wraps widgets in edit mode
 * Shows selection border, label, and resize handles when selected
 */
export const SelectionOverlay: React.FC<SelectionOverlayProps> = ({
  isSelected,
  label,
  children,
  onClick,
}) => {
  return (
    <div
      style={{
        position: "relative",
        border: isSelected ? "2px solid #4A90E2" : "1px dashed #555",
        cursor: "pointer",
      }}
      onClick={onClick}
    >
      {/* Label box at top left */}
      {isSelected && (
        <div
          style={{
            position: "absolute",
            top: -24,
            left: -2,
            backgroundColor: "#4A90E2",
            color: "#fff",
            padding: "2px 8px",
            fontSize: 11,
            fontWeight: 600,
            borderRadius: "4px 4px 0 0",
            zIndex: 10,
            whiteSpace: "nowrap",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          {label}
        </div>
      )}

      {/* Content */}
      {children}

      {/* Resize handles - only shown when selected */}
      {isSelected && (
        <>
          {/* Top handle */}
          <Handle position="top" />
          {/* Right handle */}
          <Handle position="right" />
          {/* Bottom handle */}
          <Handle position="bottom" />
          {/* Left handle */}
          <Handle position="left" />
        </>
      )}
    </div>
  );
};

interface HandleProps {
  position: "top" | "right" | "bottom" | "left";
}

const Handle: React.FC<HandleProps> = ({ position }) => {
  const handleSize = 6;
  const offset = -3; // Half of handle size for centering

  const baseStyle: React.CSSProperties = {
    position: "absolute",
    backgroundColor: "#4A90E2",
    width: handleSize,
    height: handleSize,
    borderRadius: 1,
    zIndex: 20,
  };

  const positionStyles: Record<string, React.CSSProperties> = {
    top: {
      top: offset,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "ns-resize",
    },
    right: {
      right: offset,
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "ew-resize",
    },
    bottom: {
      bottom: offset,
      left: "50%",
      transform: "translateX(-50%)",
      cursor: "ns-resize",
    },
    left: {
      left: offset,
      top: "50%",
      transform: "translateY(-50%)",
      cursor: "ew-resize",
    },
  };

  return (
    <div
      style={{
        ...baseStyle,
        ...positionStyles[position],
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        // TODO: Implement resize functionality
      }}
    />
  );
};
