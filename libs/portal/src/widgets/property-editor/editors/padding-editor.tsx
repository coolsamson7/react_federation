import React from "react";
import { RegisterPropertyEditor } from "../property-editor-registry";

interface PaddingEditorProps {
  propertyName: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

interface PaddingEditorState {
  numValue: string;
  unit: string;
}

@RegisterPropertyEditor("padding")
export class PaddingEditor extends React.Component<PaddingEditorProps, PaddingEditorState> {
  constructor(props: PaddingEditorProps) {
    super(props);

    // Parse the value into number and unit
    const parsed = this.parseValue(props.value || "8px");
    this.state = {
      numValue: parsed.numValue,
      unit: parsed.unit,
    };
  }

  parseValue(value: string): { numValue: string; unit: string } {
    const match = value.match(/^([\d.]+)(.*)$/);
    if (match) {
      return {
        numValue: match[1],
        unit: match[2] || "px",
      };
    }
    return { numValue: "0", unit: "px" };
  }

  componentDidUpdate(prevProps: PaddingEditorProps) {
    if (prevProps.value !== this.props.value && this.props.value) {
      const parsed = this.parseValue(this.props.value);
      this.setState({ numValue: parsed.numValue, unit: parsed.unit });
    }
  }

  handleNumChange = (num: string) => {
    this.setState({ numValue: num });
    this.props.onChange(`${num}${this.state.unit}`);
  };

  handleUnitChange = (unit: string) => {
    this.setState({ unit });
    this.props.onChange(`${this.state.numValue}${unit}`);
  };

  render() {
    const { label } = this.props;
    const { numValue, unit } = this.state;

    const units = ["px", "em", "rem", "%", "vh", "vw"];

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
          <input
            type="number"
            value={numValue}
            onChange={(e) => this.handleNumChange(e.target.value)}
            style={{
              flex: 1,
              padding: "6px 8px",
              backgroundColor: "#0d0d0d",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#e0e0e0",
              fontSize: "12px",
            }}
          />
          <select
            value={unit}
            onChange={(e) => this.handleUnitChange(e.target.value)}
            style={{
              padding: "6px 8px",
              backgroundColor: "#0d0d0d",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#e0e0e0",
              fontSize: "12px",
              cursor: "pointer",
              minWidth: "60px",
            }}
          >
            {units.map((u) => (
              <option key={u} value={u}>
                {u}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  }
}
