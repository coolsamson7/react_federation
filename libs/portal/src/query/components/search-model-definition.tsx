import React, { useState, useMemo } from "react";
import { Type } from "@portal/validation";
import { SearchCriterion, SearchOperator } from "../query-model";
import { ConstraintDefinition } from "./constraint-chip";

/**
 * Utility to extract constraint methods from a Type instance
 */
function extractConstraintMethods(typeInstance: Type<any>): Map<string, string[]> {
  const methods = new Map<string, string[]>();
  
  try {
    // Get the prototype chain to find all methods
    let current = Object.getPrototypeOf(typeInstance);
    const visited = new Set<any>();
    
    while (current && current !== Object.prototype && !visited.has(current)) {
      visited.add(current);
      
      // Get all property names from this level of the prototype chain
      const propertyNames = Object.getOwnPropertyNames(current);
      
      for (const key of propertyNames) {
        // Skip constructor and already-found methods
        if (key === "constructor" || methods.has(key)) continue;
        
        try {
          const descriptor = Object.getOwnPropertyDescriptor(current, key);
          if (descriptor && typeof descriptor.value === "function") {
            // Try to extract parameter names from the function
            const funcStr = descriptor.value.toString();
            const paramMatch = funcStr.match(/\(([^)]*)\)/);
            let paramNames: string[] = [];
            
            if (paramMatch && paramMatch[1]) {
              paramNames = paramMatch[1]
                .split(",")
                .map((p: string) => p.trim().split(":")[0].split("=")[0].trim())
                .filter((p: string) => p && p !== "info");
            }
            
            methods.set(key, paramNames);
          }
        } catch (e) {
          // Skip methods that can't be inspected
        }
      }
      
      current = Object.getPrototypeOf(current);
    }
  } catch (e) {
    console.error("[extractConstraintMethods] Error extracting methods:", e);
  }

  return methods;
}

/**
 * Enhanced search criterion with type constraints
 */
export interface CriterionWithConstraints extends SearchCriterion {
  typeConstraints: ConstraintDefinition[];
}

/**
 * Enhanced search model that includes type constraints
 */
export interface SearchModelWithConstraints {
  name: string;
  description?: string;
  criteria: CriterionWithConstraints[];
}

interface SearchModelDefinitionProps {
  availableTypes: Type<any>[];
  onModelChange: (model: SearchModelWithConstraints) => void;
  initialModel?: SearchModelWithConstraints;
}

/**
 * Component to define a SearchModel with type constraints for each criterion
 */
export function SearchModelDefinition({
  availableTypes,
  onModelChange,
  initialModel,
}: SearchModelDefinitionProps) {
  const [model, setModel] = useState<SearchModelWithConstraints>(
    initialModel || {
      name: "New Search Model",
      description: "",
      criteria: [],
    }
  );

  const [selectedType, setSelectedType] = useState<Type<any> | null>(null);
  const [criterionName, setCriterionName] = useState<string>("");
  const [editingCriterionIndex, setEditingCriterionIndex] = useState<
    number | null
  >(null);
  const [constraintName, setConstraintName] = useState<string>("");

  const handleAddCriterion = () => {
    if (!selectedType || !criterionName.trim()) {
      alert("Please enter a criterion name and select a type");
      return;
    }

    const newCriterion: CriterionWithConstraints = {
      name: criterionName.trim().toLowerCase().replace(/\s+/g, "_"),
      label: criterionName.trim(),
      path: criterionName.trim().toLowerCase().replace(/\s+/g, "_"),
      type: selectedType,
      mandatory: false,
      default: false,
      operators: [],
      typeConstraints: [],
    };

    const updatedCriteria = [...model.criteria, newCriterion];
    const updatedModel = { ...model, criteria: updatedCriteria };
    setModel(updatedModel);
    onModelChange(updatedModel);
    setSelectedType(null);
    setCriterionName("");
  };

  const handleRemoveCriterion = (index: number) => {
    const updatedCriteria = model.criteria.filter((_, i) => i !== index);
    const updatedModel = { ...model, criteria: updatedCriteria };
    setModel(updatedModel);
    onModelChange(updatedModel);
  };

  const handleUpdateConstraints = (
    index: number,
    constraints: ConstraintDefinition[]
  ) => {
    const updatedCriteria = [...model.criteria];
    updatedCriteria[index] = {
      ...updatedCriteria[index],
      typeConstraints: constraints,
    };
    const updatedModel = { ...model, criteria: updatedCriteria };
    setModel(updatedModel);
    onModelChange(updatedModel);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "16px",
        backgroundColor: "#252525",
        borderRadius: "8px",
        border: "1px solid #333",
      }}
    >
      <div>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#b0b0b0",
            marginBottom: "4px",
          }}
        >
          Model Name
        </label>
        <input
          type="text"
          value={model.name}
          onChange={(e) => {
            const updated = { ...model, name: e.target.value };
            setModel(updated);
            onModelChange(updated);
          }}
          style={{
            width: "100%",
            padding: "8px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #404040",
            borderRadius: "4px",
            color: "#e0e0e0",
            fontSize: "14px",
          }}
        />
      </div>

      {/* Add Criterion Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          paddingBottom: "12px",
          borderBottom: "1px solid #333",
        }}
      >
        <div style={{ fontSize: "12px", fontWeight: "600", color: "#b0b0b0" }}>
          Add New Criterion
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#999",
                marginBottom: "4px",
              }}
            >
              Criterion Name
            </label>
            <input
              type="text"
              placeholder="e.g., Customer Email, Order Total"
              value={criterionName}
              onChange={(e) => setCriterionName(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") handleAddCriterion();
              }}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "#1a1a1a",
                border: "1px solid #404040",
                borderRadius: "4px",
                color: "#e0e0e0",
                fontSize: "12px",
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                fontSize: "11px",
                fontWeight: "600",
                color: "#999",
                marginBottom: "4px",
              }}
            >
              Data Type
            </label>
            <select
              value={selectedType?.name || ""}
              onChange={(e) => {
                const type = availableTypes.find((t) => t.name === e.target.value);
                setSelectedType(type || null);
              }}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "#1a1a1a",
                border: "1px solid #404040",
                borderRadius: "4px",
                color: "#e0e0e0",
                fontSize: "12px",
              }}
            >
              <option value="">Select type...</option>
              {availableTypes.map((type) => (
                <option key={type.name} value={type.name}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddCriterion}
            disabled={!selectedType || !criterionName.trim()}
            style={{
              padding: "6px 16px",
              backgroundColor: selectedType && criterionName.trim() ? "#1e6b34" : "#3a3a3a",
              border: "1px solid #2a7a42",
              borderRadius: "4px",
              color: selectedType && criterionName.trim() ? "#4caf50" : "#606060",
              cursor: selectedType && criterionName.trim() ? "pointer" : "not-allowed",
              fontSize: "12px",
              fontWeight: "600",
              whiteSpace: "nowrap",
            }}
          >
            ➕ Add
          </button>
        </div>
      </div>

      {/* Criteria List */}
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {model.criteria.map((criterion, index) => (
          <div
            key={index}
            style={{
              padding: "12px",
              backgroundColor: "#1a1a1a",
              borderRadius: "4px",
              border: "1px solid #333",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "8px",
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "600",
                    color: "#e0e0e0",
                    fontSize: "13px",
                  }}
                >
                  {criterion.label || criterion.type.name}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#808080",
                    marginTop: "4px",
                  }}
                >
                  Type:{" "}
                  {editingCriterionIndex === index ? (
                    <select
                      value={criterion.type.name || ""}
                      onChange={(e) => {
                        const newType = availableTypes.find((t) => t.name === e.target.value);
                        if (newType) {
                          const updatedCriteria = [...model.criteria];
                          updatedCriteria[index] = { ...updatedCriteria[index], type: newType };
                          const updatedModel = { ...model, criteria: updatedCriteria };
                          setModel(updatedModel);
                          onModelChange(updatedModel);
                        }
                      }}
                      style={{
                        padding: "4px",
                        backgroundColor: "#252525",
                        border: "1px solid #404040",
                        borderRadius: "4px",
                        color: "#e0e0e0",
                        fontSize: "11px",
                        cursor: "pointer",
                        marginLeft: "4px",
                      }}
                    >
                      {availableTypes.map((type) => (
                        <option key={type.name} value={type.name}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span style={{ color: "#a0a0a0" }}>{criterion.type.name}</span>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  onClick={() =>
                    setEditingCriterionIndex(
                      editingCriterionIndex === index ? null : index
                    )
                  }
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#2a4a5a",
                    border: "1px solid #3a6a7a",
                    borderRadius: "4px",
                    color: "#e0e0e0",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  {editingCriterionIndex === index ? "Hide" : "Edit"}
                </button>
                <button
                  onClick={() => handleRemoveCriterion(index)}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: "#5a2a2a",
                    border: "1px solid #6a3a3a",
                    borderRadius: "4px",
                    color: "#ff6b6b",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  Remove
                </button>
              </div>
            </div>

            {/* Constraint Panel for this Criterion */}
            {editingCriterionIndex === index && (
              <ConstraintPanel
                criterion={criterion}
                onUpdateConstraints={(constraints) =>
                  handleUpdateConstraints(index, constraints)
                }
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Constraint Panel with autocomplete based on type's available methods
 */
interface ConstraintPanelProps {
  criterion: CriterionWithConstraints;
  onUpdateConstraints: (constraints: ConstraintDefinition[]) => void;
}

function ConstraintPanel({
  criterion,
  onUpdateConstraints,
}: ConstraintPanelProps) {
  const [constraintInput, setConstraintInput] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  // Extract available constraint methods from the type
  const availableMethods = useMemo(() => {
    const result = extractConstraintMethods(criterion.type);
    console.log(`[ConstraintPanel] Extracted methods for ${criterion.type.constructor.name}:`, Array.from(result.keys()));
    return result;
  }, [criterion.type]);

  const availableMethodNames = useMemo(() => {
    return Array.from(availableMethods.keys());
  }, [availableMethods]);

  // Filter suggestions based on input
  const suggestions = useMemo(() => {
    if (!constraintInput.trim()) return availableMethodNames;
    const input = constraintInput.toLowerCase();
    return availableMethodNames.filter((method: string) => 
      method.toLowerCase().startsWith(input)
    );
  }, [constraintInput, availableMethodNames]);

  // Get the first matching suggestion for shadow text
  const shadowText = useMemo(() => {
    if (!constraintInput.trim() || suggestions.length === 0) return "";
    const first = suggestions[0];
    if (first.toLowerCase().startsWith(constraintInput.toLowerCase())) {
      return constraintInput + first.slice(constraintInput.length);
    }
    return "";
  }, [constraintInput, suggestions]);

  const currentMethod = availableMethods.get(constraintInput);
  const needsParams = currentMethod && currentMethod.length > 0;

  const handleAddConstraint = (methodName: string) => {
    if (!methodName.trim()) return;

    const params: Record<string, string> = {};
    const methodParams = availableMethods.get(methodName) || [];
    
    methodParams.forEach((paramName) => {
      if (paramValues[paramName]) {
        params[paramName] = paramValues[paramName];
      }
    });

    const newConstraint: ConstraintDefinition = {
      id: `constraint-${Date.now()}`,
      name: methodName.trim(),
      test: {} as any,
      params,
    };

    onUpdateConstraints([...criterion.typeConstraints, newConstraint]);
    setConstraintInput("");
    setParamValues({});
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      // Auto-select first suggestion
      if (suggestions.length > 0) {
        setConstraintInput(suggestions[0]);
        setShowSuggestions(false);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      // Always add constraint on Enter (with or without params)
      handleAddConstraint(constraintInput);
    }
  };

  const handleParamKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault();
      handleAddConstraint(constraintInput);
    }
  };

  return (
    <div
      style={{
        marginTop: "8px",
        padding: "8px",
        backgroundColor: "#0f0f0f",
        borderRadius: "4px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: "600",
          color: "#b0b0b0",
          marginBottom: "8px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Type Constraints (Methods)</span>
        <span style={{ fontSize: "10px", backgroundColor: "#2a4a5a", padding: "2px 6px", borderRadius: "3px", color: "#4caf50" }}>v2 - Autocomplete Enabled</span>
      </div>

      {/* Add Constraint Input with Autocomplete */}
      <div
        style={{
          display: "flex",
          gap: "6px",
          marginBottom: "8px",
          position: "relative",
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
              placeholder="Type method (e.g., min, max) - Tab to autocomplete"
              value={constraintInput}
              onChange={(e) => {
                setConstraintInput(e.target.value);
                setShowSuggestions(true);
                setParamValues({});
              }}
              onKeyDown={handleKeyDown}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              style={{
                width: "100%",
                padding: "6px",
                backgroundColor: "#1a1a1a",
                border: "1px solid #404040",
                borderRadius: "4px",
                color: "#e0e0e0",
                fontSize: "11px",
              }}
            />

            {/* Shadow text for autocomplete preview */}
            {shadowText && (
              <span
                style={{
                  position: "absolute",
                  left: "6px",
                  top: "6px",
                  color: "#606060",
                  fontSize: "11px",
                  pointerEvents: "none",
                  fontFamily: "monospace",
                }}
              >
                {constraintInput}
                <span style={{ color: "#404040" }}>{shadowText.slice(constraintInput.length)}</span>
              </span>
            )}
          </div>

          {/* Autocomplete Suggestions Dropdown */}
          {showSuggestions && suggestions.length > 0 && (
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
              {suggestions.map((suggestion: string) => (
                <div
                  key={suggestion}
                  onClick={() => {
                    setConstraintInput(suggestion);
                    setShowSuggestions(false);
                    setParamValues({});
                  }}
                  style={{
                    padding: "6px",
                    cursor: "pointer",
                    backgroundColor: constraintInput === suggestion ? "#2a4a5a" : "transparent",
                    color: "#e0e0e0",
                    fontSize: "11px",
                    borderBottom: "1px solid #333",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "#2a4a5a";
                  }}
                  onMouseLeave={(e) => {
                    if (constraintInput !== suggestion) {
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

        {/* Parameter inputs - Tab/Enter to add */}
        {needsParams && currentMethod && (
          <>
            {currentMethod.map((paramName, idx) => (
              <input
                key={paramName}
                type="text"
                placeholder={paramName}
                value={paramValues[paramName] || ""}
                onChange={(e) => {
                  setParamValues((prev) => ({
                    ...prev,
                    [paramName]: e.target.value,
                  }));
                }}
                onKeyDown={(e) => {
                  if (e.key === "Tab" || e.key === "Enter") {
                    e.preventDefault();
                    handleAddConstraint(constraintInput);
                  }
                }}
                autoFocus={idx === 0}
                style={{
                  flex: 1,
                  padding: "6px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #404040",
                  borderRadius: "4px",
                  color: "#e0e0e0",
                  fontSize: "11px",
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Constraint chips */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "6px",
          padding: "6px",
          backgroundColor: "#1a1a1a",
          borderRadius: "4px",
          minHeight: "28px",
        }}
      >
        {criterion.typeConstraints.length === 0 ? (
          <span
            style={{
              fontSize: "11px",
              color: "#606060",
              fontStyle: "italic",
            }}
          >
            No constraints defined
          </span>
        ) : (
          criterion.typeConstraints.map((constraint) => (
            <ConstraintMethodChip
              key={constraint.id}
              constraint={constraint}
              methodParams={availableMethods.get(constraint.name) || []}
              onUpdateParams={(newParams) => {
                onUpdateConstraints(
                  criterion.typeConstraints.map((c) =>
                    c.id === constraint.id ? { ...c, params: newParams } : c
                  )
                );
              }}
              onRemove={() =>
                onUpdateConstraints(
                  criterion.typeConstraints.filter(
                    (c) => c.id !== constraint.id
                  )
                )
              }
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * Constraint Chip for method-based constraints with inline parameter editing
 */
interface ConstraintMethodChipProps {
  constraint: ConstraintDefinition;
  methodParams: string[];
  onUpdateParams: (params: Record<string, string>) => void;
  onRemove: () => void;
}

function ConstraintMethodChip({
  constraint,
  methodParams,
  onUpdateParams,
  onRemove,
}: ConstraintMethodChipProps) {
  const hasParams = methodParams.length > 0;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 12px",
        backgroundColor: "#2a4a5a",
        border: "1px solid #3a6a7a",
        borderRadius: "4px",
        fontSize: "12px",
        color: "#e0e0e0",
      }}
    >
      <span style={{ fontWeight: "500", minWidth: "60px" }}>{constraint.name}</span>

      {/* Inline parameter inputs */}
      {hasParams && methodParams.map((paramName) => (
        <input
          key={paramName}
          type="text"
          placeholder={paramName}
          value={constraint.params[paramName] || ""}
          onChange={(e) =>
            onUpdateParams({
              ...constraint.params,
              [paramName]: e.target.value,
            })
          }
          title={`Edit ${paramName}`}
          style={{
            width: "60px",
            padding: "4px 6px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #3a6a7a",
            borderRadius: "2px",
            color: "#e0e0e0",
            fontSize: "11px",
          }}
        />
      ))}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        style={{
          width: "20px",
          height: "20px",
          padding: 0,
          backgroundColor: "transparent",
          border: "none",
          color: "#ff6b6b",
          cursor: "pointer",
          fontSize: "14px",
          fontWeight: "bold",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        title="Remove constraint"
      >
        ✕
      </button>
    </div>
  );
}
