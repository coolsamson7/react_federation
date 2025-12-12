import React from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";

/**
 * Select dropdown editor for enum/option properties
 */
@RegisterPropertyEditor("select")
export class SelectEditor extends PropertyEditor<string> {
  render() {
    const { value, onChange, propertyMetadata } = this.props;
    const options = propertyMetadata?.options || [];

    return (
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "6px 8px",
          backgroundColor: "#2a2a2a",
          border: "1px solid #444",
          borderRadius: 4,
          color: "#e0e0e0",
          fontSize: 12,
          fontFamily: "inherit",
          cursor: "pointer",
          outline: "none",
        }}
      >
        {options.map((option: string) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    );
  }
}
