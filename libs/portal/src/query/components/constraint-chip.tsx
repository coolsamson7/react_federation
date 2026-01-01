import React, { useState } from "react";
import {AppliedConstraint} from "./constraint-panel";
import {ConstraintMethodDescriptor} from "@portal/validation";

interface ConstraintChipProps {
  constraint: AppliedConstraint;
  methodInfo: ConstraintMethodDescriptor;
  onUpdate: (params: Record<string, any>) => void;
  onRemove: () => void;
  canRemove?: boolean;
}

/**
 * Displays a single constraint from a SearchCriterion's type record as a chip.
 * Allows editing of the constraint's parameters in a dropdown.
 */
export function ConstraintChip({ constraint, methodInfo, onUpdate, onRemove }: ConstraintChipProps) {
  const [editing, setEditing] = useState(false);
  const chipRef = React.useRef<HTMLDivElement>(null);

  console.log("### chip ", constraint)

  // Close editing when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chipRef.current && !chipRef.current.contains(event.target as Node)) {
        setEditing(false);
      }
    }
    if (editing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [editing]);

  // Parse value for display/input
  const formatValue = (val: any, type: any) => {
    if (type === Boolean) return !!val;
    return val ?? "";
  };

  // Handle change according to type
  const handleChange = (name: string, val: string | boolean, type: any) => {
    let parsed: any = val;
    if (type === Number) parsed = Number(val);
    else if (type === Boolean) parsed = Boolean(val);
      onUpdate({ ...constraint.params, [name]: parsed });
  };

  return (
    <div
      ref={chipRef}
      onClick={() => methodInfo?.params.length && setEditing(!editing)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        backgroundColor: "#2a4a5a",
        border: "1px solid #3a6a7a",
        borderRadius: 16,
        fontSize: 12,
        color: "#e0e0e0",
        cursor: methodInfo?.params.length ? "pointer" : "default",
        position: "relative",
      }}
    >
      <span style={{ fontWeight: 500 }}>{constraint.name}</span>

      <button
        onClick={e => { e.stopPropagation(); onRemove(); }}
        style={{
          width: 16, height: 16, padding: 0, marginLeft: 4,
          backgroundColor: "transparent", border: "none",
          color: "#ff6b6b", cursor: "pointer", fontSize: 12, fontWeight: "bold",
          display: "flex", alignItems: "center", justifyContent: "center"
        }}
        title="Remove constraint"
      >
        ✕
      </button>

      {editing && methodInfo?.params.length && (
        <div
          style={{
            position: "absolute",
            top: "100%", left: 0, marginTop: 6,
            backgroundColor: "#1a1a1a", border: "1px solid #444",
            borderRadius: 4, padding: 8, minWidth: 200, zIndex: 1000
          }}
          onClick={e => e.stopPropagation()}
        >
          {methodInfo.params.map(p => (
            <div key={p.name} style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 11, color: "#b0b0b0", marginBottom: 4 }}>
                {p.name}:
              </label>

              {p.type === Boolean ? (
                <input
                  type="checkbox"
                  checked={formatValue(constraint.params[p.name], p.type)}
                  onChange={e => handleChange(p.name, e.target.checked, p.type)}
                  style={{
                    width: "auto", height: "16px", backgroundColor: "#2a2a2a",
                    border: "1px solid #404040", borderRadius: 2,
                    cursor: "pointer"
                  }}
                />
              ) : (
                <input
                  type={p.type === Number ? "number" :
                        p.type?.name === 'Date' ? "date" : "text"}
                  value={formatValue(constraint.params[p.name], p.type)}
                  onChange={e => handleChange(p.name, e.target.value, p.type)}
                  placeholder={`Enter ${p.name}`}
                  style={{
                    width: "100%", padding: 6, backgroundColor: "#2a2a2a",
                    border: "1px solid #404040", borderRadius: 2,
                    color: "#e0e0e0", fontSize: 11, boxSizing: "border-box"
                  }}
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

