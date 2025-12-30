import React, { useState, useMemo } from "react";
import { Type } from "@portal/validation";
import { SearchCriterion, SearchOperator, QueryExpression } from "../query-model";
import { ConstraintChip, ConstraintDefinition } from "./constraint-chip";
import { extractConstraintMethods } from "./constraint-panel";

/**
 * Represents a search constraint in the chip format
 */
export interface SearchConstraint {
  id: string;
  criterionName: string;
  operator: string;
  operandValues: any[];
  mandatory: boolean;
  constraints: ConstraintDefinition[];
}

interface ChipSearchPanelProps {
  criteria: SearchCriterion[];
  constraints: SearchConstraint[];
  onConstraintsChange: (constraints: SearchConstraint[]) => void;
  onSearch?: (expression: QueryExpression) => void;
  logicalOperator?: "and" | "or";
  queryExpression?: QueryExpression | null;
}

/**
 * Search panel that displays search constraints as chips
 * Each chip shows the constraint name and can be clicked to modify operator and operands
 */
export function ChipSearchPanel({
  criteria,
  constraints,
  onConstraintsChange,
  onSearch,
  logicalOperator = "and",
  queryExpression,
}: ChipSearchPanelProps) {
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

  const handleCriterionInputChange = (value: string) => {
    setCriterionInput(value);
    setSelectedCriterion("");
    setShowSuggestions(true);
  };

  const handleCriterionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      // Auto-select first suggestion
      if (criterionSuggestions.length > 0) {
        const selectedName = criterionSuggestions[0];
        setCriterionInput(selectedName);
        setSelectedCriterion(selectedName);
        setShowSuggestions(false);
        // Auto-add constraint after selection
        setTimeout(() => {
          const criterion = criteria.find((c) => c.name === selectedName);
          if (criterion) {
            const newConstraint: SearchConstraint = {
              id: `constraint-${Date.now()}`,
              criterionName: selectedName,
              operator: criterion.operators[0]?.name || "equals",
              operandValues: new Array(criterion.operators[0]?.operandCount || 1).fill(null),
              mandatory: false,
              constraints: [],
            };
            onConstraintsChange([...constraints, newConstraint]);
            setCriterionInput("");
            setSelectedCriterion("");
          }
        }, 0);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (criterionSuggestions.length > 0) {
        const selectedName = criterionSuggestions[0];
        setCriterionInput(selectedName);
        setSelectedCriterion(selectedName);
        setShowSuggestions(false);
        // Auto-add constraint after selection
        setTimeout(() => {
          const criterion = criteria.find((c) => c.name === selectedName);
          if (criterion) {
            const newConstraint: SearchConstraint = {
              id: `constraint-${Date.now()}`,
              criterionName: selectedName,
              operator: criterion.operators[0]?.name || "equals",
              operandValues: new Array(criterion.operators[0]?.operandCount || 1).fill(null),
              mandatory: false,
              constraints: [],
            };
            onConstraintsChange([...constraints, newConstraint]);
            setCriterionInput("");
            setSelectedCriterion("");
          }
        }, 0);
      }
    }
  };

  // Build constraints from queryExpression when it changes
  React.useEffect(() => {
    if (queryExpression && queryExpression.type === "literal") {
      const expr = queryExpression as any;
      const existingConstraint = constraints.find(
        (c) => c.criterionName === expr.criterionName
      );

      if (!existingConstraint) {
        const criterion = criteria.find((c) => c.name === expr.criterionName);
        if (criterion) {
          const newConstraint: SearchConstraint = {
            id: `constraint-${Date.now()}`,
            criterionName: expr.criterionName,
            operator: expr.operatorName || criterion.operators[0]?.name || "equals",
            operandValues: expr.operandValues || [],
            mandatory: false,
            constraints: [],
          };
          onConstraintsChange([...constraints, newConstraint]);
        }
      }
    } else if (queryExpression && (queryExpression.type === "and" || queryExpression.type === "or")) {
      // Handle compound expressions
      const expr = queryExpression as any;
      const subExpressions = expr.subExpressions || [];
      
      const newConstraints: SearchConstraint[] = [];
      subExpressions.forEach((subExpr: any) => {
        if (subExpr.type === "literal") {
          const existingConstraint = constraints.find(
            (c) => c.criterionName === subExpr.criterionName && c.operator === subExpr.operatorName
          );
          
          if (!existingConstraint) {
            const criterion = criteria.find((c) => c.name === subExpr.criterionName);
            if (criterion) {
              newConstraints.push({
                id: `constraint-${Date.now()}-${Math.random()}`,
                criterionName: subExpr.criterionName,
                operator: subExpr.operatorName || criterion.operators[0]?.name || "equals",
                operandValues: subExpr.operandValues || [],
                mandatory: false,
                constraints: [],
              });
            }
          }
        }
      });

      if (newConstraints.length > 0) {
        onConstraintsChange([...constraints, ...newConstraints]);
      }
    }
  }, [queryExpression, criteria]);

  const handleRemoveConstraint = (id: string) => {
    const constraint = constraints.find((c) => c.id === id);
    if (constraint?.mandatory) return;

    onConstraintsChange(constraints.filter((c) => c.id !== id));
  };

  const handleUpdateConstraint = (
    id: string,
    updates: Partial<SearchConstraint>
  ) => {
    onConstraintsChange(
      constraints.map((c) => (c.id === id ? { ...c, ...updates } : c))
    );
  };

  const handleSearch = () => {
    if (onSearch) {
      // Build query expression from constraints
      // This would be expanded based on actual QueryExpression building logic
      const expression: QueryExpression = {
        type: logicalOperator === "and" ? "and" : "or",
      };
      onSearch(expression);
    }
  };

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
                  onClick={() => {
                    setCriterionInput(suggestion);
                    setSelectedCriterion(suggestion);
                    setShowSuggestions(false);
                    // Auto-add constraint after selection
                    setTimeout(() => {
                      const criterion = criteria.find((c) => c.name === suggestion);
                      if (criterion) {
                        const newConstraint: SearchConstraint = {
                          id: `constraint-${Date.now()}`,
                          criterionName: suggestion,
                          operator: criterion.operators[0]?.name || "equals",
                          operandValues: new Array(criterion.operators[0]?.operandCount || 1).fill(null),
                          mandatory: false,
                          constraints: [],
                        };
                        onConstraintsChange([...constraints, newConstraint]);
                        setCriterionInput("");
                        setSelectedCriterion("");
                      }
                    }, 0);
                  }}
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

      {/* Constraints as Chips */}
      {constraints.length > 0 && (
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
          {constraints.map((constraint) => {
            const criterion = criteria.find(
              (c) => c.name === constraint.criterionName
            );
            const operator = criterion?.operators.find(
              (op) => op.name === constraint.operator
            );

            return (
              <ConstraintChipWithOperator
                key={constraint.id}
                constraint={constraint}
                criterion={criterion}
                operator={operator}
                onUpdate={(updates) => handleUpdateConstraint(constraint.id, updates)}
                onRemove={() => handleRemoveConstraint(constraint.id)}
                canRemove={!constraint.mandatory}
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
      {constraints.length > 0 && (
        <div style={{ display: "flex", gap: "8px", paddingTop: "8px" }}>
          <button
            onClick={handleSearch}
            style={{
              flex: 1,
              padding: "10px 16px",
              backgroundColor: "#1e6b34",
              border: "1px solid #2a7a42",
              borderRadius: "4px",
              color: "#e0e0e0",
              cursor: "pointer",
              fontSize: "13px",
              fontWeight: "600",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#2a7a42";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1e6b34";
            }}
          >
            🔍 Search
          </button>
          <button
            onClick={() => onConstraintsChange([])}
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
}

/**
 * Constraint Chip Component with Operator Selector for ChipSearchPanel
 */
interface ConstraintChipWithOperatorProps {
  constraint: SearchConstraint;
  criterion?: SearchCriterion;
  operator?: SearchOperator;
  onUpdate: (updates: Partial<SearchConstraint>) => void;
  onRemove: () => void;
  canRemove?: boolean;
}

function ConstraintChipWithOperator({
  constraint,
  criterion,
  operator,
  onUpdate,
  onRemove,
  canRemove = true,
}: ConstraintChipWithOperatorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const chipRef = React.useRef<HTMLDivElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        chipRef.current &&
        !chipRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const availableOperators = criterion?.operators || [];

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
      onClick={() => setIsOpen(!isOpen)}
    >
      <span style={{ fontWeight: "500" }}>{criterion?.label || "Unknown"}</span>

      {availableOperators.length > 0 && (
        <span style={{ fontSize: "10px", color: "#a0a0a0", marginLeft: "4px" }}>
          {operator?.label || "..."}
          {constraint.operandValues.length > 0 && (
            <span style={{ marginLeft: "4px" }}>
              {constraint.operandValues.join(", ")}
            </span>
          )}
          ▼
        </span>
      )}

      {canRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
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
      )}

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
              value={constraint.operator}
              onChange={(e) =>
                onUpdate({
                  operator: e.target.value,
                  operandValues: new Array(
                    availableOperators.find((op) => op.name === e.target.value)
                      ?.operandCount || 0
                  ).fill(""),
                })
              }
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
                      value={constraint.operandValues[idx] || ""}
                      onChange={(e) => {
                        const newValues = [...constraint.operandValues];
                        newValues[idx] = e.target.value;
                        onUpdate({ operandValues: newValues });
                      }}
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
}
