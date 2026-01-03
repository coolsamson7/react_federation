import React, { useState } from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";
import { CubeWidgetConfiguration } from "../../examples/cube-widget-data";

import { OperandEditor, OperandValue } from "@portal/widgets/property-editor/editors/cube-operand-editor";
import {CubeOperator, FilterOperator, operatorsForType} from "@portal/query/cube-widget-data";

/* ------------------------------------------------------------------ */
/* Local cube database with dimension types for filtering             */
/* ------------------------------------------------------------------ */
const LOCAL_CUBES = [
  {
    name: "Orders",
    displayName: "Orders",
    measures: [
      { name: "Orders.count", displayName: "Count" },
      { name: "Orders.totalAmount", displayName: "Total Amount" },
      { name: "Orders.averageAmount", displayName: "Average Amount" },
    ],
    dimensions: [
      { name: "Orders.orderId", displayName: "Order ID", type: "number" as const },
      { name: "Orders.status", displayName: "Status", type: "string" as const },
      { name: "Orders.orderDate", displayName: "Created At", type: "time" as const },
      { name: "Orders.amount", displayName: "Amount", type: "number" as const },
      { name: "Orders.isPaid", displayName: "Is Paid", type: "boolean" as const },
    ],
  },
  {
    name: "Customers",
    displayName: "Customers",
    measures: [
      { name: "Customers.count", displayName: "Count" },
      { name: "Customers.totalSpent", displayName: "Total Spent" },
    ],
    dimensions: [
      { name: "Customers.id", displayName: "Customer ID", type: "number" as const },
      { name: "Customers.name", displayName: "Name", type: "string" as const },
      { name: "Customers.country", displayName: "Country", type: "string" as const },
      { name: "Customers.createdAt", displayName: "Created At", type: "time" as const },
    ],
  },
  {
    name: "Products",
    displayName: "Products",
    measures: [
      { name: "Products.count", displayName: "Count" },
      { name: "Products.averagePrice", displayName: "Average Price" },
    ],
    dimensions: [
      { name: "Products.id", displayName: "Product ID", type: "number" as const },
      { name: "Products.name", displayName: "Name", type: "string" as const },
      { name: "Products.category", displayName: "Category", type: "string" as const },
      { name: "Products.price", displayName: "Price", type: "number" as const },
    ],
  },
];

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
    cubeName: "Orders",
    measures: [],
    dimensions: [],
    filters: [],
    renderingComponent: "linechart",
    xAxisField: "",
    yAxisField: "",
  };

  const [config, setConfig] = useState<CubeWidgetConfiguration>(defaultConfig);
  const currentCube = LOCAL_CUBES.find(c => c.name === config.cubeName) || LOCAL_CUBES[0];

  const updateConfig = (next: CubeWidgetConfiguration) => {
    setConfig(next);
    onChange(next);
  };

  const toggleMeasure = (measure: string) => {
    const newMeasures = config.measures.includes(measure)
      ? config.measures.filter(m => m !== measure)
      : [...config.measures, measure];
    updateConfig({ ...config, measures: newMeasures });
  };

  const toggleDimension = (dimension: string) => {
    const newDimensions = config.dimensions.includes(dimension)
      ? config.dimensions.filter(d => d !== dimension)
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
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      {/* Cube selection */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Cube</div>
        <select
          value={config.cubeName}
          onChange={(e) => {
            const cubeName = e.target.value;
            updateConfig({
              ...config,
              cubeName,
              measures: [],
              dimensions: [],
              xAxisField: "",
              yAxisField: "",
              filters: [],
            });
          }}
          style={{
            width: "100%",
            padding: "6px 8px",
            backgroundColor: "#1a1a1a",
            color: "#e0e0e0",
            border: "1px solid #404040",
            borderRadius: "2px",
            fontSize: "12px",
          }}
        >
          {LOCAL_CUBES.map(c => (
            <option key={c.name} value={c.name}>
              {c.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Measures */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Measures</div>
        {currentCube.measures.map(m => (
          <label key={m.name} style={{ display: "flex", gap: 6, alignItems: "center", color: "#e0e0e0", fontSize: "12px" }}>
            <input
              type="checkbox"
              checked={config.measures.includes(m.name)}
              onChange={() => toggleMeasure(m.name)}
            />
            {m.displayName}
          </label>
        ))}
      </div>

      {/* Dimensions */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Dimensions</div>
        {currentCube.dimensions.map(d => (
          <label key={d.name} style={{ display: "flex", gap: 6, alignItems: "center", color: "#e0e0e0", fontSize: "12px" }}>
            <input
              type="checkbox"
              checked={config.dimensions.includes(d.name)}
              onChange={() => toggleDimension(d.name)}
            />
            {d.displayName}
          </label>
        ))}
      </div>

      {/* Filters */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Filters</div>
        {config.filters.map((filter, idx) => {
          const dimension = currentCube.dimensions.find(d => d.name === filter.dimension);
          const dimType = (dimension?.type || "string");
          const operators: CubeOperator[] = operatorsForType(dimType) || [];
          const operatorMeta = operators.find(op => op.name === filter.operator);

          // @ts-ignore
            // @ts-ignore
            return (
            <div key={idx} style={{ display: "flex", flexDirection: "column", gap: 4, backgroundColor: "#0f1419", padding: 6 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 4 }}>
                <select
                  value={filter.dimension}
                  onChange={(e) => {
                    const newFilters = [...config.filters];
                    newFilters[idx] = { ...filter, dimension: e.target.value };
                    updateConfig({ ...config, filters: newFilters });
                  }}
                >
                  <option value="">-- Dimension --</option>
                  {config.dimensions.map(d => (
                    <option key={d} value={d}>
                      {currentCube.dimensions.find(dim => dim.name === d)?.displayName || d}
                    </option>
                  ))}
                </select>

                <select
                  value={filter.operator || "equals"}
                  onChange={(e) => {
                    const newFilters = [...config.filters];
                    newFilters[idx] = { ...filter, operator: e.target.value as FilterOperator };
                    updateConfig({ ...config, filters: newFilters });
                  }}
                >
                  {operators.map(op => (
                    <option key={op.name} value={op.name}>
                      {op.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    const newFilters = config.filters.filter((_, i) => i !== idx);
                    updateConfig({ ...config, filters: newFilters });
                  }}
                >
                  ✕
                </button>
              </div>

              {/* OperandEditor */}
              <OperandEditor
                operator={operatorMeta!}
                value={filter.values || null}
                onChange={(vals: OperandValue[]) => {
                  const newFilters = [...config.filters];
                  newFilters[idx] = { ...filter, values: vals };
                  updateConfig({ ...config, filters: newFilters });
                }}
              />
            </div>
          );
        })}

        <button
          onClick={() =>
            updateConfig({ ...config, filters: [...config.filters, { dimension: "", operator: "equals", values: [] }] })
          }
          disabled={config.dimensions.length === 0}
        >
          + Add Filter
        </button>
      </div>

        {/* Section 5: Chart Type */}
      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>Chart Type</div>
        <div style={{ display: "flex", gap: "8px" }}>
          {["linechart", "barchart", "table"].map(type => (
            <label key={type} style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "12px", color: "#e0e0e0", cursor: "pointer" }}>
              <input
                type="radio"
                name="chart-type"
                checked={config.renderingComponent === type as any}
                onChange={() => {
                  const newConfig = { ...config, renderingComponent: type as any };
                  setConfig(newConfig);
                  onChange(newConfig);
                }}
              />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          ))}
        </div>
      </div>

      {/* Section 6: Axes Configuration (only for chart types) */}
      {(config.renderingComponent === "linechart" || config.renderingComponent === "barchart") && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Axes</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <label style={{ fontSize: "10px", color: "#b0b0b0", display: "block", marginBottom: "4px" }}>
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
                  padding: "6px 8px",
                  backgroundColor: config.dimensions.length === 0 ? "#2a2a2a" : "#1a1a1a",
                  color: "#e0e0e0",
                  border: "1px solid #404040",
                  borderRadius: "2px",
                  fontSize: "12px",
                }}
              >
                <option value="">-- None --</option>
                {config.dimensions.map(d => (
                  <option key={d} value={d}>
                    {currentCube.dimensions.find(dim => dim.name === d)?.displayName || d}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ fontSize: "10px", color: "#b0b0b0", display: "block", marginBottom: "4px" }}>
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
                  padding: "6px 8px",
                  backgroundColor: config.measures.length === 0 ? "#2a2a2a" : "#1a1a1a",
                  color: "#e0e0e0",
                  border: "1px solid #404040",
                  borderRadius: "2px",
                  fontSize: "12px",
                }}
              >
                <option value="">-- None --</option>
                {config.measures.map(m => (
                  <option key={m} value={m}>
                    {currentCube.measures.find(meas => meas.name === m)?.displayName || m}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Section 6b: Columns Configuration (only for table) */}
      {config.renderingComponent === "table" && (
        <div style={sectionStyle}>
          <div style={sectionTitleStyle}>Columns</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {config.measures.length === 0 && config.dimensions.length === 0 ? (
              <div style={{ fontSize: "11px", color: "#808080" }}>
                Select measures or dimensions to display as columns
              </div>
            ) : (
              <>
                {config.dimensions.map(d => (
                  <label key={d} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#e0e0e0" }}>
                    <input type="checkbox" defaultChecked />
                    {currentCube.dimensions.find(dim => dim.name === d)?.displayName || d}
                  </label>
                ))}
                {config.measures.map(m => (
                  <label key={m} style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#e0e0e0" }}>
                    <input type="checkbox" defaultChecked />
                    {currentCube.measures.find(meas => meas.name === m)?.displayName || m}
                  </label>
                ))}
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
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#e0e0e0", marginBottom: 8 }}>
          {label || propertyName}
        </label>
        <CubeConfigurationForm value={value} onChange={onChange} />
      </div>
    );
  }
}
