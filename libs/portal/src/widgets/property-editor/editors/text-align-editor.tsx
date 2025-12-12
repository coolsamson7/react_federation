import React from "react";
import { RegisterPropertyEditor } from "../property-editor-registry";

interface TextAlignEditorProps {
  propertyName: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

@RegisterPropertyEditor("textAlign")
export class TextAlignEditor extends React.Component<TextAlignEditorProps> {
  render() {
    const { label, value, onChange } = this.props;

    const alignments = [
      { value: "left", label: "Left", icon: "⬅" },
      { value: "center", label: "Center", icon: "↔" },
      { value: "right", label: "Right", icon: "➡" },
      { value: "justify", label: "Justify", icon: "⬌" },
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
        <div style={{ display: "flex", gap: "4px" }}>
          {alignments.map((alignment) => (
            <button
              key={alignment.value}
              onClick={() => onChange(alignment.value)}
              title={alignment.label}
              style={{
                flex: 1,
                padding: "6px",
                backgroundColor: value === alignment.value ? "#fff" : "#0d0d0d",
                border: "1px solid #333",
                borderRadius: "4px",
                color: value === alignment.value ? "#000" : "#888",
                fontSize: "14px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (value !== alignment.value) {
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                  e.currentTarget.style.color = "#e0e0e0";
                }
              }}
              onMouseLeave={(e) => {
                if (value !== alignment.value) {
                  e.currentTarget.style.backgroundColor = "#0d0d0d";
                  e.currentTarget.style.color = "#888";
                }
              }}
            >
              {alignment.icon}
            </button>
          ))}
        </div>
      </div>
    );
  }
}
