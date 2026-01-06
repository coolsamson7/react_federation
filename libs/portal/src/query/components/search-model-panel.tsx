import React, { useState, useMemo } from "react";
import { Type } from "@portal/validation";
import {SearchCriterion, SearchModel, getDefaultOperatorsForType} from "../query-model";

/**
 * Props for SearchModelDefinition
 */
interface SearchModelPanelProps {
  onModelChange: (model: SearchModel) => void;
  searchModel: SearchModel;
}

/**
 * Component to define SearchCriteria with type constraints
 */
export function SearchModelPanel({
  onModelChange,
  searchModel,
}: SearchModelPanelProps) {
  const [criteria, setCriteria] = useState<SearchCriterion[]>(searchModel?.criteria || []);
  const [criterionName, setCriterionName] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // State per criterion for constraint input
  const [constraintInputs, setConstraintInputs] = useState<Record<number, string>>({});
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [showDropdowns, setShowDropdowns] = useState<Record<number, boolean>>({});
  const [selectedSuggestionIndexes, setSelectedSuggestionIndexes] = useState<Record<number, number>>({});
  const [shadowTexts, setShadowTexts] = useState<Record<number, string>>({});

  const newType = (typeName: string) => {
      return { [typeName]: {} }
  }

  const handleAddCriterion = () => {
    if (!criterionName.trim()) return;

    const newCriterion: SearchCriterion = {
      name: criterionName.trim().toLowerCase().replace(/\s+/g, "_"),
      label: criterionName.trim(),
      path: criterionName.trim().toLowerCase().replace(/\s+/g, "_"),
      type: newType("string"), // Default to string
      mandatory: false,
      default: false,
      //operators: getDefaultOperatorsForType(newType("string")),
    };

    const updated = [...criteria, newCriterion];

    setCriteria(updated);

    onModelChange({ ...searchModel, criteria: updated });

    setCriterionName("");
  };

  const handleRemoveCriterion = (index: number) => {
    const updated = criteria.filter((_, i) => i !== index);
    setCriteria(updated);
    onModelChange({ ...searchModel, criteria: updated });
  };

  // {"number": {"max": 10}}

  const handleAddConstraint = (index: number, methodName: string) => {
    if (!methodName.trim()) return;

    console.log("add constraint", methodName)

    // methodName is something like "max"

    const criterion = criteria[index];
    const typeRecord = criterion.type as Record<string, any>;
    const typeName = Object.keys(typeRecord)[0];
    const descriptor = Type.getConstraints(typeName).find(method => method.name === methodName);

    if (descriptor) {
      const constraintValue = descriptor.params.length === 0 ? true :
                            descriptor.params.length === 1 ? "" :
                            descriptor.params.reduce((acc, param) => {
                              acc[param.name] = "";
                              return acc;
                            }, {} as Record<string, any>);

      const updatedConstraints = {
        ...typeRecord[typeName],
        [methodName]: constraintValue
      };

      const newRecord = { ...typeRecord, [typeName]: updatedConstraints };
      const updatedCriterion = { ...criterion, type: newRecord };

      const updated = [...criteria];
      updated[index] = updatedCriterion;
      setCriteria(updated);

      onModelChange({ ...searchModel, criteria: updated });
    }

    // Clear for the specific criterion
    setConstraintInputs(prev => ({ ...prev, [index]: "" }));
    setParamValues({});
    setShowDropdowns(prev => ({ ...prev, [index]: false }));
    setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
    setShadowTexts(prev => ({ ...prev, [index]: "" }));
  };

  const availableTypes = Type.getTypes()

  // Function to handle type change and clear constraints
  const handleTypeChange = (index: number, newTypeName: string) => {
    const criterion = criteria[index];
    const newTypeRecord = newType(newTypeName);
    const updatedCriterion = { ...criterion, type: newTypeRecord };

    const updated = [...criteria];
    updated[index] = updatedCriterion;
    setCriteria(updated);
    onModelChange({ ...searchModel, criteria: updated });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, padding: 16, backgroundColor: "#252525", borderRadius: 8, border: "1px solid #333" }}>
      {/* Add Criterion */}
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        <input
          type="text"
          placeholder="Criterion Name"
          value={criterionName}
          onChange={(e) => setCriterionName(e.target.value)}
          onKeyPress={(e) => { if (e.key === "Enter") handleAddCriterion(); }}
          style={{ flex: 1, padding: 6, backgroundColor: "#1a1a1a", border: "1px solid #404040", borderRadius: 4, color: "#e0e0e0" }}
        />
        <button
          onClick={handleAddCriterion}
          disabled={!criterionName.trim()}
          style={{
            padding: "6px 16px",
            backgroundColor: !criterionName.trim() ? "#3a3a3a" : "#1e6b34",
            color: !criterionName.trim() ? "#606060" : "#4caf50",
            border: "1px solid #2a7a42",
            borderRadius: 4,
            cursor: !criterionName.trim() ? "not-allowed" : "pointer"
          }}
        >
          ➕ Add
        </button>
      </div>

      {/* Criteria List */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {criteria.map((criterion, index) => {
          const typeInstance = criterion.type as Record<string,any>;
          const typeName = Object.keys(typeInstance)[0];

          console.log("### HURZ")
          console.log(criterion);

          const availableMethods = Type.getConstraints(typeName);

          // Get state for this specific criterion
          const constraintInput = constraintInputs[index] || "";
          const showDropdown = showDropdowns[index] || false;
          const selectedSuggestionIndex = selectedSuggestionIndexes[index] ?? -1;
          const shadowText = shadowTexts[index] || "";

          const methodNames = availableMethods.map(m => m.name);
          const suggestions = constraintInput
            ? methodNames.filter(m => m.toLowerCase().startsWith(constraintInput.toLowerCase()))
            : methodNames; // Show all when empty

          const currentMethod = availableMethods.find(m => m.name === constraintInput);
          const needsParams = currentMethod?.params.length || 0;

          // Calculate completion text based on current selection or first match
          const getCompletionText = () => {
            if (!constraintInput || suggestions.length === 0) return "";
            const suggestion = selectedSuggestionIndex >= 0
              ? suggestions[selectedSuggestionIndex]
              : suggestions[0];
            if (suggestion && suggestion.toLowerCase().startsWith(constraintInput.toLowerCase())) {
              return suggestion;
            }
            return "";
          };

          const completionText = getCompletionText();

          // Helper functions for this criterion's autocomplete
          const handleInputChange = (value: string) => {
            setConstraintInputs(prev => ({ ...prev, [index]: value }));
            setParamValues({});
            const newSuggestions = value
              ? methodNames.filter(m => m.toLowerCase().startsWith(value.toLowerCase()))
              : methodNames;
            setShowDropdowns(prev => ({ ...prev, [index]: true }));
            setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));

            // Update completion text
            if (value && newSuggestions.length > 0) {
              const firstMatch = newSuggestions[0];
              if (firstMatch.toLowerCase().startsWith(value.toLowerCase())) {
                setShadowTexts(prev => ({ ...prev, [index]: firstMatch }));
              } else {
                setShadowTexts(prev => ({ ...prev, [index]: "" }));
              }
            } else {
              setShadowTexts(prev => ({ ...prev, [index]: "" }));
            }
          };

                    const acceptSuggestion = (suggestion?: string) => {
            const suggestionToUse = suggestion || completionText;

            if (suggestionToUse) {
              setConstraintInputs(prev => ({ ...prev, [index]: suggestionToUse }));
              setShadowTexts(prev => ({ ...prev, [index]: "" }));
              setShowDropdowns(prev => ({ ...prev, [index]: false }));
              setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));

              // Auto-add if no parameters needed
              const method = availableMethods.find(m => m.name === suggestionToUse);
              if (method && method.params.length === 0) {
                handleAddConstraint(index, suggestionToUse);
              }
            }
          };

          // Update completion when selection changes
          const updateCompletionText = (newSelectedIndex: number) => {
            setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: newSelectedIndex }));
            if (newSelectedIndex >= 0 && suggestions[newSelectedIndex]) {
              const suggestion = suggestions[newSelectedIndex];
              if (suggestion.toLowerCase().startsWith(constraintInput.toLowerCase())) {
                setShadowTexts(prev => ({ ...prev, [index]: suggestion }));
              }
            } else if (suggestions.length > 0) {
              const firstMatch = suggestions[0];
              if (firstMatch.toLowerCase().startsWith(constraintInput.toLowerCase())) {
                setShadowTexts(prev => ({ ...prev, [index]: firstMatch }));
              }
            }
          };

                    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            const input = e.currentTarget;

            if (e.key === "Tab" || e.key === "ArrowRight") {
              e.preventDefault();
              if (completionText && completionText !== constraintInput) {
                acceptSuggestion(completionText);
              }
              return;
            }

            if (!showDropdown || suggestions.length === 0) {
              if (e.key === "Enter") {
                e.preventDefault();
                if (constraintInput.trim()) {
                  handleAddConstraint(index, constraintInput);
                }
              }
              return;
            }

            if (e.key === "ArrowDown") {
              e.preventDefault();
              const newIndex = selectedSuggestionIndex < suggestions.length - 1
                ? selectedSuggestionIndex + 1
                : 0;
              updateCompletionText(newIndex);

              // Update input with selection
              setTimeout(() => {
                const suggestion = suggestions[newIndex];
                if (suggestion && suggestion.toLowerCase().startsWith(constraintInput.toLowerCase())) {
                  input.value = suggestion;
                  input.setSelectionRange(constraintInput.length, suggestion.length);
                }
              }, 0);
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              const newIndex = selectedSuggestionIndex > 0
                ? selectedSuggestionIndex - 1
                : suggestions.length - 1;
              updateCompletionText(newIndex);

              // Update input with selection
              setTimeout(() => {
                const suggestion = suggestions[newIndex];
                if (suggestion && suggestion.toLowerCase().startsWith(constraintInput.toLowerCase())) {
                  input.value = suggestion;
                  input.setSelectionRange(constraintInput.length, suggestion.length);
                }
              }, 0);
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (selectedSuggestionIndex >= 0) {
                acceptSuggestion(suggestions[selectedSuggestionIndex]);
              } else if (constraintInput.trim()) {
                handleAddConstraint(index, constraintInput);
              }
            } else if (e.key === "Escape") {
              setShowDropdowns(prev => ({ ...prev, [index]: false }));
              setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
              setShadowTexts(prev => ({ ...prev, [index]: "" }));
            }
          };

          const selectSuggestion = (suggestion: string) => {
            setConstraintInputs(prev => ({ ...prev, [index]: "" }));
            setShowDropdowns(prev => ({ ...prev, [index]: false }));
            setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
            setShadowTexts(prev => ({ ...prev, [index]: "" }));

            // Just add the constraint immediately - parameters can be filled in the chip
            handleAddConstraint(index, suggestion);
          };

          return (
            <div key={index} style={{ padding: 12, backgroundColor: "#1a1a1a", borderRadius: 4, border: "1px solid #333" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: "#e0e0e0" }}>{criterion.label || criterion.name}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#808080" }}>Type:</span>
                    <select
                      value={typeName}
                      onChange={(e) => handleTypeChange(index, e.target.value)}
                      style={{
                        fontSize: 11,
                        padding: "2px 6px",
                        backgroundColor: "#2a2a2a",
                        border: "1px solid #404040",
                        borderRadius: 3,
                        color: "#e0e0e0",
                        cursor: "pointer"
                      }}
                    >
                      {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => {
                      const newIndex = editingIndex === index ? null : index;
                      setEditingIndex(newIndex);
                      // Clear input state when switching
                      setConstraintInputs(prev => ({ ...prev, [index]: "" }));
                      setParamValues({});
                      setShowDropdowns(prev => ({ ...prev, [index]: false }));
                      setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
                      setShadowTexts(prev => ({ ...prev, [index]: "" }));
                    }}
                    style={{ fontSize: 11, padding: "4px 8px" }}
                  >
                    {editingIndex === index ? "Hide" : "Edit"}
                  </button>
                  <button onClick={() => handleRemoveCriterion(index)} style={{ fontSize: 11, padding: "4px 8px", color: "#ff6b6b" }}>Remove</button>
                </div>
              </div>

              {/* Constraint Panel */}
              {editingIndex === index && (
                <div style={{ marginTop: 8, padding: 8, backgroundColor: "#0f0f0f", borderRadius: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#b0b0b0", marginBottom: 8 }}>Type Constraints</div>

                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                                            {/* Constraint input field and chips in same area */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 8,
                          padding: 8,
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #404040",
                          borderRadius: 4,
                          minHeight: 32
                        }}
                      >
                        {/* Constraint chips */}
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          {typeInstance[typeName] && Object.entries(typeInstance[typeName]).map(([constraintName, constraintValue]) => {
                            const methodInfo = Type.getConstraints(typeName).find(m => m.name === constraintName);

                            return (
                              <div
                                key={constraintName}
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                  padding: "6px 10px",
                                  backgroundColor: "#2a4a5a",
                                  borderRadius: 4,
                                  fontSize: 11,
                                  color: "#e0e0e0"
                                }}
                              >
                                <span style={{ fontWeight: 500 }}>{constraintName}</span>

                                {/* Parameter input fields for this chip */}
                                {methodInfo?.params.map(param => {
                                  const currentValue = typeof constraintValue === 'object' && constraintValue !== null
                                    ? (constraintValue as Record<string, any>)[param.name] || ""
                                    : typeof constraintValue === 'string' || typeof constraintValue === 'number'
                                      ? constraintValue
                                      : "";

                                  const inputType = param.type === Number ? "number" :
                                                   param.type === Boolean ? "checkbox" : "text";
                                  const isCheckbox = param.type === Boolean;

                                  return (
                                    <input
                                      key={param.name}
                                      type={inputType}
                                      value={isCheckbox ? undefined : currentValue}
                                      checked={isCheckbox ? !!currentValue : undefined}
                                      onChange={(e) => {
                                        const rawValue = isCheckbox ? e.target.checked : e.target.value;
                                        const typedValue = param.type === Number ? Number(rawValue) :
                                                          param.type === Boolean ? rawValue :
                                                          rawValue;

                                        const newValue = methodInfo.params.length === 1
                                          ? typedValue
                                          : {
                                              ...(typeof constraintValue === 'object' ? constraintValue as Record<string, any> : {}),
                                              [param.name]: typedValue
                                            };

                                        const updatedConstraints = {
                                          ...typeInstance[typeName],
                                          [constraintName]: newValue
                                        };

                                        const newRecord = { ...typeInstance, [typeName]: updatedConstraints };
                                        const updatedCriterion = { ...criterion, type: newRecord };
                                        const newCriteria = [...criteria];
                                        newCriteria[index] = updatedCriterion;
                                        setCriteria(newCriteria);
                                        onModelChange({ ...searchModel, criteria: newCriteria });
                                      }}
                                      style={{
                                        width: isCheckbox ? "auto" : 50,
                                        height: isCheckbox ? 14 : "auto",
                                        padding: isCheckbox ? 0 : 3,
                                        backgroundColor: "#1a1a1a",
                                        border: "1px solid #555",
                                        borderRadius: 2,
                                        color: "#e0e0e0",
                                        fontSize: 10
                                      }}
                                    />
                                  );
                                })}

                                <button
                                  onClick={() => {
                                    const updatedConstraints = { ...typeInstance[typeName] };
                                    delete updatedConstraints[constraintName];
                                    const newRecord = { ...typeInstance, [typeName]: updatedConstraints };
                                    const updatedCriterion = { ...criterion, type: newRecord };
                                    const newCriteria = [...criteria];
                                    newCriteria[index] = updatedCriterion;
                                    setCriteria(newCriteria);
                                    onModelChange({ ...searchModel, criteria: newCriteria });
                                  }}
                                  style={{
                                    width: 16,
                                    height: 16,
                                    padding: 0,
                                    backgroundColor: "transparent",
                                    border: "none",
                                    color: "#ff6b6b",
                                    cursor: "pointer",
                                    fontSize: 12,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            );
                          })}
                        </div>

                                                {/* Input field for adding new constraints */}
                        <div style={{ position: "relative" }}>
                          <input
                            type="text"
                            value={constraintInput}
                            placeholder="Type constraint name..."
                            onChange={(e) => {
                              const newValue = e.target.value;
                              // Prevent onChange when we're just updating selection
                              if (newValue.length >= constraintInput.length || !completionText.startsWith(newValue)) {
                                handleInputChange(newValue);
                              }
                            }}
                            onKeyDown={handleKeyDown}
                            onFocus={(e) => {
                              setShowDropdowns(prev => ({ ...prev, [index]: true }));
                              // Show completion on focus if there's a match
                              const input = e.currentTarget;
                              if (completionText && completionText !== constraintInput) {
                                setTimeout(() => {
                                  input.value = completionText;
                                  input.setSelectionRange(constraintInput.length, completionText.length);
                                }, 0);
                              }
                            }}
                            onBlur={(e) => {
                              setTimeout(() => {
                                setShowDropdowns(prev => ({ ...prev, [index]: false }));
                                setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
                                setShadowTexts(prev => ({ ...prev, [index]: "" }));
                                // Reset to actual input value on blur
                                e.target.value = constraintInput;
                              }, 200);
                            }}
                            style={{
                              width: "100%",
                              padding: 6,
                              backgroundColor: "#0f0f0f",
                              border: "1px solid #555",
                              borderRadius: 4,
                              color: "#e0e0e0",
                              fontSize: 11
                            }}
                          />
                        </div>
                      </div>

                      {/* Dropdown */}
                      {showDropdown && suggestions.length > 0 && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            right: 0,
                            marginTop: 2,
                            backgroundColor: "#1a1a1a",
                            border: "1px solid #404040",
                            borderRadius: 4,
                            maxHeight: 200,
                            overflowY: "auto",
                            zIndex: 1000,
                            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)"
                          }}
                        >
                          {suggestions.map((suggestion, suggestionIndex) => {
                            const method = availableMethods.find(m => m.name === suggestion);
                            const paramCount = method?.params.length || 0;

                            return (
                              <div
                                key={suggestion}
                                onClick={() => selectSuggestion(suggestion)}
                                style={{
                                  padding: "8px 12px",
                                  cursor: "pointer",
                                  backgroundColor: selectedSuggestionIndex === suggestionIndex ? "#2a4a5a" : "transparent",
                                  color: "#e0e0e0",
                                  fontSize: 11,
                                  borderBottom: suggestionIndex < suggestions.length - 1 ? "1px solid #333" : "none",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center"
                                }}
                                onMouseEnter={() => setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: suggestionIndex }))}
                              >
                                <span>{suggestion}</span>
                                {paramCount > 0 && (
                                  <span style={{ fontSize: 10, color: "#888" }}>({paramCount} param{paramCount > 1 ? 's' : ''})</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {needsParams > 0 && currentMethod?.params.map(p => (
                      <input
                        key={p.name}
                        type={p.type === Number ? "number" : "text"}
                        value={paramValues[p.name] || ""}
                        onChange={(e) => setParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddConstraint(index, constraintInput);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: 6,
                          backgroundColor: "#1a1a1a",
                          border: "1px solid #404040",
                          borderRadius: 4,
                          color: "#e0e0e0",
                          fontSize: 11
                        }}
                      />
                    ))}

                    {constraintInput && (
                      <button
                        onClick={() => handleAddConstraint(index, constraintInput)}
                        style={{
                          padding: "6px 12px",
                          backgroundColor: "#1e6b34",
                          border: "1px solid #2a7a42",
                          borderRadius: 4,
                          color: "#e0e0e0",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: 600
                        }}
                      >
                        + Add
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
