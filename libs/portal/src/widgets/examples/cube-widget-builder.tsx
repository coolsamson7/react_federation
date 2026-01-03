import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import {CubeWidgetData, FilterConfig} from "./cube-widget-data";
import { SelectionOverlay } from "../editor/SelectionOverlay";

import cubejs from '@cubejs-client/core';

const API_URL = "http://localhost:4000/cubejs-api/v1";

export const cubejsApi = cubejs(
  "SECRET_KEY",  // <-- must match CUBEJS_API_SECRET
  { apiUrl: API_URL }
);

import { QueryRenderer } from "@cubejs-client/react";
import { 
  LineChart, Line, 
  BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { messageBus } from "../editor/message-bus";
import {SearchPanelContext, SearchPanelContextValue} from "@portal/widgets/search-panel/search-panel-context";
import {
    LiteralQueryExpression,
    LogicalQueryExpression,
    NotQueryExpression,
    QueryExpression
} from "@portal/query/query-model";

/**
 * Recursively searches a QueryExpression tree for the first LiteralQueryExpression
 * matching the given criterion name.
 *
 * @param expr - The root of the QueryExpression tree
 * @param criterionName - The name of the criterion to find
 * @returns The first matching LiteralQueryExpression, or undefined if not found
 */
export function findFirstLiteralByCriterion(
  expr: QueryExpression,
  criterionName: string
): LiteralQueryExpression | undefined {
  switch (expr.type) {
    case "literal": {
      const lit = expr as LiteralQueryExpression;
      const name = typeof lit.criterion === "string" ? lit.criterion : lit.criterion.name;
      return name === criterionName ? lit : undefined;
    }

    case "and":
    case "or": {
      const logical = expr as LogicalQueryExpression;
      for (const child of logical.values) {
        const found = findFirstLiteralByCriterion(child, criterionName);
        if (found) return found;
      }
      return undefined;
    }

    case "not": {
      const notExpr = expr as NotQueryExpression;
      return findFirstLiteralByCriterion(notExpr.value, criterionName);
    }
  }
}


/**
 * Runtime builder for CubeWidget
 * Renders the chart based on configuration property
 */
@RegisterBuilder("cube", false)
export class CubeWidgetBuilder extends WidgetBuilder<CubeWidgetData> {
  static contextType = SearchPanelContext;
  context!: SearchPanelContextValue; // tell Typ

  render() {
    const { data } = this.props;

    const { searchModel, predefinedQuery, onConfigChange } = this.context;

    console.log("### CUBE ")

    console.log(predefinedQuery)

    if (!data.configuration) {
      return (
        <div style={{
          backgroundColor: data.backgroundColor || "#1e2a35",
          borderRadius: `${data.borderRadius || 8}px`,
          padding: "16px",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "120px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        }}>
          <div style={{ textAlign: "center", color: "#9ca3af" }}>
            Configure chart in properties panel
          </div>
        </div>
      );
    }

    const config = data.configuration;

    const createFilters = (filters: FilterConfig[]) => {
       let createFilter = (filter: FilterConfig) : any =>  {
           return {
              member: filter.dimension,
              operator: filter.operator,
              values: filter.values
            };
        };

         let createCriterionFilter = (filter: FilterConfig) : any =>  {
           let expression = findFirstLiteralByCriterion(predefinedQuery!, filter.values[0])
           return {
              member: filter.dimension,
              operator: expression?.operator,
              values: expression?.values
            };
        }

       return filters
        .filter((f) => f.dimension && f.operator && f.values.length > 0)
        .map((f) => f.operator == "usesCriterion" ? createCriterionFilter(f) : createFilter(f))
      };


    // Build the query
    const query = {
      measures: config.measures || [],
      dimensions: config.dimensions || [],
      filters: createFilters(config.filters),
      limit: 20,
    };

    return (
      <div
        style={{
          backgroundColor: data.backgroundColor || "#1e2a35",
          borderRadius: `${data.borderRadius || 8}px`,
          padding: "16px",
          color: "#fff",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          minHeight: "120px",
          height: "100%",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
        }}
      >
        {/* Header with icon and title */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>{data.icon || "⏱"}</span>
          <span style={{
            fontSize: "11px",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            color: "#9ca3af",
            fontWeight: 500,
          }}>
            {data.title || "METRIC TITLE"}
          </span>
        </div>

        {/* Content - QueryRenderer with selected chart */}
        <div style={{ flex: 1 }}>
          <QueryRenderer
            query={query}
            cubeApi={cubejsApi}
            render={({ resultSet, error, loadingState }) => {
              if (loadingState.isLoading) {
                return (
                  <div style={{ display: "flex", alignItems: "center", fontSize: "48px", fontWeight: 600 }}>
                    {data.value || "865"}
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#9ca3af", marginLeft: "8px" }}>
                      {data.unit || "MS"}
                    </span>
                  </div>
                );
              }

              if (error) {
                return (
                  <div style={{ display: "flex", alignItems: "center", fontSize: "12px", color: "#ff6b6b" }}>
                    Error loading data
                  </div>
                );
              }

              if (!resultSet) return null;

              const pivot = resultSet.tablePivot();
              const xAxisKey = config.xAxisField || "";
              const yAxisKey = config.yAxisField || "";

              // Transform data for chart
              const chartData = pivot.map((row: any) => ({
                name: String(row[xAxisKey] || "Unknown"),
                value: Number(row[yAxisKey]) || 0,
              }));

              // Render based on component type
              if (config.renderingComponent === "linechart") {
                return (
                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#8884d8" 
                          name="Value"
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                );
              } else if (config.renderingComponent === "barchart") {
                return (
                  <div style={{ width: "100%", height: 280 }}>
                    <ResponsiveContainer>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar 
                          dataKey="value" 
                          fill="#8884d8" 
                          name="Value"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                );
              } else if (config.renderingComponent === "table") {
                // Render as table
                const allColumns = [...(config.dimensions || []), ...(config.measures || [])];
                return (
                  <div style={{ width: "100%", overflowX: "auto" }}>
                    <table style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      fontSize: "12px",
                    }}>
                      <thead>
                        <tr>
                          {allColumns.map(col => (
                            <th
                              key={col}
                              style={{
                                padding: "8px",
                                textAlign: "left",
                                borderBottom: "1px solid #404040",
                                color: "#b0b0b0",
                                fontWeight: 600,
                              }}
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pivot.map((row: any, idx: number) => (
                          <tr
                            key={idx}
                            style={{
                              borderBottom: "1px solid #2a2a2a",
                              backgroundColor: idx % 2 === 0 ? "#1a1a1a" : "#161616",
                            }}
                          >
                            {allColumns.map(col => (
                              <td
                                key={col}
                                style={{
                                  padding: "8px",
                                  color: "#e0e0e0",
                                }}
                              >
                                {String(row[col] ?? "-")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              }

              // Default: pie chart
              const COLORS = [
                "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099",
                "#3B3EAC", "#0099C6", "#DD4477", "#66AA00", "#B82E2E",
              ];

              return (
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Tooltip formatter={(val: any) => String(val)} />
                      <Legend verticalAlign="bottom" align="center" iconType="circle" />
                      <Pie
                        data={chartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="45%"
                        outerRadius={80}
                        stroke="#1e2a35"
                        strokeWidth={2}
                        label={false}
                      >
                        {chartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              );
            }}
          />
        </div>

        {/* Footer */}
        {data.footer && (
          <div style={{
            fontSize: "11px",
            color: "#6b7280",
            fontWeight: 400,
          }}>
            {data.footer}
          </div>
        )}
      </div>
    );
  }
}

/**
 * Edit mode builder for CubeWidget
 * Shows simple summary in edit mode
 */
@RegisterBuilder("cube", true)
export class CubeWidgetEditBuilder extends WidgetBuilder<CubeWidgetData> {
  render() {
    const { data, context } = this.props;
    const isSelected = context?.selectedId === data.id;

    return (
      <SelectionOverlay
        isSelected={isSelected}
        label="Cube Chart"
        widget={data}
        onClick={(e) => {
          e.stopPropagation();
          messageBus.publish({ topic: "editor", message: "select", payload: data });
        }}
      >
        <div
          style={{
            backgroundColor: data.backgroundColor || "#1e2a35",
            borderRadius: `${data.borderRadius || 8}px`,
            padding: "16px",
            color: "#fff",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            minHeight: "120px",
            height: "100%",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Header with icon and title */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>{data.icon || "⏱"}</span>
            <span style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#9ca3af",
              fontWeight: 500,
            }}>
              {data.title || "METRIC TITLE"}
            </span>
          </div>

          {/* Configuration Summary */}
          <div style={{ flex: 1, fontSize: "12px", color: "#9ca3af" }}>
            {data.configuration ? (
              <>
                <div>📊 {data.configuration.renderingComponent || "linechart"}</div>
                <div>📈 Measures: {data.configuration.measures?.length || 0} selected</div>
                <div>📉 Dimensions: {data.configuration.dimensions?.length || 0} selected</div>
                {data.configuration.filters && data.configuration.filters.length > 0 && (
                  <div>🔍 Filters: {data.configuration.filters.length}</div>
                )}
              </>
            ) : (
              <div style={{ color: "#6b7280" }}>Not configured - edit in properties panel</div>
            )}
          </div>

          {/* Footer */}
          {data.footer && (
            <div style={{
              fontSize: "11px",
              color: "#6b7280",
              fontWeight: 400,
            }}>
              {data.footer}
            </div>
          )}
        </div>
      </SelectionOverlay>
    );
  }
}
