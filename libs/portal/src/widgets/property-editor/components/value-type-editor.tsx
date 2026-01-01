import React, { useState, useEffect } from "react";
import { ValueType } from "../../examples/cube-widget-data";

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
  inputType = "text",
  placeholder = "Enter value or variable name"
}: ValueTypeEditorProps) {
  // Initialize with a default ValueType if none is provided
  const [localValue, setLocalValue] = useState<ValueType>(
    value || { type: 'value' as const, value: '' }
  );
  
  useEffect(() => {
    // Update local state when the prop changes
    if (value && (value.type !== localValue.type || value.value !== localValue.value)) {
      setLocalValue(value);
    }
  }, [value]);
  
  const handleTypeChange = () => {
    // Toggle between 'value' and 'variable'
    const newType = localValue.type === 'value' ? 'variable' as const : 'value' as const;
    const newValue = {
      ...localValue,
      type: newType
    };
    setLocalValue(newValue);
    onChange(newValue);
  };
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let newVal: string | number | boolean = e.target.value;
    
    // Convert value based on input type
    if (inputType === "number" && newVal !== "") {
      newVal = parseFloat(newVal as string);
    } else if (inputType === "checkbox") {
      newVal = (e.target as HTMLInputElement).checked;
    }
    
    const newValue = {
      ...localValue,
      value: newVal
    };
    setLocalValue(newValue);
    onChange(newValue);
  };

  // Main styles
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
    width: "100%"
  };
  
  const iconContainerStyle: React.CSSProperties = {
    position: "absolute",
    left: "6px",
    top: "50%",
    transform: "translateY(-50%)",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center"
  };

  // Conditional rendering for boolean type
  if (inputType === "boolean") {
    return (
      <div style={containerStyle}>
        <div style={iconContainerStyle} onClick={handleTypeChange}>
          {localValue.type === 'variable' ? (
            <span title="Variable binding" style={{ color: '#4a9eff' }}>⚡</span>
          ) : (
            <span title="Direct value" style={{ color: '#cccccc' }}>✏️</span>
          )}
        </div>
        
        <select 
          value={String(localValue.value)} 
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
  
  // For text, number and other types
  return (
    <div style={containerStyle}>
      <div style={iconContainerStyle} onClick={handleTypeChange}>
        {localValue.type === 'variable' ? (
          <span title="Variable binding" style={{ color: '#4a9eff' }}>⚡</span>
        ) : (
          <span title="Direct value" style={{ color: '#cccccc' }}>✏️</span>
        )}
      </div>
      
      <input
        type={inputType}
        value={localValue.value !== undefined ? String(localValue.value) : ''}
        onChange={handleValueChange}
        placeholder={placeholder}
        style={inputStyle}
      />
    </div>
  );
}