import React from "react";
import { InputEditor } from "../input-editor-metadata";
import { RegisterInputEditor } from "../input-editor-registry";

/**
 * Input editor for integer values
 */
@RegisterInputEditor("int")
export class IntInputEditor extends InputEditor<number> {
  render() {
    const { value, onChange, operandIndex = 0, placeholder } = this.props;

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
        type="number"
        step="1"
        value={value ?? ""}
        onChange={(e) => onChange(Math.floor(e.target.valueAsNumber) || 0)}
        placeholder={placeholder || `Value ${operandIndex + 1}`}
        style={inputStyle}
      />
    );
  }
}
