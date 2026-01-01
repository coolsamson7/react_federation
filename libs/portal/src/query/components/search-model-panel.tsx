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
  const [selectedType, setSelectedType] = useState<string | null>(null); // null??
  const [criterionName, setCriterionName] = useState<string>("");
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  // State per criterion for constraint input
  const [constraintInputs, setConstraintInputs] = useState<Record<number, string>>({});
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [showDropdowns, setShowDropdowns] = useState<Record<number, boolean>>({});
  const [selectedSuggestionIndexes, setSelectedSuggestionIndexes] = useState<Record<number, number>>({});

  const newType = (typeName: string) => {
      return { [typeName]: {} }
  }

  const handleAddCriterion = () => {
    if (!selectedType || !criterionName.trim()) return;

    const newCriterion: SearchCriterion = {
      name: criterionName.trim().toLowerCase().replace(/\s+/g, "_"),
      label: criterionName.trim(),
      path: criterionName.trim().toLowerCase().replace(/\s+/g, "_"),
      type: newType(selectedType),
      mandatory: false,
      default: false,
      //operators: getDefaultOperatorsForType(newType(selectedType)),
    };

    const updated = [...criteria, newCriterion];

    setCriteria(updated);

    onModelChange({ ...searchModel, criteria: updated });

    setSelectedType(null);
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
  };

  const availableTypes = Type.getTypes()

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
        <select
          value={selectedType || "string"}
          onChange={(e) => {
            setSelectedType(e.target.value);
          }}
          style={{ flex: 1, padding: 6, backgroundColor: "#1a1a1a", border: "1px solid #404040", borderRadius: 4, color: "#e0e0e0" }}
        >
          <option value="">Select type...</option>
          {availableTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button
          onClick={handleAddCriterion}
          disabled={!selectedType || !criterionName.trim()}
          style={{
            padding: "6px 16px",
            backgroundColor: (!selectedType || !criterionName.trim()) ? "#3a3a3a" : "#1e6b34",
            color: (!selectedType || !criterionName.trim()) ? "#606060" : "#4caf50",
            border: "1px solid #2a7a42",
            borderRadius: 4,
            cursor: (!selectedType || !criterionName.trim()) ? "not-allowed" : "pointer"
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
          const selectedSuggestionIndex = selectedSuggestionIndexes[index] || -1;

          const methodNames = availableMethods.map(m => m.name);
          const suggestions = constraintInput
            ? methodNames.filter(m => m.toLowerCase().startsWith(constraintInput.toLowerCase()))
            : [];

          const currentMethod = availableMethods.find(m => m.name === constraintInput);
          const needsParams = currentMethod?.params.length || 0;

          // Helper functions for this criterion's autocomplete
          const handleInputChange = (value: string) => {
            setConstraintInputs(prev => ({ ...prev, [index]: value }));
            setParamValues({});
            setShowDropdowns(prev => ({ ...prev, [index]: value.length > 0 }));
            setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
          };

          const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (!showDropdown || suggestions.length === 0) {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddConstraint(index, constraintInput);
              }
              return;
            }

                          if (e.key === "ArrowDown") {
                e.preventDefault();
                setSelectedSuggestionIndexes(prev => ({
                  ...prev,
                  [index]: prev[index] < suggestions.length - 1 ? prev[index] + 1 : 0
                }));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setSelectedSuggestionIndexes(prev => ({
                  ...prev,
                  [index]: prev[index] > 0 ? prev[index] - 1 : suggestions.length - 1
                }));
            } else if (e.key === "Enter") {
              e.preventDefault();
              if (selectedSuggestionIndex >= 0) {
                const selectedSuggestion = suggestions[selectedSuggestionIndex];
                setConstraintInputs(prev => ({ ...prev, [index]: selectedSuggestion }));
                setShowDropdowns(prev => ({ ...prev, [index]: false }));
                setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
                // Auto-add if no parameters needed
                const method = availableMethods.find(m => m.name === selectedSuggestion);
                if (method && method.params.length === 0) {
                  handleAddConstraint(index, selectedSuggestion);
                }
              } else if (constraintInput.trim()) {
                selectSuggestion(constraintInput);
              }
                          } else if (e.key === "Escape") {
                setShowDropdowns(prev => ({ ...prev, [index]: false }));
                setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
              } else if (e.key === "Tab") {
                e.preventDefault();
                if (selectedSuggestionIndex >= 0) {
                  setConstraintInputs(prev => ({ ...prev, [index]: suggestions[selectedSuggestionIndex] }));
                } else if (suggestions.length > 0) {
                  setConstraintInputs(prev => ({ ...prev, [index]: suggestions[0] }));
                }
                setShowDropdowns(prev => ({ ...prev, [index]: false }));
                setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
              }
          };

          const selectSuggestion = (suggestion: string) => {
            setConstraintInputs(prev => ({ ...prev, [index]: "" }));
            setShowDropdowns(prev => ({ ...prev, [index]: false }));
            setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));

            // Just add the constraint immediately - parameters can be filled in the chip
            handleAddConstraint(index, suggestion);
          };

          return (
            <div key={index} style={{ padding: 12, backgroundColor: "#1a1a1a", borderRadius: 4, border: "1px solid #333" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#e0e0e0" }}>{criterion.label || criterion.name}</div>
                  <div style={{ fontSize: 11, color: "#808080" }}>Type: {typeName}</div>
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
                            onChange={(e) => handleInputChange(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onFocus={() => {
                              if (constraintInput.length > 0) {
                                setShowDropdowns(prev => ({ ...prev, [index]: true }));
                              }
                            }}
                            onBlur={() => {
                              setTimeout(() => {
                                setShowDropdowns(prev => ({ ...prev, [index]: false }));
                                setSelectedSuggestionIndexes(prev => ({ ...prev, [index]: -1 }));
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
