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
  const [constraintInput, setConstraintInput] = useState<string>("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});

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
      operators: getDefaultOperatorsForType(newType(selectedType)),
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

    setConstraintInput("");
    setParamValues({});
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

          const methodNames = availableMethods.map(m => m.name);
          const suggestions = constraintInput
            ? methodNames.filter(m => m.toLowerCase().startsWith(constraintInput.toLowerCase()))
            : methodNames;

          const shadowText = suggestions.length > 0
            ? constraintInput + suggestions[0].slice(constraintInput.length)
            : "";

          const currentMethod = availableMethods.find(m => m.name === constraintInput);
          const needsParams = currentMethod?.params.length || 0;

          return (
            <div key={index} style={{ padding: 12, backgroundColor: "#1a1a1a", borderRadius: 4, border: "1px solid #333" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600, color: "#e0e0e0" }}>{criterion.label || criterion.name}</div>
                  <div style={{ fontSize: 11, color: "#808080" }}>Type: {typeName}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditingIndex(editingIndex === index ? null : index)} style={{ fontSize: 11, padding: "4px 8px" }}>{editingIndex === index ? "Hide" : "Edit"}</button>
                  <button onClick={() => handleRemoveCriterion(index)} style={{ fontSize: 11, padding: "4px 8px", color: "#ff6b6b" }}>Remove</button>
                </div>
              </div>

              {/* Constraint Panel */}
              {editingIndex === index && (
                <div style={{ marginTop: 8, padding: 8, backgroundColor: "#0f0f0f", borderRadius: 4 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#b0b0b0", marginBottom: 8 }}>Type Constraints</div>

                  <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                    <div style={{ flex: 1, position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Type method (Tab/Enter to autocomplete)"
                        value={constraintInput}
                        onChange={(e) => { setConstraintInput(e.target.value); setParamValues({}); }}
                        onKeyDown={(e) => {
                          if (e.key === "Tab") { e.preventDefault(); if (suggestions.length > 0) setConstraintInput(suggestions[0]); }
                          if (e.key === "Enter") { e.preventDefault(); handleAddConstraint(index, constraintInput); }
                        }}
                        style={{ width: "100%", padding: 6, backgroundColor: "#1a1a1a", border: "1px solid #404040", borderRadius: 4, color: "#e0e0e0" }}
                      />
                      {shadowText && <span style={{ position: "absolute", left: 6, top: 6, color: "#606060", fontFamily: "monospace", pointerEvents: "none" }}>{shadowText}</span>}
                    </div>

                    {needsParams > 0 && currentMethod?.params.map(p => (
                      <input
                        key={p.name} // TODO FIX .name
                        type="text"
                        placeholder={p.name} // TODO FOIX .name
                        value={paramValues[p.name] || ""} // TODO FIX .name
                        onChange={(e) => setParamValues(prev => ({ ...prev, [p.name]: e.target.value }))} // TODO FIX .name
                        onKeyDown={(e) => { if (e.key === "Tab" || e.key === "Enter") { e.preventDefault(); handleAddConstraint(index, constraintInput); } }}
                        style={{ flex: 1, padding: 6, backgroundColor: "#1a1a1a", border: "1px solid #404040", borderRadius: 4, color: "#e0e0e0" }}
                      />
                    ))}
                  </div>

                  {/* Render current constraints */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {!typeInstance[typeName] || Object.keys(typeInstance[typeName]).length === 0
                      ? <span style={{ fontSize: 11, color: "#606060", fontStyle: "italic" }}>No constraints defined</span>
                      : Object.entries(typeInstance[typeName]).map(([constraintName, constraintValue]) => {
                          const methodInfo = Type.getConstraints(typeName).find(m => m.name === constraintName);

                          return (
                            <div key={constraintName} style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", backgroundColor: "#2a4a5a", borderRadius: 4, color: "#e0e0e0" }}>
                              <span style={{ fontWeight: 500 }}>{constraintName}</span>

                              {/* Render parameter inputs based on constraint type */}
                              {methodInfo?.params.map(param => {
                                const currentValue = typeof constraintValue === 'object' && constraintValue !== null
                                  ? (constraintValue as Record<string, any>)[param.name] || ""
                                  : typeof constraintValue === 'string' || typeof constraintValue === 'number'
                                    ? constraintValue
                                    : "";

                                // Determine input type based on parameter type
                                const inputType = param.type === Number ? "number" :
                                                 param.type === Boolean ? "checkbox" :
                                                 param.type?.name === 'Date' ? "date" : "text";
                                const isCheckbox = param.type === Boolean;

                                return (
                                  <input
                                    key={param.name}
                                    type={inputType}
                                    placeholder={isCheckbox ? undefined : param.name}
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
                                      width: isCheckbox ? "auto" : 60,
                                      height: isCheckbox ? 16 : "auto",
                                      padding: isCheckbox ? 0 : 4,
                                      backgroundColor: "#1a1a1a",
                                      border: "1px solid #3a6a7a",
                                      borderRadius: 2,
                                      color: "#e0e0e0",
                                      cursor: isCheckbox ? "pointer" : "text"
                                    }}
                                  />
                                );
                              })}

                              <button onClick={() => {
                                const updatedConstraints = { ...typeInstance[typeName] };
                                delete updatedConstraints[constraintName];

                                const newRecord = { ...typeInstance, [typeName]: updatedConstraints };

                                const updatedCriterion = { ...criterion, type: newRecord };
                                const newCriteria = [...criteria];
                                newCriteria[index] = updatedCriterion;
                                setCriteria(newCriteria);
                                onModelChange({ ...searchModel, criteria: newCriteria });
                              }} style={{ color: "#ff6b6b", background: "transparent", border: "none", cursor: "pointer" }}>✕</button>
                            </div>
                          );
                        })
                    }
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
