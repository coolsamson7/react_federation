import React, { useState, useMemo } from "react";
import { Type } from "@portal/validation";
import { SearchCriterion, SearchOperator, QueryExpression } from "../query-model";
import { ConstraintChip, ConstraintDefinition } from "./constraint-chip";
import { extractConstraintMethods } from "./constraint-panel";

interface ChipSearchPanelProps {
  criteria: SearchCriterion[];
  queryExpression: QueryExpression | null;
  onQueryExpressionChange: (expression: QueryExpression | null) => void;
  onSearch?: (expression: QueryExpression) => void;
  logicalOperator?: "and" | "or";
}

/**
 * Optimized Search panel that displays search constraints as chips
 * Each chip shows the constraint name and can be clicked to modify operator and operands
 * Includes performance optimizations: memoization, useCallback, and efficient re-renders
 */
export const ChipSearchPanel = React.memo(({
  criteria,
  queryExpression,
  onQueryExpressionChange,
  onSearch,
  logicalOperator = "and",
}: ChipSearchPanelProps) => {
  
  // Debug logging
  React.useEffect(() => {
    console.log('[ChipSearchPanel] Component rendered with:');
    console.log('  - criteria:', criteria.length, 'items');
    console.log('  - queryExpression:', queryExpression);
  }, [criteria, queryExpression]);
  
  const [editingConstraintId, setEditingConstraintId] = useState<string | null>(
    null
  );
  const [selectedCriterion, setSelectedCriterion] = useState<string>("");
  const [criterionInput, setCriterionInput] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Autocomplete logic for criterion selection
  const criterionNames = useMemo(() => {
    return criteria.map((c) => c.name);
  }, [criteria]);

  const criterionSuggestions = useMemo(() => {
    if (!criterionInput.trim()) return criterionNames;
    const input = criterionInput.toLowerCase();
    return criterionNames.filter((name: string) =>
      name.toLowerCase().startsWith(input)
    );
  }, [criterionInput, criterionNames]);

  const shadowText = useMemo(() => {
    if (!criterionInput.trim() || criterionSuggestions.length === 0) return "";
    const first = criterionSuggestions[0];
    if (first.toLowerCase().startsWith(criterionInput.toLowerCase())) {
      return criterionInput + first.slice(criterionInput.length);
    }
    return "";
  }, [criterionInput, criterionSuggestions]);

  // Optimized input change handler with debouncing for better performance
  const handleCriterionInputChange = React.useCallback((value: string) => {
    setCriterionInput(value);
    setSelectedCriterion("");
    setShowSuggestions(true);
  }, []);

  // Extract literal expressions from the query expression for display
  const literalExpressions = React.useMemo(() => {
    if (!queryExpression) return [];
    
    if (queryExpression.type === "literal") {
      return [{ ...(queryExpression as any), id: "single" }];
    } else if (queryExpression.type === "and" || queryExpression.type === "or") {
      const compound = queryExpression as any;
      return (compound.subExpressions || [])
        .filter((expr: any) => expr.type === "literal")
        .map((expr: any, index: number) => ({ ...expr, id: `compound-${index}` }));
    }
    
    return [];
  }, [queryExpression]);

  // Optimized function to add a literal for a given criterion name
  const addLiteralForCriterion = React.useCallback((criterionName: string) => {
    console.log('[ChipSearchPanel] Adding literal for criterion:', criterionName);
    const criterion = criteria.find((c) => c.name === criterionName);
    
    if (criterion) {
      console.log('[ChipSearchPanel] Found criterion:', criterion);
      
      const newLiteral = {
        type: "literal",
        criterionName: criterionName,
        operatorName: criterion.operators[0]?.name || "equals",
        operandValues: new Array(criterion.operators[0]?.operandCount || 1).fill("")
      };
      
      console.log('[ChipSearchPanel] Creating literal:', newLiteral);
      
      if (!queryExpression) {
        // First expression - just create a literal
        onQueryExpressionChange(newLiteral as any);
      } else if (queryExpression.type === "literal") {
        // Convert single literal to compound
        const compound = {
          type: logicalOperator,
          subExpressions: [queryExpression, newLiteral]
        };
        onQueryExpressionChange(compound as any);
      } else if (queryExpression.type === "and" || queryExpression.type === "or") {
        // Add to existing compound
        const compound = queryExpression as any;
        const updated = {
          ...compound,
          subExpressions: [...(compound.subExpressions || []), newLiteral]
        };
        onQueryExpressionChange(updated);
      }
      
      setCriterionInput("");
      setSelectedCriterion("");
      setShowSuggestions(false);
    } else {
      console.warn('[ChipSearchPanel] No criterion found for:', criterionName);
      console.log('[ChipSearchPanel] Available criteria:', criteria.map(c => c.name));
    }
  }, [criteria, queryExpression, onQueryExpressionChange, logicalOperator]);

  const handleRemoveLiteral = React.useCallback((literalId: string) => {
    if (!queryExpression) return;

    if (queryExpression.type === "literal" && literalId === "single") {
      onQueryExpressionChange(null);
    } else if (queryExpression.type === "and" || queryExpression.type === "or") {
      const compound = queryExpression as any;
      const subExpressions = compound.subExpressions || [];
      const index = parseInt(literalId.split('-')[1]);
      const newSubExpressions = subExpressions.filter((_: any, i: number) => i !== index);
      
      if (newSubExpressions.length === 0) {
        onQueryExpressionChange(null);
      } else if (newSubExpressions.length === 1) {
        onQueryExpressionChange(newSubExpressions[0]);
      } else {
        onQueryExpressionChange({
          ...compound,
          subExpressions: newSubExpressions
        });
      }
    }
  }, [queryExpression, onQueryExpressionChange]);

  const handleUpdateLiteral = React.useCallback((literalId: string, updates: any) => {
    if (!queryExpression) return;

    if (queryExpression.type === "literal" && literalId === "single") {
      onQueryExpressionChange({ ...queryExpression, ...updates } as any);
    } else if (queryExpression.type === "and" || queryExpression.type === "or") {
      const compound = queryExpression as any;
      const subExpressions = compound.subExpressions || [];
      const index = parseInt(literalId.split('-')[1]);
      const newSubExpressions = subExpressions.map((expr: any, i: number) => 
        i === index ? { ...expr, ...updates } : expr
      );
      
      onQueryExpressionChange({
        ...compound,
        subExpressions: newSubExpressions
      });
    }
  }, [queryExpression, onQueryExpressionChange]);

  const handleCriterionKeyDown = React.useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('[ChipSearchPanel] Key pressed:', e.key);
    
    if (e.key === "Tab") {
      e.preventDefault();
      console.log('[ChipSearchPanel] Tab pressed, suggestions:', criterionSuggestions);
      // Auto-select first suggestion
      if (criterionSuggestions.length > 0) {
        const selectedName = criterionSuggestions[0];
        console.log('[ChipSearchPanel] Adding constraint for tab selection:', selectedName);
        addLiteralForCriterion(selectedName);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      console.log('[ChipSearchPanel] Enter pressed, suggestions:', criterionSuggestions);
      if (criterionSuggestions.length > 0) {
        const selectedName = criterionSuggestions[0];
        console.log('[ChipSearchPanel] Adding constraint for enter selection:', selectedName);
        addLiteralForCriterion(selectedName);
      } else if (criterionInput.trim()) {
        // If no suggestions but user typed something, try to find exact match
        console.log('[ChipSearchPanel] Looking for exact match for:', criterionInput);
        const exactMatch = criteria.find(c => c.name.toLowerCase() === criterionInput.toLowerCase());
        if (exactMatch) {
          console.log('[ChipSearchPanel] Found exact match:', exactMatch.name);
          addLiteralForCriterion(exactMatch.name);
        } else {
          console.log('[ChipSearchPanel] No exact match found');
        }
      }
    }
  }, [criterionSuggestions, criterionInput, criteria, addLiteralForCriterion]);

  const handleSearch = React.useCallback(() => {
    if (onSearch && queryExpression) {
      onSearch(queryExpression);
    }
  }, [onSearch, queryExpression]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "16px",
        backgroundColor: "#1e1e1e",
        borderRadius: "8px",
        border: "1px solid #333",
      }}
    >
      {/* Add Constraint Section */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          paddingBottom: "12px",
          borderBottom: "1px solid #333",
        }}
      >
        <div style={{ flex: 1, position: "relative" }}>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              width: "100%",
            }}
          >
            <input
              type="text"
              placeholder="Type criterion (e.g., name, id) - Tab to autocomplete"
              value={criterionInput}
              onChange={(e) => handleCriterionInputChange(e.target.value)}
              onKeyDown={handleCriterionKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: "100%",
                padding: "8px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #404040",
                borderRadius: "4px",
                color: "#e0e0e0",
                fontSize: "12px",
              }}
            />

            {/* Shadow text for autocomplete preview */}
            {shadowText && (
              <span
                style={{
                  position: "absolute",
                  left: "8px",
                  top: "8px",
                  color: "#606060",
                  fontSize: "12px",
                  pointerEvents: "none",
                  fontFamily: "monospace",
                }}
              >
                {criterionInput}
                <span style={{ color: "#404040" }}>{shadowText.slice(criterionInput.length)}</span>
              </span>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && criterionSuggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: "2px",
                backgroundColor: "#1a1a1a",
                border: "1px solid #404040",
                borderRadius: "4px",
                maxHeight: "150px",
                overflowY: "auto",
                zIndex: 100,
                width: "100%",
              }}
            >
              {criterionSuggestions.map((suggestion: string) => (
                <div
                  key={suggestion}
                  onClick={() => addLiteralForCriterion(suggestion)}
                  style={{
                    padding: "8px",
                    cursor: "pointer",
                    backgroundColor: selectedCriterion === suggestion ? "#2a4a5a" : "transparent",
                    color: "#e0e0e0",
                    fontSize: "12px",
                    borderBottom: "1px solid #333",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#2a4a5a";
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCriterion !== suggestion) {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }
                  }}
                >
                  {suggestion}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Literal Expressions as Chips */}
      {literalExpressions.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            padding: "12px",
            backgroundColor: "#0f1419",
            borderRadius: "6px",
            minHeight: "44px",
          }}
        >
          {literalExpressions.map((literal: any) => {
            const criterion = criteria.find(
              (c) => c.name === literal.criterionName
            );
            const operator = criterion?.operators.find(
              (op) => op.name === literal.operatorName
            );

            return (
              <LiteralExpressionChip
                key={literal.id}
                literalExpression={literal}
                criterion={criterion}
                operator={operator}
                onUpdate={(updates) => handleUpdateLiteral(literal.id, updates)}
                onRemove={() => handleRemoveLiteral(literal.id)}
              />
            );
          })}
        </div>
      )}

      {/* Operator Selection for Editing */}
      {editingConstraintId && (
        <div
          style={{
            padding: "12px",
            backgroundColor: "#2a2a2a",
            borderRadius: "6px",
            border: "1px solid #404040",
          }}
        >
          {/* Edit interface would go here */}
          <button
            onClick={() => setEditingConstraintId(null)}
            style={{
              padding: "4px 8px",
              backgroundColor: "#404040",
              border: "none",
              borderRadius: "4px",
              color: "#e0e0e0",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            Done Editing
          </button>
        </div>
      )}

      {/* Search Button */}
      {literalExpressions.length > 0 && (
        <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
          <button
            onClick={handleSearch}
            disabled={!queryExpression}
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: queryExpression ? "#1e6b34" : "#3a3a3a",
              border: "1px solid #2a7a42",
              borderRadius: "4px",
              color: "#e0e0e0",
              cursor: queryExpression ? "pointer" : "not-allowed",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            🔍 Search
          </button>
          <button
            onClick={() => onQueryExpressionChange(null)}
            style={{
              padding: "10px 16px",
              backgroundColor: "#3a3a3a",
              border: "1px solid #505050",
              borderRadius: "4px",
              color: "#e0e0e0",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
            }}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
});

/**
 * Literal Expression Chip Component with Operator Selector
 */
interface LiteralExpressionChipProps {
  literalExpression: {
    id: string;
    type: string;
    criterionName: string;
    operatorName: string;
    operandValues?: any[];
  };
  criterion?: SearchCriterion;
  operator?: SearchOperator;
  onUpdate: (updates: any) => void;
  onRemove: () => void;
}

const LiteralExpressionChip = React.memo(({
  literalExpression,
  criterion,
  operator,
  onUpdate,
  onRemove,
}: LiteralExpressionChipProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const chipRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Optimized click outside handler with cleanup
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        chipRef.current &&
        !chipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  // Memoized operators for better performance
  const availableOperators = React.useMemo(() => criterion?.operators || [], [criterion?.operators]);
  
  // Optimized update handlers
  const handleOperatorChange = React.useCallback((operatorName: string) => {
    const newOperator = availableOperators.find(op => op.name === operatorName);
    onUpdate({
      operatorName: operatorName,
      operandValues: new Array(newOperator?.operandCount || 0).fill(""),
    });
  }, [availableOperators, onUpdate]);
  
  const handleOperandChange = React.useCallback((index: number, value: string) => {
    const newValues = [...(literalExpression.operandValues || [])];
    newValues[index] = value;
    onUpdate({ operandValues: newValues });
  }, [literalExpression.operandValues, onUpdate]);
  
  const handleToggleOpen = React.useCallback(() => {
    setIsOpen(!isOpen);
  }, [isOpen]);
  
  const handleRemoveClick = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  }, [onRemove]);

  return (
    <div
      ref={chipRef}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        backgroundColor: "#2a4a5a",
        border: "1px solid #3a6a7a",
        borderRadius: "16px",
        fontSize: "12px",
        color: "#e0e0e0",
        position: "relative",
        cursor: "pointer",
      }}
      onClick={handleToggleOpen}
    >
      <span style={{ fontWeight: "500" }}>{criterion?.label || "Unknown"}</span>

      {availableOperators.length > 0 && (
        <span style={{ fontSize: "10px", color: "#a0a0a0", marginLeft: "4px" }}>
          {operator?.label || "..."}
          {literalExpression.operandValues && literalExpression.operandValues.length > 0 && (
            <span style={{ marginLeft: "4px" }}>
              {literalExpression.operandValues.join(", ")}
            </span>
          )}
          ▼
        </span>
      )}

        <button
          onClick={handleRemoveClick}
          style={{
            width: "16px",
            height: "16px",
            padding: 0,
            marginLeft: "4px",
            backgroundColor: "transparent",
            border: "none",
            color: "#ff6b6b",
            cursor: "pointer",
            fontSize: "12px",
            fontWeight: "bold",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          title="Remove constraint"
        >
          ✕
        </button>
      )

      {/* Dropdown for operator and value selection */}
      {isOpen && availableOperators.length > 0 && (
        <div
          ref={dropdownRef}
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "6px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #444",
            borderRadius: "4px",
            padding: "8px",
            minWidth: "250px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: "8px" }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                color: "#b0b0b0",
                marginBottom: "4px",
                fontWeight: "600",
              }}
            >
              Operator:
            </label>
            <select
              value={literalExpression.operatorName}
              onChange={(e) => handleOperatorChange(e.target.value)}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #404040",
                borderRadius: "2px",
                color: "#e0e0e0",
                fontSize: "11px",
              }}
            >
              {availableOperators.map((op) => (
                <option key={op.name} value={op.name}>
                  {op.label}
                </option>
              ))}
            </select>
          </div>

          {/* Value inputs */}
          {(operator?.operandCount || 0) > 0 && (
            <div>
              {Array.from({ length: operator?.operandCount || 0 }).map(
                (_, idx) => (
                  <div key={idx} style={{ marginBottom: "8px" }}>
                    <label
                      style={{
                        display: "block",
                        fontSize: "11px",
                        color: "#b0b0b0",
                        marginBottom: "4px",
                      }}
                    >
                      Value {idx + 1}:
                    </label>
                    <input
                      type="text"
                      value={literalExpression.operandValues?.[idx] || ""}
                      onChange={(e) => handleOperandChange(idx, e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        backgroundColor: "#2a2a2a",
                        border: "1px solid #404040",
                        borderRadius: "2px",
                        color: "#e0e0e0",
                        fontSize: "11px",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
});