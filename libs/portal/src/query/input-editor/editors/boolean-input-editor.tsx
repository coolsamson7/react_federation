import React from "react";
import { InputEditor } from "../input-editor-metadata";
import { RegisterInputEditor } from "../input-editor-registry";

/**
 * Input editor for boolean values
 */
@RegisterInputEditor("boolean")
export class BooleanInputEditor extends InputEditor<boolean> {
  render() {
    const { value, onChange } = this.props;

    const inputStyle: React.CSSProperties = {
      flex: 1,
      padding: "8px 12px",
      backgroundColor: "#2a2a2a",
      border: "1px solid #444",
      borderRadius: "4px",
      color: "#e0e0e0",
      fontSize: "14px",
      outline: "none",
      cursor: "pointer",
    };

    return (
      <select
        value={value === true ? "true" : value === false ? "false" : ""}
        onChange={(e) => onChange(e.target.value === "true")}
        style={inputStyle}
      >
        <option value="">Select...</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }
}
