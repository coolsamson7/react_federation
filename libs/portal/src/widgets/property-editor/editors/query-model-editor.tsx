import React from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";
import { QueryModel } from "../../../query/query-model";
import {
  CustomerQueryModel,
  OrderQueryModel,
  ProductQueryModel,
} from "../../../query/sample-query-models";

/**
 * Available query models
 */
const AVAILABLE_QUERY_MODELS: Record<string, QueryModel> = {
  customer: CustomerQueryModel,
  order: OrderQueryModel,
  product: ProductQueryModel,
};

/**
 * Property editor for selecting a QueryModel
 */
@RegisterPropertyEditor("queryModel")
export class QueryModelEditor extends PropertyEditor<QueryModel | null> {
  render() {
    const { value, onChange, label } = this.props;

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
          {label || "Query Model"}
        </label>
        <select
          value={value?.name || ""}
          onChange={(e) => {
            const modelKey = e.target.value;
            const model = modelKey ? AVAILABLE_QUERY_MODELS[modelKey] : null;
            onChange(model);
          }}
          style={{
            width: "100%",
            padding: "6px 10px",
            backgroundColor: "#2a2a2a",
            border: "1px solid #444",
            borderRadius: "4px",
            color: "#e0e0e0",
            fontSize: "13px",
            cursor: "pointer",
          }}
        >
          <option value="">None</option>
          <option value="customer">Customer Query</option>
          <option value="order">Order Query</option>
          <option value="product">Product Query</option>
        </select>

        {value && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px",
              backgroundColor: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "4px",
              fontSize: "11px",
              color: "#888",
            }}
          >
            <div>
              <strong>{value.criteria.length}</strong> search criteria
            </div>
            <div>
              <strong>{value.resultColumns.length}</strong> result columns
            </div>
          </div>
        )}
      </div>
    );
  }
}
