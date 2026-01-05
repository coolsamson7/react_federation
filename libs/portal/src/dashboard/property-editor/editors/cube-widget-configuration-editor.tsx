import React, { useEffect, useState } from "react";
import { Plus, X, Filter, BarChart3, Layers } from "lucide-react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";

import { CubeService } from "@portal/cube";
import { CubeWidgetConfiguration } from "@portal/dashboard/widgets/cube-widget-data";
import {
    CubeOperator,
    FilterOperator,
    operatorsForType
} from "@portal/dashboard/property-editor/editors/cube-widget-data";
import { OperandEditor, OperandValue } from "@portal/dashboard/property-editor/editors/cube-operand-editor";
import { CubeDescriptor, DimensionType } from "@portal/cube/cube-metadata";

/* ------------------------------------------------------------------ */
/* Helper: Get all available dimensions including joined cubes        */
/* ------------------------------------------------------------------ */
interface AvailableDimension {
  fullPath: string;         // "orders.status" or "customers.name"
  displayName: string;      // "Status" or "Customer Name"
  cubeName: string;         // "orders" or "customers"
  dimensionName: string;    // "status" or "name"
  type: DimensionType;
  isMainCube: boolean;
}

function getAvailableDimensions(
  cube: CubeDescriptor,
  allCubes: CubeDescriptor[]
): AvailableDimension[] {
  const dimensions: AvailableDimension[] = [];

  // 1. Add main cube dimensions
  cube.dimensions?.forEach(dim => {
    dimensions.push({
      fullPath: `${cube.name}.${dim.name}`,
      displayName: dim.title || dim.name,
      cubeName: cube.name,
      dimensionName: dim.name,
      type: dim.type,
      isMainCube: true
    });
  });

  // 2. Add joined cube dimensions
  cube.joins?.forEach(join => {
    const joinedCube = allCubes.find(c => c.name === join.name);
    if (joinedCube) {
      joinedCube.dimensions?.forEach(dim => {
        dimensions.push({
          fullPath: `${join.name}.${dim.name}`,
          displayName: `${dim.title || dim.name} (${joinedCube.title || join.name})`,
          cubeName: join.name,
          dimensionName: dim.name,
          type: dim.type,
          isMainCube: false
        });
      });
    }
  });

  return dimensions;
}

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
  const [cubes, setCubes] = useState<CubeDescriptor[]>([]);

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
    // Add cube prefix: "orders.count" instead of just "count"
    const fullMeasurePath = `${currentCube.name}.${measure}`;
    const newMeasures = config.measures.includes(fullMeasurePath)
      ? config.measures.filter((m) => m !== fullMeasurePath)
      : [...config.measures, fullMeasurePath];
    updateConfig({ ...config, measures: newMeasures });
  };

  const toggleDimension = (dimension: string) => {
    // Add cube prefix: "orders.status" instead of just "status"
    const fullDimensionPath = `${currentCube.name}.${dimension}`;
    const newDimensions = config.dimensions.includes(fullDimensionPath)
      ? config.dimensions.filter((d) => d !== fullDimensionPath)
      : [...config.dimensions, fullDimensionPath];
    updateConfig({ ...config, dimensions: newDimensions });
  };

  const removeFilter = (idx: number) => {
    const next = [...config.filters];
    next.splice(idx, 1);
    updateConfig({ ...config, filters: next });
  };

  // Get all available dimensions (main + joined)
  const availableDimensions = currentCube ? getAvailableDimensions(currentCube, cubes) : [];

  // Group dimensions by cube for better UX
  const groupedDimensions = availableDimensions.reduce((acc, dim) => {
    if (!acc[dim.cubeName]) {
      acc[dim.cubeName] = [];
    }
    acc[dim.cubeName].push(dim);
    return acc;
  }, {} as Record<string, AvailableDimension[]>);

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
          {currentCube.measures?.map((m: any) => {
            const fullMeasurePath = `${currentCube.name}.${m.name}`;
            return (
              <label
                key={m.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  backgroundColor: config.measures.includes(fullMeasurePath) ? "#2a3942" : "transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  border: config.measures.includes(fullMeasurePath) ? "1px solid #00a884" : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!config.measures.includes(fullMeasurePath)) {
                    e.currentTarget.style.backgroundColor = "#2a3942";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!config.measures.includes(fullMeasurePath)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={config.measures.includes(fullMeasurePath)}
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
            );
          })}
        </div>
      </div>

      {/* Dimensions */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <Layers size={14} color="#00a884" />
          Dimensions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {currentCube.dimensions?.map((d: any) => {
            const fullDimensionPath = `${currentCube.name}.${d.name}`;
            return (
              <label
                key={d.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "8px 12px",
                  backgroundColor: config.dimensions.includes(fullDimensionPath) ? "#2a3942" : "transparent",
                  borderRadius: "6px",
                  cursor: "pointer",
                  transition: "background-color 0.2s",
                  border: config.dimensions.includes(fullDimensionPath) ? "1px solid #00a884" : "1px solid transparent",
                }}
                onMouseEnter={(e) => {
                  if (!config.dimensions.includes(fullDimensionPath)) {
                    e.currentTarget.style.backgroundColor = "#2a3942";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!config.dimensions.includes(fullDimensionPath)) {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }
                }}
              >
                <input
                  type="checkbox"
                  checked={config.dimensions.includes(fullDimensionPath)}
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
            );
          })}
        </div>
      </div>

      {/* Filters - Enhanced with joined cube support */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>
          <Filter size={14} color="#00a884" />
          Filters ({config.filters.length})
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {config.filters.map((filter, idx) => {
            // Find the dimension info (could be from main or joined cube)
            const dimensionInfo = availableDimensions.find(d => d.fullPath === filter.dimension);
            const dimType = dimensionInfo?.type || "string";
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
                  <option value="">-- Select Dimension --</option>
                  {Object.entries(groupedDimensions).map(([cubeName, dims]) => (
                    <optgroup
                      key={cubeName}
                      label={cubeName === currentCube.name ? `${cubeName} (main)` : `${cubeName} (joined)`}
                    >
                      {dims.map(dim => (
                        <option key={dim.fullPath} value={dim.fullPath}>
                          {dim.displayName}
                        </option>
                      ))}
                    </optgroup>
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

      {/* Chart Type */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Chart Type</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["linechart", "barchart", "table"].map(type => (
            <label key={type} style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "13px",
              color: "#e9edef",
              cursor: "pointer",
              padding: "6px 12px",
              backgroundColor: config.renderingComponent === type ? "#2a3942" : "transparent",
              borderRadius: "6px",
              border: config.renderingComponent === type ? "1px solid #00a884" : "1px solid transparent",
            }}>
              <input
                type="radio"
                name="chart-type"
                checked={config.renderingComponent === type as any}
                onChange={() => {
                  const newConfig = { ...config, renderingComponent: type as any };
                  setConfig(newConfig);
                  onChange(newConfig);
                }}
                style={{ accentColor: "#00a884" }}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Axes Configuration (only for chart types) */}
      {(config.renderingComponent === "linechart" || config.renderingComponent === "barchart") && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Axes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: "12px", color: "#8696a0", display: "block", marginBottom: "6px" }}>
                X-Axis (Dimension)
              </label>
              <select
                value={config.xAxisField}
                onChange={(e) => {
                  const newConfig = { ...config, xAxisField: e.target.value };
                  setConfig(newConfig);
                  onChange(newConfig);
                }}
                disabled={config.dimensions.length === 0}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: config.dimensions.length === 0 ? "#1a1f24" : "#2a3942",
                  color: "#e9edef",
                  border: "1px solid #3b4a54",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">-- None --</option>
                {config.dimensions.map(d => {
                  // Extract dimension name from full path (e.g., "orders.status" -> "status")
                  const dimensionName = d.split('.').pop() || d;
                  const dimension = currentCube.dimensions?.find((dim: { name: string; }) => dim.name === dimensionName);
                  return (
                    <option key={d} value={d}>
                      {dimension?.title || dimensionName}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "12px", color: "#8696a0", display: "block", marginBottom: "6px" }}>
                Y-Axis (Measure)
              </label>
              <select
                value={config.yAxisField}
                onChange={(e) => {
                  const newConfig = { ...config, yAxisField: e.target.value };
                  setConfig(newConfig);
                  onChange(newConfig);
                }}
                disabled={config.measures.length === 0}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  backgroundColor: config.measures.length === 0 ? "#1a1f24" : "#2a3942",
                  color: "#e9edef",
                  border: "1px solid #3b4a54",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  cursor: "pointer",
                }}
              >
                <option value="">-- None --</option>
                {config.measures.map(m => {
                  // Extract measure name from full path (e.g., "orders.count" -> "count")
                  const measureName = m.split('.').pop() || m;
                  const measure = currentCube.measures?.find((meas: { name: string; }) => meas.name === measureName);
                  return (
                    <option key={m} value={m}>
                      {measure?.title || measureName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Columns Configuration (only for table) */}
      {config.renderingComponent === "table" && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Columns</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {config.measures.length === 0 && config.dimensions.length === 0 ? (
              <div style={{ fontSize: "12px", color: "#8696a0" }}>
                Select measures or dimensions to display as columns
              </div>
            ) : (
              <>
                {config.dimensions.map(d => {
                  const dimensionName = d.split('.').pop() || d;
                  const dimension = currentCube.dimensions?.find((dim: { name: string; }) => dim.name === dimensionName);
                  return (
                    <label key={d} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#e9edef",
                      padding: "6px 8px",
                      backgroundColor: "#2a3942",
                      borderRadius: "6px",
                    }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "#00a884" }} />
                      {dimension?.title || dimensionName}
                    </label>
                  );
                })}
                {config.measures.map(m => {
                  const measureName = m.split('.').pop() || m;
                  const measure = currentCube.measures?.find((meas: { name: string; }) => meas.name === measureName);
                  return (
                    <label key={m} style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "13px",
                      color: "#e9edef",
                      padding: "6px 8px",
                      backgroundColor: "#2a3942",
                      borderRadius: "6px",
                    }}>
                      <input type="checkbox" defaultChecked style={{ accentColor: "#00a884" }} />
                      {measure?.title || measureName}
                    </label>
                  );
                })}
              </>
            )}
          </div>
        </div>
      )}
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