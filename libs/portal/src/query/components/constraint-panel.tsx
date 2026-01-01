import React, { useState, useMemo } from "react";
import { Type, ConstraintMethodDescriptor } from "@portal/validation";
import {SearchCriterion} from "@portal/query/query-model";
import {compass} from "ionicons/icons";
import {ConstraintChip} from "@portal/query/components/constraint-chip";

// Store a constraint applied to a criterion
export interface AppliedConstraint {
  name: string;
  params: Record<string, any>;
}

interface ConstraintPanelProps {
  criterion: SearchCriterion;
  onUpdateConstraints: (constraints: Record<string, any>) => void;
}

/**
 * Constraint panel using Type metadata
 */
export function ConstraintPanel({ criterion, onUpdateConstraints }: ConstraintPanelProps) {
  const [input, setInput] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const [isOpen, setIsOpen] = useState(false);

  // get all fluent constraints from the type metadata
  const fluentConstraints: ConstraintMethodDescriptor[] = useMemo(() => {
     console.log("### fluent constraints", criterion.type);

      if (criterion.type instanceof Type) {
        return Type.getConstraints(criterion.type.baseType);
      } else {
        // Handle record-style types
        const typeName = Object.keys(criterion.type)[0];
        return Type.getConstraints(typeName);
      }
  }, [criterion.type]);

  // autocomplete suggestions
  const suggestions = useMemo(() => {
      console.log("## suggest");

    if (!input) return fluentConstraints.map(c => c.name);
    const low = input.toLowerCase();
    return fluentConstraints
      .map(c => c.name)
      .filter(n => n.toLowerCase().startsWith(low));
  }, [input, fluentConstraints]);

  const shadowText = useMemo(() => {
    if (!input || suggestions.length === 0) return "";
    const first = suggestions[0];
    return first.startsWith(input) ? first.slice(input.length) : "";
  }, [input, suggestions]);

  const currentMethod = fluentConstraints.find(c => c.name === input);

  // Add a constraint
  const handleAdd = () => {
    if (!currentMethod) return;

    const newParams: Record<string, any> = {};
    currentMethod.params.forEach(p => {
      if (paramValues[p.name] !== undefined) {
        newParams[p.name] = parseParamValue(paramValues[p.name], p.type);
      }
    });

    onUpdateConstraints({
      ...criterion.type,
      [currentMethod.name]: newParams,
    });

    setInput("");
    setParamValues({});
    setIsOpen(false);
  };

  // convert string input to correct type
  const parseParamValue = (val: string, type: any) => {
    if (type === Number) return Number(val);
    if (type === Boolean) return val === "true";
    return val;
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && (!currentMethod || currentMethod.params.length === 0)) {
      handleAdd();
    } else if (e.key === "Tab") {
      e.preventDefault();
      if (suggestions.length > 0) setInput(suggestions[0]);
    }
  };

  // existing constraints as array
  const appliedConstraints: AppliedConstraint[] = useMemo(() => {
    if (!(criterion.type instanceof Type)) {
      const typeRecord = criterion.type as Record<string, any>;
      const typeName = Object.keys(typeRecord)[0];
      const constraints = typeRecord[typeName] || {};

      return Object.entries(constraints).map(([name, params]): AppliedConstraint => ({
        name,
        params: (typeof params === 'object' && params !== null) ? (params as Record<string, any>) : { value: params },
      }));
    }
    return [];
  }, [criterion.type]);

  return (
    <div style={{ padding: 8, backgroundColor: "#0f0f0f", borderRadius: 4 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#b0b0b0", marginBottom: 8 }}>
        Type Constraints
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, position: "relative" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <input
            type="text"
            placeholder="Method name"
            value={input}
            onChange={e => { setInput(e.target.value); setIsOpen(true); setParamValues({}); }}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            style={{
              width: "100%",
              padding: 6,
              backgroundColor: "#1a1a1a",
              border: "1px solid #404040",
              borderRadius: 4,
              color: "#e0e0e0",
              fontSize: 11,
            }}
          />

          {/* Shadow text */}
          {shadowText && (
            <span
              style={{
                position: "absolute",
                left: 6,
                top: 6,
                color: "#606060",
                fontSize: 11,
                pointerEvents: "none",
                fontFamily: "monospace",
              }}
            >
              {input}<span style={{ color: "#404040" }}>{shadowText}</span>
            </span>
          )}

          {/* Suggestions */}
          {isOpen && suggestions.length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                marginTop: 2,
                backgroundColor: "#1a1a1a",
                border: "1px solid #404040",
                borderRadius: 4,
                maxHeight: 150,
                overflowY: "auto",
                zIndex: 100,
                width: "100%",
              }}
            >
              {suggestions.map(s => (
                <div
                  key={s}
                  onClick={() => { setInput(s); setIsOpen(false); setParamValues({}); }}
                  style={{
                    padding: 6,
                    cursor: "pointer",
                    backgroundColor: input === s ? "#2a4a5a" : "transparent",
                    color: "#e0e0e0",
                    fontSize: 11,
                    borderBottom: "1px solid #333",
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Parameter inputs */}
        {currentMethod?.params.map(p => (
          <input
            key={p.name}
            type="text"
            placeholder={p.name}
            value={paramValues[p.name] || ""}
            onChange={e => setParamValues(prev => ({ ...prev, [p.name]: e.target.value }))}
            style={{
              flex: 1,
              padding: 6,
              backgroundColor: "#1a1a1a",
              border: "1px solid #404040",
              borderRadius: 4,
              color: "#e0e0e0",
              fontSize: 11,
            }}
          />
        ))}

        <button
          onClick={handleAdd}
          disabled={!input.trim()}
          style={{
            padding: "6px 12px",
            backgroundColor: input.trim() ? "#2a4a5a" : "#1a1a1a",
            border: "1px solid #3a6a7a",
            borderRadius: 4,
            color: input.trim() ? "#e0e0e0" : "#606060",
            cursor: input.trim() ? "pointer" : "not-allowed",
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          + Add
        </button>
      </div>

      {/* Constraint chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, padding: 6, backgroundColor: "#1a1a1a", borderRadius: 4 }}>
        {appliedConstraints.length === 0 && (
          <span style={{ fontSize: 11, color: "#606060", fontStyle: "italic" }}>No constraints defined</span>
        )}
        {appliedConstraints.map(c => (
          <ConstraintChip
            key={c.name}
            constraint={c}
            methodInfo={fluentConstraints.find(f => f.name === c.name)!}
            onUpdate={(params) => {
              onUpdateConstraints({ ...criterion.type, [c.name]: params });
            }}
            onRemove={() => {
              if (!(criterion.type instanceof Type)) {
                const typeRecord = criterion.type as Record<string, any>;
                const typeName = Object.keys(typeRecord)[0];
                const updatedConstraints = { ...typeRecord[typeName] };
                delete updatedConstraints[c.name];
                onUpdateConstraints({ ...typeRecord, [typeName]: updatedConstraints });
              }
            }}
          />
        ))}
      </div>
    </div>
  );
}