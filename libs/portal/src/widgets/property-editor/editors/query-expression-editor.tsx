import React from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";
import { QueryExpression } from "../../../query/query-model";

/**
 * Property editor for QueryExpression values (placeholder)
 * Full implementation would need a query builder UI
 */
@RegisterPropertyEditor("queryExpression")
export class QueryExpressionEditor extends PropertyEditor<QueryExpression | null | undefined> {
  render() {
    const { value, onChange, label, propertyName } = this.props;

    return (
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#e0e0e0",
            marginBottom: "8px",
          }}
        >
          {label || propertyName}
        </label>
        <div
          style={{
            padding: "12px",
            backgroundColor: "#1a1a1a",
            border: "1px dashed #333",
            borderRadius: "4px",
            color: value ? "#4caf50" : "#666",
            fontSize: "12px",
            textAlign: "center",
          }}
        >
          {value ? (
            <>
              <div>✓ Query Expression configured</div>
              <button
                onClick={() => onChange(null)}
                style={{
                  marginTop: "8px",
                  padding: "4px 12px",
                  backgroundColor: "#5a2a2a",
                  border: "1px solid #7a3a3a",
                  borderRadius: "3px",
                  color: "#ff6b6b",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Clear
              </button>
            </>
          ) : (
            <div>No query expression defined (optional)</div>
          )}
        </div>
        <div
          style={{
            marginTop: "8px",
            fontSize: "11px",
            color: "#888",
          }}
        >
          Configure in the "Expand to Full Editor" dialog
        </div>
      </div>
    );
  }
}
