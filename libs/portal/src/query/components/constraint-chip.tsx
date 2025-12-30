import React, { useState } from "react";
import { Test, ConstraintInfo } from "@portal/validation";

export interface ConstraintDefinition {
  id: string;
  name: string;
  test: Test<any>;
  params: Record<string, any>;
  message?: string;
}

interface ConstraintChipProps {
  constraint: ConstraintDefinition;
  onUpdate: (params: Record<string, any>) => void;
  onRemove: () => void;
  canRemove?: boolean;
}

/**
 * Displays a single constraint as a chip with editable parameters
 */
export function ConstraintChip({
  constraint,
  onUpdate,
  onRemove,
  canRemove = true,
}: ConstraintChipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const chipRef = React.useRef<HTMLDivElement>(null);

  const paramKeys = Object.keys(constraint.params || {});

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        chipRef.current &&
        !chipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const handleParamChange = (paramName: string, value: any) => {
    const newParams = {
      ...constraint.params,
      [paramName]: value === "" ? undefined : value,
    };
    onUpdate(newParams);
  };

  return (
    <div
      ref={chipRef}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        backgroundColor: "#2a4a5a",
        border: "1px solid #3a6a7a",
        borderRadius: "16px",
        fontSize: "12px",
        color: "#e0e0e0",
        position: "relative",
        cursor: paramKeys.length > 0 ? "pointer" : "default",
      }}
      onClick={() => paramKeys.length > 0 && setIsOpen(!isOpen)}
    >
      <span style={{ fontWeight: "500" }}>{constraint.name}</span>

      {paramKeys.length > 0 && (
        <span 
          style={{ 
            fontSize: "10px", 
            color: "#a0a0a0",
            marginLeft: "4px",
          }}
          title={paramKeys.map((k) => `${k}: ${constraint.params[k]}`).join(", ")}
        >
          ▼
        </span>
      )}

      {canRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            width: "16px",
            height: "16px",
            padding: 0,
            marginLeft: paramKeys.length > 0 ? "2px" : "4px",
            backgroundColor: "transparent",
            border: "none",
            color: "#ff6b6b",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Remove constraint"
        >
          ✕
        </button>
      )}

      {/* Dropdown for parameter editing */}
      {isOpen && paramKeys.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "6px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #444",
            borderRadius: "4px",
            padding: "8px",
            minWidth: "200px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {paramKeys.map((paramName) => (
            <div key={paramName} style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "#b0b0b0",
                  marginBottom: "4px",
                  textTransform: "capitalize",
                }}
              >
                {paramName}:
              </label>
              <input
                type="text"
                value={String(constraint.params[paramName] || "")}
                onChange={(e) => handleParamChange(paramName, e.target.value)}
                style={{
                  width: "100%",
                  padding: "4px 6px",
                  backgroundColor: "#2a2a2a",
                  border: "1px solid #404040",
                  borderRadius: "2px",
                  color: "#e0e0e0",
                  fontSize: "12px",
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
