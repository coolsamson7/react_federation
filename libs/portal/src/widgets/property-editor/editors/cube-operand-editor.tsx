import React from "react";
import { CubeOperator, OperandType } from "@portal/query/cube-widget-data";

/**
 * Operand value type
 */
export type OperandValue =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | [string, string]; // date ranges, multiple operands, etc.

/**
 * Props
 */
interface OperandEditorProps {
  operator: CubeOperator;
  value: OperandValue[] | null; // ✅ always array
  onChange: (value: (string | number | boolean | string[] | number[] | [string, string] | null)[]) => void;

  /** Used only when operator === usesCriterion */
  availableCriteria?: { id: string; label: string }[];
}

/**
 * Operand editor driven entirely by CubeOperator metadata
 */
export function OperandEditor({
  operator,
  value,
  onChange,
  availableCriteria = [],
}: OperandEditorProps) {
  const { operandTypes, name } = operator;

  // No operand expected
  if (!operandTypes || operandTypes.length === 0 || operandTypes[0] === "none") {
    return null;
  }

  // 🔁 Criterion reference (single value)
  if (name === "usesCriterion") {
    return (
      <select
        value={value?.[0] != null ? String(value[0]) : ""}
        onChange={(e) => onChange([e.target.value])}
        style={inputStyle}
      >
        <option value="">Select criterion…</option>
        {availableCriteria.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>
    );
  }

  // Multiple operands (e.g. date range)
  if (operandTypes.length > 1) {
    const current = Array.isArray(value) ? value : [];

    return (
      <div style={{ display: "flex", gap: 6 }}>
        {operandTypes.map((type, idx) => (
          <input
            key={idx}
            type={htmlInputType(type)}
            value={formatValue(current[idx])}
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
    const itemType = type.replace("[]", "");
    return (
      <input
        type="text"
        value={Array.isArray(value) ? value.map(formatValue).join(", ") : ""}
        onChange={(e) =>
          onChange(
            e.target.value
              .split(",")
              .map((v) => parseValue(itemType, v.trim()))
          )
        }
        placeholder="Comma-separated values"
        style={inputStyle}
      />
    );
  }

  // Boolean input
  if (type === "boolean") {
    return (
      <select
        value={value?.[0] != null ? String(value[0]) : ""}
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
  return (
    <input
      type={htmlInputType(type)}
      value={formatValue(value?.[0])}
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

/** Convert boolean/number/etc to string for React input value */
function formatValue(val: OperandValue | undefined | null): string {
  if (val == null) return "";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number") return String(val);
  if (Array.isArray(val)) return val.map(formatValue).join(", ");
  if (Array.isArray(val) && val.length === 2) return val.join(", ");
  return String(val);
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
