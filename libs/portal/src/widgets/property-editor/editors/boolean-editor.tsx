import React from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";

/**
 * Property editor for boolean values
 */
@RegisterPropertyEditor("boolean")
export class BooleanEditor extends PropertyEditor<boolean> {
  render() {
    const { value, onChange, label, propertyName } = this.props;

    return (
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            fontWeight: "600",
            color: "#e0e0e0",
            cursor: "pointer",
            userSelect: "none",
          }}
        >
          <input
            type="checkbox"
            checked={value || false}
            onChange={(e) => onChange(e.target.checked)}
            style={{
              cursor: "pointer",
              width: "16px",
              height: "16px",
            }}
          />
          <span>{label || propertyName}</span>
        </label>
      </div>
    );
  }
}
