import React, { useEffect, useState } from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";
import { CubeWidgetConfiguration } from "../../examples/cube-widget-data";

import { OperandEditor, OperandValue } from "@portal/widgets/property-editor/editors/cube-operand-editor";
import { CubeOperator, FilterOperator, operatorsForType } from "@portal/query/cube-widget-data";
import {CubeService} from "@portal/metadata";

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

  const currentCube =
    cubes.find((c) => c.name === config.cubeName) || cubes[0];

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

  const sectionStyle = {
    backgroundColor: "#1e1e1e",
    border: "1px solid #3a3a3a",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: "12px",
  };

  const sectionTitleStyle = {
    fontSize: "11px",
    fontWeight: "600",
    color: "#b0b0b0",
    marginBottom: "8px",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  };

  if (!currentCube) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Cube selection */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Cube</div>
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
        <div style={sectionTitleStyle}>Measures</div>
        {currentCube.measures.map((m: any) => (
          <label key={m.name}>
            <input
              type="checkbox"
              checked={config.measures.includes(m.name)}
              onChange={() => toggleMeasure(m.name)}
            />
            {m.title}
          </label>
        ))}
      </div>

      {/* Dimensions */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Dimensions</div>
        {currentCube.dimensions.map((d: any) => (
          <label key={d.name}>
            <input
              type="checkbox"
              checked={config.dimensions.includes(d.name)}
              onChange={() => toggleDimension(d.name)}
            />
            {d.title}
          </label>
        ))}
      </div>

      {/* Filters */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Filters</div>
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
            <div key={idx}>
              <select
                value={filter.dimension}
                onChange={(e) => {
                  const next = [...config.filters];
                  next[idx] = { ...filter, dimension: e.target.value };
                  updateConfig({ ...config, filters: next });
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
              >
                {operators.map((op) => (
                  <option key={op.name} value={op.name}>
                    {op.name}
                  </option>
                ))}
              </select>

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
          );
        })}

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
        >
          + Add Filter
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
