import React, { useState } from "react";
import { SearchModelPanel, ChipSearchPanel } from "../../query/components";
import {QueryExpression, SearchModel} from "../../query/query-model";
import { Type } from "@portal/validation";

interface SearchPanelFullEditorProps {
  searchModel: SearchModel;
  predefinedQuery?: QueryExpression | null;
  availableTypes: Type<any>[];
  onSearchModelChange: (model: SearchModel) => void;
  onPredefinedQueryChange: (query: QueryExpression | null | undefined) => void;
  onClose: () => void;
}

/**
 * Full-screen editor for SearchPanel widget configuration
 * Opens in a modal/dialog for detailed editing
 */
export function SearchPanelFullEditor({
  searchModel,
  predefinedQuery,
  onSearchModelChange,
  onPredefinedQueryChange,
  onClose,
}: SearchPanelFullEditorProps) {
  const [activeTab, setActiveTab] = useState<"model" | "query">("model");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        backgroundColor: "#0d0d0d",
        borderRadius: "8px",
        border: "1px solid #333",
        maxHeight: "80vh",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "12px",
          borderBottom: "1px solid #333",
        }}
      >
        <h3 style={{ margin: 0, color: "#e0e0e0", fontSize: "16px" }}>
          Search Panel Configuration
        </h3>
        <button
          onClick={onClose}
          style={{
            padding: "6px 12px",
            backgroundColor: "#2a2a2a",
            border: "1px solid #333",
            borderRadius: "4px",
            color: "#e0e0e0",
            cursor: "pointer",
            fontSize: "12px",
          }}
        >
          Close
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid #333" }}>
        <button
          onClick={() => setActiveTab("model")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "model" ? "#2a4a5a" : "#1a1a1a",
            border: activeTab === "model" ? "1px solid #3a6a7a" : "1px solid transparent",
            borderBottom: activeTab === "model" ? "2px solid #4caf50" : "2px solid transparent",
            color: "#e0e0e0",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
          Search Model
        </button>
        <button
          onClick={() => setActiveTab("query")}
          style={{
            padding: "8px 16px",
            backgroundColor: activeTab === "query" ? "#2a4a5a" : "#1a1a1a",
            border: activeTab === "query" ? "1px solid #3a6a7a" : "1px solid transparent",
            borderBottom: activeTab === "query" ? "2px solid #4caf50" : "2px solid transparent",
            color: "#e0e0e0",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "600",
          }}
        >
            Query
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: "auto" }}>
        {activeTab === "model" ? (
          <div>
            <h4 style={{ margin: "0 0 12px 0", color: "#b0b0b0", fontSize: "13px" }}>
              Define Search Criteria and Type Constraints
            </h4>
            <SearchModelPanel
              onModelChange={onSearchModelChange}
              searchModel={searchModel}
            />
          </div>
        ) : (
          <div>

              <h4 style={{ margin: "0 0 12px 0", color: "#b0b0b0", fontSize: "13px" }}>
               A predefined query will be automatically loaded when the search panel initializes.
            </h4>
            
            {searchModel && searchModel.criteria && searchModel.criteria.length > 0 ? (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: "4px",
                }}
              >
                <div style={{ fontSize: "11px", color: "#999", marginBottom: "8px" }}>
                  Use the search panel to build and preview your predefined query:
                </div>
                <ChipSearchPanel
                  criteria={searchModel.criteria}
                  queryExpression={predefinedQuery || null}
                  onQueryExpressionChange={onPredefinedQueryChange}
                  onSearch={() => {}}
                />
                <div style={{ fontSize: "11px", color: "#999", marginTop: "12px", textAlign: "center" }}>
                  Query preview shown above. Auto-loaded when search panel starts.
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "12px",
                  backgroundColor: "#1a1a1a",
                  border: "1px dashed #333",
                  borderRadius: "4px",
                  color: "#666",
                  fontSize: "12px",
                  textAlign: "center",
                }}
              >
                Define search criteria first in the "Search Model" tab to view a predefined query preview
              </div>
            )}

            {predefinedQuery && false && (
              <button
                onClick={() => onPredefinedQueryChange(null)}
                style={{
                  marginTop: "12px",
                  padding: "6px 12px",
                  backgroundColor: "#5a2a2a",
                  border: "1px solid #7a3a3a",
                  borderRadius: "4px",
                  color: "#ff6b6b",
                  cursor: "pointer",
                  fontSize: "11px",
                }}
              >
                Clear Query
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
