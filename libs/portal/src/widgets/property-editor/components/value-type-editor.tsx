import React from "react";
import { ValueType } from "../../examples/cube-widget-data";

/**
 * export type ValueType = {
 *   type: 'variable' | 'value';
 *   value:  string | number | boolean;
 * };
 */
interface ValueTypeEditorProps {
  value: ValueType;
  onChange: (value: ValueType) => void;
  inputType?: string;
  placeholder?: string;
}

/**
 * Component that lets users toggle between direct value and variable binding
 */
export function ValueTypeEditor({
  value,
  onChange,
  inputType = "string",
  placeholder = "Enter value or variable name",
}: ValueTypeEditorProps) {
  // Toggle between 'value' and 'variable'
  const handleTypeChange = () => {
    const newType = value.type === "value" ? "variable" : "value";

    // Reset value when switching type
    const resetValue: ValueType = {
      type: newType,
      value: newType === "value" ? getDefaultValue(inputType) : "",
    };

    onChange(resetValue);
  };

  // Handle input changes
  const handleValueChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let newVal: string | number | boolean = e.target.value;

    if (inputType === "number" && value.type === "value") {
      newVal = newVal === "" ? "" : parseFloat(newVal as string);
    } else if (inputType === "boolean") {
      newVal = (e.target as HTMLSelectElement).value === "true";
    }

    const newValue: ValueType = { ...value, value: newVal };
    onChange(newValue);
  };

  // Determine default value based on type
  const getDefaultValue = (type: string): string | number | boolean => {
    switch (type) {
      case "number":
        return 0;
      case "boolean":
        return false;
      default:
        return "";
    }
  };

  // Styles
  const containerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    width: "100%",
    position: "relative",
  };

  const inputStyle: React.CSSProperties = {
    flex: 1,
    padding: "4px 8px 4px 28px",
    backgroundColor: "#1a1a1a",
    color: "#e0e0e0",
    border: "1px solid #404040",
    borderRadius: "2px",
    fontSize: "11px",
    width: "100%",
  };

  const iconContainerStyle: React.CSSProperties = {
    position: "absolute",
    left: "6px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  };

  // Boolean input
  if (inputType === "boolean") {
    return (
      <div style={containerStyle}>
        <div style={iconContainerStyle} onClick={handleTypeChange}>
          {value.type === "variable" ? (
            <span title="Variable binding" style={{ color: "#4a9eff" }}>
              ⚡
            </span>
          ) : (
            <span title="Direct value" style={{ color: "#cccccc" }}>
              ✏️
            </span>
          )}
        </div>
        <select
          value={String(value.value)}
          onChange={handleValueChange}
          style={inputStyle}
        >
          <option value="">-- Select Value --</option>
          <option value="true">True</option>
          <option value="false">False</option>
        </select>
      </div>
    );
  }

  // Text or number input - key difference: use text input for variable type
  const inputTypeToUse = value.type === "variable" ? "text" : (inputType === "number" ? "number" : "text");

  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle} onClick={handleTypeChange}>
        {value.type === "variable" ? (
          <span title="Variable binding" style={{ color: "#4a9eff" }}>
            ⚡
          </span>
        ) : (
          <span title="Direct value" style={{ color: "#cccccc" }}>
            ✏️
          </span>
        )}
      </div>
      <input
        type={inputTypeToUse}
        value={value.value !== undefined ? String(value.value) : ""}
        onChange={handleValueChange}
        placeholder={value.type === "variable" ? "Variable name (e.g., myVar)" : placeholder}
        style={inputStyle}
      />
    </div>
  );
}