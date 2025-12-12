import React from "react";
import { RegisterPropertyEditor } from "../property-editor-registry";

interface ColorEditorProps {
  propertyName: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

@RegisterPropertyEditor("color")
export class ColorEditor extends React.Component<ColorEditorProps> {
  render() {
    const { label, value, onChange } = this.props;

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
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => onChange(e.target.value)}
            style={{
              width: "40px",
              height: "32px",
              border: "1px solid #333",
              borderRadius: "4px",
              backgroundColor: "transparent",
              cursor: "pointer",
            }}
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            style={{
              flex: 1,
              padding: "6px 8px",
              backgroundColor: "#0d0d0d",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#e0e0e0",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          />
        </div>
      </div>
    );
  }
}
