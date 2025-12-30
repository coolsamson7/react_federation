import React, { useState, useMemo } from "react";
import { Type } from "@portal/validation";
import { ConstraintDefinition } from "./constraint-chip";

/**
 * Utility to extract constraint methods from a Type instance
 */
export function extractConstraintMethods(typeInstance: Type<any>): Map<string, string[]> {
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

interface ConstraintPanelProps {
  criterion: {
    type: Type<any>;
    typeConstraints: ConstraintDefinition[];
  };
  onUpdateConstraints: (constraints: ConstraintDefinition[]) => void;
}

/**
 * Constraint Panel with autocomplete based on type's available methods
 */
export function ConstraintPanel({
  criterion,
  onUpdateConstraints,
}: ConstraintPanelProps) {
  const [constraintInput, setConstraintInput] = useState<string>("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

  // [v2] Method-based constraint autocomplete system

  // Extract available constraint methods from the type
  const availableMethods = useMemo(() => {
    return extractConstraintMethods(criterion.type);
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
      if (!needsParams) {
        handleAddConstraint(constraintInput);
      }
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
        }}
      >
        Type Constraints (Methods)
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

        {/* Parameter inputs */}
        {needsParams && currentMethod && (
          <>
            {currentMethod.map((paramName) => (
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
                onKeyDown={handleParamKeyDown}
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

        <button
          onClick={() => handleAddConstraint(constraintInput)}
          disabled={!constraintInput.trim()}
          style={{
            padding: "6px 12px",
            backgroundColor: constraintInput.trim() ? "#2a4a5a" : "#1a1a1a",
            border: "1px solid #3a6a7a",
            borderRadius: "4px",
            color: constraintInput.trim() ? "#e0e0e0" : "#606060",
            cursor: constraintInput.trim() ? "pointer" : "not-allowed",
            fontSize: "11px",
            fontWeight: "600",
            whiteSpace: "nowrap",
          }}
        >
          + Add
        </button>
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
  const [isEditing, setIsEditing] = useState(false);
  const chipRef = React.useRef<HTMLDivElement>(null);

  // Close when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (chipRef.current && !chipRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    }

    if (isEditing) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isEditing]);

  return (
    <div
      ref={chipRef}
      onClick={() => methodParams.length > 0 && setIsEditing(!isEditing)}
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
        cursor: methodParams.length > 0 ? "pointer" : "default",
      }}
    >
      <span style={{ fontWeight: "500" }}>{constraint.name}</span>

      {methodParams.length > 0 && (
        <>
          <span style={{ fontSize: "10px", color: "#a0a0a0" }}>▼</span>
          {!isEditing && constraint.params && Object.keys(constraint.params).length > 0 && (
            <span style={{ fontSize: "10px", color: "#80b080" }}>
              ({Object.entries(constraint.params)
                .map(([, v]) => v)
                .join(", ")})
            </span>
          )}
        </>
      )}

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

      {/* Inline parameter editing */}
      {isEditing && methodParams.length > 0 && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            marginTop: "6px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #444",
            borderRadius: "4px",
            padding: "8px",
            minWidth: "200px",
            zIndex: 1000,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.5)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {methodParams.map((paramName) => (
            <div key={paramName} style={{ marginBottom: "8px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "11px",
                  color: "#b0b0b0",
                  marginBottom: "4px",
                  textTransform: "capitalize",
                  fontWeight: "600",
                }}
              >
                {paramName}:
              </label>
              <input
                type="text"
                value={constraint.params[paramName] || ""}
                onChange={(e) =>
                  onUpdateParams({
                    ...constraint.params,
                    [paramName]: e.target.value,
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
                  boxSizing: "border-box",
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
