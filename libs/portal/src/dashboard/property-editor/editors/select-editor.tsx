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
          borderRadius: 0,
          color: "#e0e0e0",
          fontSize: 12,
          fontFamily: "inherit",
          cursor: "pointer",
          outline: "none",
          appearance: "none",
          WebkitAppearance: "none",
          MozAppearance: "none",
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23888' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 8px center",
          paddingRight: "28px",
        } as React.CSSProperties}
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
