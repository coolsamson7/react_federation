
import {  DimensionType as DimensionTypeImport } from "@portal/cube";

export type DimensionType = DimensionTypeImport;

/**
 * Cube.js compatible filter operators
 */
export type FilterOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "notContains"
  | "startsWith"
  | "endsWith"
  | "in"
  | "notIn"
  | "set"
  | "notSet"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "before"
  | "after"
  | "onOrBefore"
  | "onOrAfter"
  | "inDateRange"
  | "notInDateRange";

export type OperandType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "string[]"
  | "number[]"
  | "date[]"
  | "none"; // for set / notSet


export type CubeOperator = {
  name: string;              // Cube.js operator
  label: string;             // UI label
  operandTypes: OperandType[];
  arity: number;             // number of operands
};

export const STRING_OPERATORS: CubeOperator[] = [
  {
    name: "equals",
    label: "equals",
    operandTypes: ["string"],
    arity: 1
  },
  {
    name: "notEquals",
    label: "does not equal",
    operandTypes: ["string"],
    arity: 1
  },
  {
    name: "contains",
    label: "contains",
    operandTypes: ["string"],
    arity: 1
  },
  {
    name: "notContains",
    label: "does not contain",
    operandTypes: ["string"],
    arity: 1
  },
  {
    name: "startsWith",
    label: "starts with",
    operandTypes: ["string"],
    arity: 1
  },
  {
    name: "endsWith",
    label: "ends with",
    operandTypes: ["string"],
    arity: 1
  },
  {
    name: "in",
    label: "is one of",
    operandTypes: ["string[]"],
    arity: 1
  },
  {
    name: "notIn",
    label: "is not one of",
    operandTypes: ["string[]"],
    arity: 1
  },
  {
    name: "set",
    label: "is not empty",
    operandTypes: ["none"],
    arity: 0
  },
  {
    name: "notSet",
    label: "is empty",
    operandTypes: ["none"],
    arity: 0
  }
];

export const NUMBER_OPERATORS: CubeOperator[] = [
  {
    name: "equals",
    label: "equals",
    operandTypes: ["number"],
    arity: 1
  },
  {
    name: "notEquals",
    label: "does not equal",
    operandTypes: ["number"],
    arity: 1
  },
  {
    name: "gt",
    label: "greater than",
    operandTypes: ["number"],
    arity: 1
  },
  {
    name: "gte",
    label: "greater than or equal",
    operandTypes: ["number"],
    arity: 1
  },
  {
    name: "lt",
    label: "less than",
    operandTypes: ["number"],
    arity: 1
  },
  {
    name: "lte",
    label: "less than or equal",
    operandTypes: ["number"],
    arity: 1
  },
  {
    name: "in",
    label: "is one of",
    operandTypes: ["number[]"],
    arity: 1
  },
  {
    name: "notIn",
    label: "is not one of",
    operandTypes: ["number[]"],
    arity: 1
  },
  {
    name: "set",
    label: "is not empty",
    operandTypes: ["none"],
    arity: 0
  },
  {
    name: "notSet",
    label: "is empty",
    operandTypes: ["none"],
    arity: 0
  }
];

export const DATE_OPERATORS: CubeOperator[] = [
  {
    name: "equals",
    label: "on",
    operandTypes: ["date"],
    arity: 1
  },
  {
    name: "notEquals",
    label: "not on",
    operandTypes: ["date"],
    arity: 1
  },
  {
    name: "after",
    label: "after",
    operandTypes: ["date"],
    arity: 1
  },
  {
    name: "before",
    label: "before",
    operandTypes: ["date"],
    arity: 1
  },
  {
    name: "onOrAfter",
    label: "on or after",
    operandTypes: ["date"],
    arity: 1
  },
  {
    name: "onOrBefore",
    label: "on or before",
    operandTypes: ["date"],
    arity: 1
  },
  {
    name: "inDateRange",
    label: "between",
    operandTypes: ["date", "date"],
    arity: 2
  },
  {
    name: "notInDateRange",
    label: "not between",
    operandTypes: ["date", "date"],
    arity: 2
  },
  {
    name: "set",
    label: "is not empty",
    operandTypes: ["none"],
    arity: 0
  },
  {
    name: "notSet",
    label: "is empty",
    operandTypes: ["none"],
    arity: 0
  }
];

export const CRITERION_REFERENCE_OPERATOR: CubeOperator = {
  name: "usesCriterion",
  label: "uses criterion",
  operandTypes: ["string"], // criterionId
  arity: 1
};

export function operatorsForType(type: string) {
  console.log(`operator fpr type ${type}`)
    switch (type) {
    case "string": return [...STRING_OPERATORS, CRITERION_REFERENCE_OPERATOR];
    case "number": return [...NUMBER_OPERATORS, CRITERION_REFERENCE_OPERATOR];
    case "date": return [...DATE_OPERATORS, CRITERION_REFERENCE_OPERATOR];
    case "time": return [...DATE_OPERATORS, CRITERION_REFERENCE_OPERATOR];
  }
}

export interface FilterConfig {
  dimension: string; // e.g. "Orders.status" (cube name + dimension name)
  operator: FilterOperator;
  values: any[];
}


/**
 * Rendering component types available
 */
export type RenderingComponentType = "linechart" | "barchart" | "table";

/**
 * Axis configuration for chart rendering
 */
export interface AxisConfig {
  type: "dimension" | "measure";
  field: string;
  label?: string;
}

/**
 * Chart-specific configuration
 */
export interface ChartConfig {
  xAxis: AxisConfig;
  yAxis: AxisConfig;
}