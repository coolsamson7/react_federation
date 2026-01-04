import React, { useEffect, useState } from "react";
import { Plus, X, Filter, BarChart3, Layers } from "lucide-react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";
import { CubeWidgetConfiguration } from "../../examples/cube-widget-data";
import { OperandEditor, OperandValue } from "@portal/widgets/property-editor/editors/cube-operand-editor";
import { CubeOperator, FilterOperator, operatorsForType } from "@portal/query/cube-widget-data";
import { CubeService } from "@portal/metadata";

/* ------------------------------------------------------------------ */
/* Cube configuration form component                                   */
/* ------------------------------------------------------------------ */
function CubeConfigurationForm({
  value,
  onChange,
}: {
  value?: CubeWidgetConfiguration;
  onChange: (value: CubeWidgetConfiguration) => void;
}) {
  const defaultConfig: CubeWidgetConfiguration = value || {
    cubeName: "",
    measures: [],
    dimensions: [],
    filters: [],
    renderingComponent: "linechart",
    xAxisField: "",
    yAxisField: "",
  };

  const [config, setConfig] = useState<CubeWidgetConfiguration>(defaultConfig);
  const [cubes, setCubes] = useState<any[]>([]);

  /* ---------------- Load cubes from service ---------------- */
  useEffect(() => {
    const service = new CubeService();
    service.listCubes().then((loadedCubes) => {
      setCubes(loadedCubes);

      if (!config.cubeName && loadedCubes.length > 0) {
        const next = { ...config, cubeName: loadedCubes[0].name };
        setConfig(next);
        onChange(next);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentCube = cubes.find((c) => c.name === config.cubeName) || cubes[0];

  const updateConfig = (next: CubeWidgetConfiguration) => {
    setConfig(next);
    onChange(next);
  };

  const toggleMeasure = (measure: string) => {
    const newMeasures = config.measures.includes(measure)
      ? config.measures.filter((m) => m !== measure)
      : [...config.measures, measure];
    updateConfig({ ...config, measures: newMeasures });
  };

  const toggleDimension = (dimension: string) => {
    const newDimensions = config.dimensions.includes(dimension)
      ? config.dimensions.filter((d) => d !== dimension)
      : [...config.dimensions, dimension];
    updateConfig({ ...config, dimensions: newDimensions });
  };

  const removeFilter = (idx: number) => {
    const next = [...config.filters];
    next.splice(idx, 1);
    updateConfig({ ...config, filters: next });
  };

  const sectionStyle = {
    backgroundColor: "#1f2c33",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #2a2f32",
    marginBottom: "16px",
  };

  const sectionTitleStyle = {
    fontSize: "12px",
    fontWeight: "600" as const,
    color: "#8696a0",
    marginBottom: "12px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  if (!currentCube) return null;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Cube selection */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <Layers size={14} color="#00a884" />
          Cube
        </div>
        <select
          value={config.cubeName}
          onChange={(e) =>
            updateConfig({
              ...config,
              cubeName: e.target.value,
              measures: [],
              dimensions: [],
              xAxisField: "",
              yAxisField: "",
              filters: [],
            })
          }
          style={{
            width: "100%",
            padding: "10px 12px",
            backgroundColor: "#2a3942",
            border: "1px solid #3b4a54",
            borderRadius: "6px",
            color: "#e9edef",
            fontSize: "14px",
            outline: "none",
            cursor: "pointer",
          }}
        >
          {cubes.map((c) => (
            <option key={c.name} value={c.name}>
              {c.title}
            </option>
          ))}
        </select>
      </div>

      {/* Measures */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <BarChart3 size={14} color="#00a884" />
          Measures
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {currentCube.measures.map((m: any) => (
            <label
              key={m.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                backgroundColor: config.measures.includes(m.name) ? "#2a3942" : "transparent",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s",
                border: config.measures.includes(m.name) ? "1px solid #00a884" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!config.measures.includes(m.name)) {
                  e.currentTarget.style.backgroundColor = "#2a3942";
                }
              }}
              onMouseLeave={(e) => {
                if (!config.measures.includes(m.name)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <input
                type="checkbox"
                checked={config.measures.includes(m.name)}
                onChange={() => toggleMeasure(m.name)}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  accentColor: "#00a884",
                }}
              />
              <span style={{
                color: "#e9edef",
                fontSize: "14px",
                flex: 1,
              }}>
                {m.title}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Dimensions */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <Layers size={14} color="#00a884" />
          Dimensions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {currentCube.dimensions.map((d: any) => (
            <label
              key={d.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                backgroundColor: config.dimensions.includes(d.name) ? "#2a3942" : "transparent",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "background-color 0.2s",
                border: config.dimensions.includes(d.name) ? "1px solid #00a884" : "1px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!config.dimensions.includes(d.name)) {
                  e.currentTarget.style.backgroundColor = "#2a3942";
                }
              }}
              onMouseLeave={(e) => {
                if (!config.dimensions.includes(d.name)) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <input
                type="checkbox"
                checked={config.dimensions.includes(d.name)}
                onChange={() => toggleDimension(d.name)}
                style={{
                  width: "16px",
                  height: "16px",
                  cursor: "pointer",
                  accentColor: "#00a884",
                }}
              />
              <span style={{
                color: "#e9edef",
                fontSize: "14px",
                flex: 1,
              }}>
                {d.title}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <Filter size={14} color="#00a884" />
          Filters ({config.filters.length})
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {config.filters.map((filter, idx) => {
            const dimension = currentCube.dimensions.find(
              (d: any) => d.name === filter.dimension
            );
            const dimType = dimension?.type || "string";
            const operators: CubeOperator[] = operatorsForType(dimType) || [];
            const operatorMeta = operators.find(
              (op) => op.name === filter.operator
            );

            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "8px",
                  alignItems: "center",
                  padding: "12px",
                  backgroundColor: "#2a3942",
                  borderRadius: "6px",
                  border: "1px solid #3b4a54",
                }}
              >
                <select
                  value={filter.dimension}
                  onChange={(e) => {
                    const next = [...config.filters];
                    next[idx] = { ...filter, dimension: e.target.value };
                    updateConfig({ ...config, filters: next });
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#1f2c33",
                    border: "1px solid #3b4a54",
                    borderRadius: "6px",
                    color: "#e9edef",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  <option value="">-- Dimension --</option>
                  {config.dimensions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>

                <select
                  value={filter.operator}
                  onChange={(e) => {
                    const next = [...config.filters];
                    next[idx] = {
                      ...filter,
                      operator: e.target.value as FilterOperator,
                    };
                    updateConfig({ ...config, filters: next });
                  }}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    backgroundColor: "#1f2c33",
                    border: "1px solid #3b4a54",
                    borderRadius: "6px",
                    color: "#e9edef",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                  }}
                >
                  {operators.map((op) => (
                    <option key={op.name} value={op.name}>
                      {op.name}
                    </option>
                  ))}
                </select>

                <div style={{ flex: 1 }}>
                  <OperandEditor
                    operator={operatorMeta!}
                    value={filter.values || null}
                    onChange={(vals: OperandValue[]) => {
                      const next = [...config.filters];
                      next[idx] = { ...filter, values: vals };
                      updateConfig({ ...config, filters: next });
                    }}
                  />
                </div>

                <button
                  onClick={() => removeFilter(idx)}
                  style={{
                    padding: "8px",
                    backgroundColor: "#3b4a54",
                    border: "none",
                    borderRadius: "6px",
                    color: "#ea4335",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "32px",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#ea4335";
                    e.currentTarget.style.color = "#fff";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#3b4a54";
                    e.currentTarget.style.color = "#ea4335";
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>

        <button
          onClick={() =>
            updateConfig({
              ...config,
              filters: [
                ...config.filters,
                { dimension: "", operator: "equals", values: [] },
              ],
            })
          }
          style={{
            width: "100%",
            marginTop: "12px",
            padding: "10px",
            backgroundColor: "#00a884",
            border: "none",
            borderRadius: "6px",
            color: "#fff",
            fontSize: "13px",
            fontWeight: "500",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#00966d";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#00a884";
          }}
        >
          <Plus size={16} />
          Add Filter
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Property editor wrapper                                             */
/* ------------------------------------------------------------------ */
@RegisterPropertyEditor("cubeWidgetConfiguration")
export class CubeWidgetConfigurationEditor extends PropertyEditor<CubeWidgetConfiguration> {
  render() {
    const { value, onChange, label, propertyName } = this.props;

    return (
      <div>
        <label>{label || propertyName}</label>
        <CubeConfigurationForm value={value} onChange={onChange} />
      </div>
    );
  }
}