import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import {CubeWidgetData} from "./cube-widget-data";
import { SelectionOverlay } from "../editor/SelectionOverlay";


// TODO not here

import cubejs from '@cubejs-client/core';

const API_URL = "http://localhost:4000/cubejs-api/v1";

export const cubejsApi = cubejs(
  "SECRET_KEY",  // <-- must match CUBEJS_API_SECRET
  { apiUrl: API_URL }
);

import { QueryRenderer } from "@cubejs-client/react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { messageBus } from "../editor/message-bus";

//


/**
 * Runtime builder for TextWidget
 * Renders the actual text with styling
 *
 * const query = {
 *   measures: ["Orders.totalAmount"],
 *   dimensions: ["Products.category"]
 * };
 */
@RegisterBuilder("cube", false)
export class CubeWidgetBuilder extends WidgetBuilder<CubeWidgetData> {
  render() {
    const { data } = this.props;

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <span style={{ fontSize: "16px" }}>{data.icon || "⏱"}</span>
          <span
            style={{
              fontSize: "11px",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              color: "#9ca3af",
              fontWeight: 500,
            }}
          >
            {data.title || "METRIC TITLE"}
          </span>
        </div>

        {/* Content - QueryRenderer with pie chart */}
        <div style={{ flex: 1 }}>
          <QueryRenderer
            query={{
              measures: ["Orders.count"],
              dimensions: ["Customers.name"],
              limit: 20
            }}
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
                  <div style={{ display: "flex", alignItems: "center", fontSize: "48px", fontWeight: 600 }}>
                    {data.value || "865"}
                    <span style={{ fontSize: "14px", fontWeight: 500, color: "#9ca3af", marginLeft: "8px" }}>
                      {data.unit || "MS"}
                    </span>
                  </div>
                );
              }

              if (!resultSet) return null;

              const pivot = resultSet.tablePivot();
              const chartData = pivot.map((row) => ({
                name: row["Customers.name"],
                value: Number(row["Orders.count"]) || 0,
              }));

              const COLORS = [
                "#3366CC", "#DC3912", "#FF9900", "#109618", "#990099",
                "#3B3EAC", "#0099C6", "#DD4477", "#66AA00", "#B82E2E",
                "#316395", "#994499", "#22AA99", "#AAAA11", "#6633CC",
                "#E67300", "#8B0707", "#651067", "#329262", "#5574A6"
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
          <div
            style={{
              fontSize: "11px",
              color: "#6b7280",
              fontWeight: 400,
            }}
          >
            {data.footer}
          </div>
        )}
      </div>
    );
  }
}

/**
 * Edit mode builder for TextWidget
 * Same as runtime but with visual indication that it's in edit mode
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
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span style={{ fontSize: "16px" }}>{data.icon || "⏱"}</span>
            <span
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                color: "#9ca3af",
                fontWeight: 500,
              }}
            >
              {data.title || "METRIC TITLE"}
            </span>
          </div>

          {/* Value */}
          <div style={{ flex: 1, display: "flex", alignItems: "center" }}>
            <span style={{ fontSize: "48px", fontWeight: 600, color: "#fff" }}>
              {data.value || "865"}
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: "#9ca3af",
                marginLeft: "8px",
              }}
            >
              {data.unit || "MS"}
            </span>
          </div>

          {/* Footer */}
          {data.footer && (
            <div
              style={{
                fontSize: "11px",
                color: "#6b7280",
                fontWeight: 400,
              }}
            >
              {data.footer}
            </div>
          )}
        </div>
      </SelectionOverlay>
    );
  }
}
