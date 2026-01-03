import React, { useState, useMemo } from "react";
import {SearchCriterion, QueryExpression, SearchModel} from "../../query/query-model";
import { SearchPanelProvider } from "./search-panel-context";

/**
 * Collapsible section for compact UI in property editor
 */
function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div style={{ marginBottom: "8px", border: "1px solid #333", borderRadius: "4px" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: "100%",
          padding: "8px",
          backgroundColor: "#1a1a1a",
          border: "none",
          color: "#e0e0e0",
          fontSize: "12px",
          fontWeight: "600",
          cursor: "pointer",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>{title}</span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "0.2s" }}>
          ▼
        </span>
      </button>
      {isOpen && (
        <div style={{ padding: "8px", backgroundColor: "#0f0f0f", borderTop: "1px solid #333" }}>
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * Compact input field for property editor
 */
function CompactInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <label style={{ display: "block", fontSize: "11px", color: "#b0b0b0", marginBottom: "4px" }}>
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "6px",
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "3px",
          color: "#e0e0e0",
          fontSize: "11px",
          boxSizing: "border-box",
        }}
      />
    </div>
  );
}

interface SearchPanelCompactEditorProps {
  searchModel: SearchModel;
  predefinedQuery?: QueryExpression | null;
  onSearchModelChange: (model: SearchModel) => void;
  onPredefinedQueryChange: (query: QueryExpression | null | undefined) => void;
  onOpenFullEditor?: () => void;
}

/**
 * Compact property editor for SearchPanel widget configuration
 * Suitable for property panel with limited horizontal space
 */
export function SearchPanelCompactEditor({
  searchModel,
  predefinedQuery,
  onSearchModelChange,
  onPredefinedQueryChange,
  onOpenFullEditor,
}: SearchPanelCompactEditorProps) {
  const [modelName, setModelName] = useState(searchModel.name || "");

  const handleModelNameChange = (name: string) => {
    setModelName(name);
    onSearchModelChange({ ...searchModel, name });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Model Name */}
      <CompactInput
        label="Model Name"
        value={modelName}
        onChange={handleModelNameChange}
        placeholder="e.g., CustomerSearch"
      />

      {/* Search Model Section */}
      <CollapsibleSection title="Search Criteria" defaultOpen={false}>
        <div style={{ fontSize: "11px", color: "#888" }}>
          <p style={{ margin: "0 0 8px 0" }}>
            Criteria: {searchModel.criteria?.length || 0} defined
          </p>
          {searchModel.criteria && searchModel.criteria.length > 0 && (
            <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "10px" }}>
              {searchModel.criteria.slice(0, 3).map((c: { label: any; name: any; }, i: React.Key | null | undefined) => (
                <li key={i} style={{ color: "#a0a0a0", marginBottom: "2px" }}>
                  {c.label || c.name}
                </li>
              ))}
              {searchModel.criteria.length > 3 && (
                <li style={{ color: "#666" }}>... and {searchModel.criteria.length - 3} more</li>
              )}
            </ul>
          )}
        </div>
      </CollapsibleSection>

      {/* Expand to Full Editor */}
      <button
        onClick={onOpenFullEditor}
        style={{
          padding: "8px 12px",
          backgroundColor: "#1e3a4a",
          border: "1px solid #2a4a5a",
          borderRadius: "4px",
          color: "#4caf50",
          fontSize: "11px",
          fontWeight: "600",
          cursor: "pointer",
          width: "100%",
        }}
      >
        🔧 Edit
      </button>
    </div>
  );
}
