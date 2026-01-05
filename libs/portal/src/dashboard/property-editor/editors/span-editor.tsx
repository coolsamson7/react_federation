import React from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";

/**
 * Compact editor for grid span properties (colspan/rowspan)
 * Shows both values in one line like Webflow
 */
@RegisterPropertyEditor("span")
export class SpanEditor extends PropertyEditor<{ colSpan: number; rowSpan: number }> {
  render() {
    const { value = { colSpan: 1, rowSpan: 1 }, onChange, label } = this.props;

    return (
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#e0e0e0",
            marginBottom: "4px",
          }}
        >
          {label || "Span"}
        </label>
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
          }}
        >
          {/* Column Span */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#888",
                width: "32px",
              }}
            >
              Col
            </span>
            <input
              type="number"
              min="1"
              value={value.colSpan}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num) && num >= 1) {
                  onChange({ ...value, colSpan: num });
                }
              }}
              style={{
                flex: 1,
                padding: "6px 8px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #404040",
                borderRadius: 0,
                color: "#e0e0e0",
                fontSize: "14px",
                fontFamily: "inherit",
                textAlign: "center",
              }}
            />
          </div>

          {/* Row Span */}
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "4px" }}>
            <span
              style={{
                fontSize: "11px",
                color: "#888",
                width: "32px",
              }}
            >
              Row
            </span>
            <input
              type="number"
              min="1"
              value={value.rowSpan}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num) && num >= 1) {
                  onChange({ ...value, rowSpan: num });
                }
              }}
              style={{
                flex: 1,
                padding: "6px 8px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #404040",
                borderRadius: 0,
                color: "#e0e0e0",
                fontSize: "14px",
                fontFamily: "inherit",
                textAlign: "center",
              }}
            />
          </div>
        </div>
      </div>
    );
  }
}
