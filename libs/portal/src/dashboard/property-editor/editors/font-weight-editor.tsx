import React from "react";
import { RegisterPropertyEditor } from "../property-editor-registry";

interface FontWeightEditorProps {
  propertyName: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

@RegisterPropertyEditor("fontWeight")
export class FontWeightEditor extends React.Component<FontWeightEditorProps> {
  render() {
    const { label, value, onChange } = this.props;

    const weights = [
      { value: "normal", label: "Normal" },
      { value: "bold", label: "Bold" },
      { value: "100", label: "100" },
      { value: "200", label: "200" },
      { value: "300", label: "300" },
      { value: "400", label: "400" },
      { value: "500", label: "500" },
      { value: "600", label: "600" },
      { value: "700", label: "700" },
      { value: "800", label: "800" },
      { value: "900", label: "900" },
    ];

    return (
      <div style={{ marginBottom: "12px" }}>
        <label
          style={{
            display: "block",
            fontSize: "11px",
            fontWeight: "500",
            color: "#a0a0a0",
            marginBottom: "6px",
          }}
        >
          {label}
        </label>
        <select
          value={value || "normal"}
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
          {weights.map((weight) => (
            <option key={weight.value} value={weight.value}>
              {weight.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
