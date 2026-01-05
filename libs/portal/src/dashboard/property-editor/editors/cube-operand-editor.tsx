import React from "react";
import {CubeOperator, OperandType} from "@portal/dashboard/property-editor/editors/cube-widget-data";

/**
 * Operand value type
 */
export type OperandValue = any; // date ranges, multiple operands, etc.

/**
 * Props
 */
interface OperandEditorProps {
  operator: CubeOperator;
  value: OperandValue[] | null; // always array
  onChange: (value: (string | number | boolean | string[] | number[] | [string, string] | null)[]) => void;
}

/**
 * Operand editor driven entirely by CubeOperator metadata
 */
export function OperandEditor({
  operator,
  value,
  onChange,
}: OperandEditorProps) {
  // fallback to empty operator to prevent crash
  const { operandTypes = ["string"], name = "" } = operator || {};

  // No operand expected
  if (!operandTypes || operandTypes.length === 0 || operandTypes[0] === "none") {
    return null;
  }

  // Single value input (including "usesCriterion")
  if (name === "usesCriterion") {
    // @ts-ignore
      return (
      <input
        type="text"
        value={value?.[0] ?? ""}
        onChange={(e) => onChange([e.target.value])}
        style={inputStyle}
      />
    );
  }

  // Multiple operands (e.g., date range)
  if (operandTypes.length > 1) {
    const current = Array.isArray(value) ? value : [];
    // @ts-ignore
      // @ts-ignore
      // @ts-ignore
      // @ts-ignore
      return (
      <div style={{ display: "flex", gap: 6 }}>
        {operandTypes.map((type, idx) => (
          <input
            key={idx}
            type={htmlInputType(type)}
            value={current[idx] ?? ""}
            onChange={(e) => {
              const next = [...current];
              // @ts-ignore
                next[idx] = parseValue(type, e.target.value);
              onChange(next);
            }}
            style={inputStyle}
          />
        ))}
      </div>
    );
  }

  // Single operand type
  const type = operandTypes[0];

  // Array input (comma-separated)
  if (type.endsWith("[]")) {
    return (
      <input
        type="text"
        value={Array.isArray(value) ? value.join(", ") : ""}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((v) => parseValue(type.replace("[]", ""), v.trim()))
          )
        }
        placeholder="Comma-separated values"
        style={inputStyle}
      />
    );
  }

  // Boolean input
  if (type === "boolean") {
    // @ts-ignore
      return (
      <select
        value={value?.[0] ?? ""}
        onChange={(e) => onChange([e.target.value === "true"])}
        style={inputStyle}
      >
        <option value="">Select…</option>
        <option value="true">True</option>
        <option value="false">False</option>
      </select>
    );
  }

  // Single string/number/date
  // @ts-ignore
    return (
    <input
      type={htmlInputType(type)}
      value={value?.[0] ?? ""}
      onChange={(e) => onChange([parseValue(type, e.target.value)])}
      style={inputStyle}
    />
  );
}

/* ---------------- helpers ---------------- */
function htmlInputType(type: OperandType): string {
  switch (type) {
    case "number":
      return "number";
    case "date":
      return "date";
    default:
      return "text";
  }
}

function parseValue(type: string, value: string): OperandValue | null {
  if (value === "") return null;
  switch (type) {
    case "number":
      return Number(value);
    case "boolean":
      return value === "true";
    default:
      return value;
  }
}

/* ---------------- styles ---------------- */
const inputStyle: React.CSSProperties = {
  padding: "4px 8px",
  backgroundColor: "#1a1a1a",
  color: "#e0e0e0",
  border: "1px solid #404040",
  borderRadius: "2px",
  fontSize: "11px",
  width: "100%",
};
