import React from "react";
import { InputEditor } from "../input-editor-metadata";
import { RegisterInputEditor } from "../input-editor-registry";

/**
 * Input editor for date values
 */
@RegisterInputEditor("date")
export class DateInputEditor extends InputEditor<string> {
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
    };

    return (
      <input
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        style={inputStyle}
      />
    );
  }
}
