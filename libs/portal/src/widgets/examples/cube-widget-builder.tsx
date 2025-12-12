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
      <QueryRenderer
      query={{
        measures: ["Orders.count"],
        dimensions: ["Customers.name"],
        limit: 20
      }}
      cubeApi={cubejsApi}
      render={({ resultSet, error, loadingState }) => {
        console.log("error", error)
           console.log("loading", loadingState)
          console.log("resultSet", resultSet)

          if (loadingState.isLoading) return <p>Loading...</p>;
        if (error) return <p>Error: {error.toString()}</p>;
        // Guard: resultSet can be null per typings
        if (!resultSet) return null;

        console.log(resultSet!.tablePivot())

        const pivot = resultSet!.tablePivot();
        const data = pivot.map((row) => ({
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
          <div style={{ width: "100%", height: 320, color: "black" }}>
            <ResponsiveContainer>
              <PieChart>
                <Tooltip formatter={(val: any) => String(val)} wrapperStyle={{ color: "black" }} />
                <Legend verticalAlign="bottom" align="center" iconType="circle" wrapperStyle={{ color: "black" }} />
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="45%"
                  outerRadius={90}
                  stroke="#ffffff"
                  label={false}
                >
                  {data.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      }}
    />
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
        onClick={(e) => {
          e.stopPropagation();
          messageBus.publish({ topic: "editor", message: "select", payload: data });
        }}
      >
        <div style={{ color: "black", padding: 8, backgroundColor: "#2a2a2a" }}>
          📊 Cube Chart
        </div>
      </SelectionOverlay>
    );
  }
}
