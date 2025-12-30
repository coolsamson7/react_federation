import React, { useState, useCallback, useEffect } from "react";
import {
  QueryModel,
  SearchCriterion,
  SearchOperator,
  TypeDescriptor,
  getDefaultOperatorsForType,
  QueryExpression,
  createAndExpression,
  createOrExpression,
  createLiteralExpression,
} from "./query-model";
import { inputEditorRegistry, initializeInputEditors } from "./input-editor/input-editor-registry";
import "./input-editor/editors/editor-registry";

/**
 * Represents a single row in the search panel
 */
export interface SearchRow {
  id: string;
  criterionName: string;
  operatorName: string;
  operandValues: any[];
}

interface SearchPanelProps {
  queryModel: QueryModel;
  logicalOperator?: "and" | "or";
  onSearch?: (expression: QueryExpression) => void;
  onChange?: (rows: SearchRow[]) => void;
}

// Initialize input editors on module load
initializeInputEditors();

/**
 * Render a dynamic input field based on the type descriptor
 * Uses the input editor registry to find the appropriate editor
 */
function DynamicInput({
  type,
  value,
  onChange,
  operandIndex,
}: {
  type: TypeDescriptor;
  value: any;
  onChange: (value: any) => void;
  operandIndex: number;
}) {
  const EditorClass = inputEditorRegistry.getEditor(type);

  if (!EditorClass) {
    console.warn(`[DynamicInput] No editor found for type: ${type}`);
    return (
      <div style={{ flex: 1, padding: "8px", color: "#ff6b6b", fontSize: "12px" }}>
        No editor for type: {type}
      </div>
    );
  }

  // Cast to any to avoid abstract class issue with React.createElement
  return React.createElement(EditorClass as any, {
    value,
    onChange,
    type,
    operandIndex,
  });
}

/**
 * Render a single search row
 */
function SearchRowComponent({
  row,
  queryModel,
  onChange,
  onRemove,
  onAdd,
  canDelete,
}: {
  row: SearchRow;
  queryModel: QueryModel;
  onChange: (row: SearchRow) => void;
  onRemove: () => void;
  onAdd: () => void;
  canDelete: boolean;
}) {
  const criteria: SearchCriterion[] = queryModel?.searchCriteria || [];
  const selectedCriterion = criteria.find((c) => c.name === row.criterionName);
  const operators = selectedCriterion?.operators || getDefaultOperatorsForType(selectedCriterion?.type || "string");
  const selectedOperator = operators.find((op) => op.name === row.operatorName);

  const handleCriterionChange = (criterionName: string) => {
    const criterion = criteria.find((c) => c.name === criterionName);
    const newOperators = criterion?.operators || getDefaultOperatorsForType(criterion?.type || "string");
    onChange({
      ...row,
      criterionName,
      operatorName: newOperators[0]?.name || "",
      operandValues: [],
    });
  };

  const handleOperatorChange = (operatorName: string) => {
    const operator = operators.find((op) => op.name === operatorName);
    const operandCount = operator?.operandCount || 1;
    onChange({
      ...row,
      operatorName,
      operandValues: new Array(operandCount).fill(null),
    });
  };

  const handleOperandChange = (index: number, value: any) => {
    const newValues = [...row.operandValues];
    newValues[index] = value;
    onChange({
      ...row,
      operandValues: newValues,
    });
  };

  return (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "center",
        padding: "12px",
        backgroundColor: "#252525",
        borderRadius: "6px",
        border: "1px solid #333",
      }}
    >
      {/* Criterion Combo */}
      <select
        value={row.criterionName}
        onChange={(e) => handleCriterionChange(e.target.value)}
        style={{
          flex: "0 0 200px",
          padding: "8px 12px",
          backgroundColor: "#2a2a2a",
          border: "1px solid #444",
          borderRadius: "4px",
          color: "#e0e0e0",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        <option value="">Select field...</option>
        {criteria.map((criterion) => (
          <option key={criterion.name} value={criterion.name}>
            {criterion.label}
          </option>
        ))}
      </select>

      {/* Operator Combo */}
      <select
        value={row.operatorName}
        onChange={(e) => handleOperatorChange(e.target.value)}
        style={{
          flex: "0 0 150px",
          padding: "8px 12px",
          backgroundColor: "#2a2a2a",
          border: "1px solid #444",
          borderRadius: "4px",
          color: "#e0e0e0",
          fontSize: "14px",
          cursor: "pointer",
        }}
        disabled={!selectedCriterion}
      >
        <option value="" hidden>Select operator...</option>
        {operators.map((operator) => (
          <option key={operator.name} value={operator.name}>
            {operator.label}
          </option>
        ))}
      </select>

      {/* Dynamic Input Fields */}
      {selectedOperator && selectedOperator.operandCount > 0 && (
        <div style={{ flex: 1, display: "flex", gap: "8px" }}>
          {Array.from({ length: selectedOperator.operandCount }).map((_, index) => (
            <DynamicInput
              key={index}
              type={selectedCriterion?.type || "string"}
              value={row.operandValues[index]}
              onChange={(value) => handleOperandChange(index, value)}
              operandIndex={index}
            />
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "6px", marginLeft: "8px" }}>
        {/* Add Button */}
        <button
          onClick={onAdd}
          style={{
            width: "32px",
            height: "32px",
            padding: 0,
            backgroundColor: "#fff",
            border: "none",
            borderRadius: "50%",
            color: "#000",
            fontSize: "20px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            fontWeight: "bold",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#e0e0e0";
            e.currentTarget.style.transform = "scale(1.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Add row"
        >
          +
        </button>

        {/* Remove Button */}
        <button
          onClick={onRemove}
          disabled={!canDelete}
          style={{
            width: "32px",
            height: "32px",
            padding: 0,
            backgroundColor: canDelete ? "#fff" : "#555",
            border: "none",
            borderRadius: "50%",
            color: canDelete ? "#000" : "#888",
            fontSize: "20px",
            cursor: canDelete ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s ease",
            fontWeight: "bold",
            opacity: canDelete ? 1 : 0.5,
          }}
          onMouseEnter={(e) => {
            if (canDelete) {
              e.currentTarget.style.backgroundColor = "#e0e0e0";
              e.currentTarget.style.transform = "scale(1.1)";
            }
          }}
          onMouseLeave={(e) => {
            if (canDelete) {
              e.currentTarget.style.backgroundColor = "#fff";
              e.currentTarget.style.transform = "scale(1)";
            }
          }}
          title={canDelete ? "Remove row" : "Cannot remove the last row"}
        >
          −
        </button>
      </div>
    </div>
  );
}

/**
 * Standalone SearchPanel Component
 */
export function SearchPanel({ queryModel, logicalOperator = "and", onSearch, onChange }: SearchPanelProps) {
  const [rows, setRows] = useState<SearchRow[]>([
    {
      id: crypto.randomUUID(),
      criterionName: "",
      operatorName: "",
      operandValues: [],
    },
  ]);
  const [logic, setLogic] = useState<"and" | "or">(logicalOperator);

  const addRow = useCallback(() => {
    const newRow: SearchRow = {
      id: crypto.randomUUID(),
      criterionName: "",
      operatorName: "",
      operandValues: [],
    };
    const newRows = [...rows, newRow];
    setRows(newRows);
    onChange?.(newRows);
  }, [rows, onChange]);

  const removeRow = useCallback(
    (index: number) => {
      const newRows = rows.filter((_, i) => i !== index);
      setRows(newRows);
      onChange?.(newRows);
    },
    [rows, onChange]
  );

  const updateRow = useCallback(
    (index: number, updatedRow: SearchRow) => {
      const newRows = [...rows];
      newRows[index] = updatedRow;
      setRows(newRows);
      onChange?.(newRows);
    },
    [rows, onChange]
  );

  const buildCurrentExpression = useCallback((): QueryExpression | null => {
    if (rows.length === 0) {
      return null;
    }

    const expressions = rows
      .filter((row) => row.criterionName && row.operatorName)
      .map((row) => createLiteralExpression(row.criterionName, row.operatorName, ...row.operandValues));

    if (expressions.length === 0) {
      return null;
    }

    return logic === "and" ? createAndExpression(...expressions) : createOrExpression(...expressions);
  }, [rows, logic]);

  const handleSearch = useCallback(() => {
    const expression = buildCurrentExpression();
    onSearch?.(expression as any);
  }, [buildCurrentExpression, onSearch]);

  const currentExpression = buildCurrentExpression();

  return (
    <div
      style={{
        backgroundColor: "#1e2a35",
        borderRadius: "8px",
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        minHeight: "200px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "16px",
          borderBottom: "1px solid #333",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "18px", fontWeight: 600, color: "#e0e0e0" }}>Search Criteria</h3>
        <select
          value={logic}
          onChange={(e) => setLogic(e.target.value as "and" | "or")}
          style={{
            padding: "6px 12px",
            backgroundColor: "#2a2a2a",
            border: "1px solid #444",
            borderRadius: "4px",
            color: "#e0e0e0",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <option value="and">AND</option>
          <option value="or">OR</option>
        </select>
      </div>

      {/* Search Rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {rows.map((row, index) => (
          <SearchRowComponent
            key={row.id}
            row={row}
            queryModel={queryModel}
            onChange={(updatedRow) => updateRow(index, updatedRow)}
            onRemove={() => removeRow(index)}
            onAdd={addRow}
            canDelete={rows.length > 1}
          />
        ))}
      </div>

      {/* Current Expression JSON */}
      {currentExpression && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#0d0d0d",
            border: "1px solid #333",
            borderRadius: "6px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#888",
              marginBottom: "8px",
            }}
          >
            Current Expression (JSON)
          </div>
          <pre
            style={{
              margin: 0,
              fontSize: "12px",
              color: "#4caf50",
              fontFamily: "monospace",
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
            }}
          >
            {JSON.stringify(currentExpression, null, 2)}
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: "12px" }}>
        <button
          onClick={handleSearch}
          style={{
            flex: 1,
            padding: "10px 16px",
            backgroundColor: "#2196f3",
            border: "none",
            borderRadius: "4px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#1976d2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2196f3";
          }}
        >
          <span>🔍</span>
          <span>Search</span>
        </button>
      </div>
    </div>
  );
}
