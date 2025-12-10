import React from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";

/**
 * Editor for string properties
 */
@RegisterPropertyEditor("string")
export class StringEditor extends PropertyEditor<string> {
  render() {
    const { value, onChange, label, propertyName } = this.props;

    return (
      <div style={{ marginBottom: "16px" }}>
        <label
          htmlFor={propertyName}
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#e0e0e0",
            marginBottom: "4px",
          }}
        >
          {label || propertyName}
        </label>
        <input
          id={propertyName}
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            backgroundColor: "#2a2a2a",
            border: "1px solid #404040",
            borderRadius: "4px",
            color: "#e0e0e0",
            fontSize: "14px",
            fontFamily: "inherit",
          }}
        />
      </div>
    );
  }
}
