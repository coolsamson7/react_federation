import React, { useState } from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";
import { CubeWidgetConfiguration, ValueType } from "../../examples/cube-widget-data";
import {
  FilterOperator,
  operatorsForType,
  CubeOperator,
} from "../../../query/cube-widget-data";
import { OperandEditor, OperandValue } from "@portal/widgets/property-editor/editors/cube-operand-editor";

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

  const sectionStyle: React.CSSProperties = {
    backgroundColor: "#1e1e1e",
    border: "1px solid #3a3a3a",
    borderRadius: "4px",
    padding: "10px",
    marginBottom: "12px",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "11px",
    fontWeight: 600,
    color: "#b0b0b0",
    marginBottom: "8px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  // @ts-ignore
    // @ts-ignore
    return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
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
          style={{
            width: "100%",
            padding: "6px 8px",
            backgroundColor: "#1a1a1a",
            color: "#e0e0e0",
            border: "1px solid #404040",
            borderRadius: 2,
            fontSize: 12,
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
          <label key={m.name} style={{ display: "flex", gap: 6, alignItems: "center", color: "#e0e0e0", fontSize: 12 }}>
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
          <label key={d.name} style={{ display: "flex", gap: 6, alignItems: "center", color: "#e0e0e0", fontSize: 12 }}>
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
          const dimType: "string" | "number" | "time" | "boolean" = dimension?.type || "string";
          // @ts-ignore
            const operators: CubeOperator[] = operatorsForType(dimType) || [];
          const operatorMeta: CubeOperator | null = operators.find(op => op.name === filter.operator) || operators[0];
            if (!operatorMeta) {
              console.warn("No operator found for filter", filter);
            }

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

              {operatorMeta && (
              <OperandEditor
                operator={operatorMeta}
                value={filter.values || null}
                onChange={(vals) => {
                  const newFilters = [...config.filters];
                  newFilters[idx] = { ...filter, values: vals ?? [] };
                  updateConfig({ ...config, filters: newFilters });
                }}
              />)}
            </div>
          );
        })}

        <button
          onClick={() =>
            updateConfig({
              ...config,
              filters: [...config.filters, { dimension: "", operator: "equals", values: [] }],
            })
          }
          disabled={config.dimensions.length === 0}
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
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#e0e0e0", marginBottom: 8 }}>
          {label || propertyName}
        </label>
        <CubeConfigurationForm value={value} onChange={onChange} />
      </div>
    );
  }
}
