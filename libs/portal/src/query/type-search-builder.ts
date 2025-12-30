/**
 * Type-based Search Model Builder
 * 
 * Helper utilities for creating search models with Type-based constraints
 */

import { Type } from "@portal/validation";
import { SearchCriterion, SearchOperator } from "./query-model";
import { ConstraintDefinition } from "./components/constraint-chip";
import { CriterionWithConstraints } from "./components/search-model-definition";

/**
 * Extract constraint definitions from a Type instance
 */
export function extractConstraintsFromType(type: Type<any>): ConstraintDefinition[] {
  const constraints: ConstraintDefinition[] = [];

  if (!type.tests) {
    return constraints;
  }

  type.tests.forEach((test, index) => {
    constraints.push({
      id: `${test.name}-${index}`,
      name: test.name,
      test,
      params: test.params || {},
      message: test.message,
    });
  });

  return constraints;
}

/**
 * Get operator names for a specific type
 * Can be overridden for custom operator logic
 */
export function getOperatorsForType(type: Type<any>): string[] {
  const typeName = type.name || "unknown";

  switch (typeName) {
    case "string":
      return ["equals", "notEquals", "contains", "notContains", "startsWith", "endsWith"];
    case "number":
    case "integer":
      return ["equals", "notEquals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual"];
    case "date":
      return ["equals", "before", "after", "between"];
    case "boolean":
      return ["equals", "notEquals"];
    default:
      return ["equals", "notEquals"];
  }
}

/**
 * Get operator configuration
 */
export function getOperator(name: string): SearchOperator {
  const operatorConfigs: Record<string, SearchOperator> = {
    equals: { name: "equals", label: "=", operandCount: 1 },
    notEquals: { name: "notEquals", label: "≠", operandCount: 1 },
    contains: { name: "contains", label: "contains", operandCount: 1 },
    notContains: { name: "notContains", label: "does not contain", operandCount: 1 },
    startsWith: { name: "startsWith", label: "starts with", operandCount: 1 },
    endsWith: { name: "endsWith", label: "ends with", operandCount: 1 },
    greaterThan: { name: "greaterThan", label: ">", operandCount: 1 },
    lessThan: { name: "lessThan", label: "<", operandCount: 1 },
    greaterThanOrEqual: { name: "greaterThanOrEqual", label: "≥", operandCount: 1 },
    lessThanOrEqual: { name: "lessThanOrEqual", label: "≤", operandCount: 1 },
    between: { name: "between", label: "between", operandCount: 2 },
    before: { name: "before", label: "before", operandCount: 1 },
    after: { name: "after", label: "after", operandCount: 1 },
  };

  return operatorConfigs[name] || { name, label: name, operandCount: 1 };
}

/**
 * Create a search criterion from a type
 */
export function createCriterionFromType(
  name: string,
  label: string,
  type: Type<any>,
  options?: {
    path?: string;
    mandatory?: boolean;
    default?: boolean;
    visible?: boolean;
  }
): CriterionWithConstraints {
  const operatorNames = getOperatorsForType(type);
  const operators = operatorNames.map((name) => getOperator(name));
  const constraints = extractConstraintsFromType(type);

  return {
    name,
    label,
    path: options?.path || name,
    type,
    mandatory: options?.mandatory ?? false,
    default: options?.default ?? false,
    visible: options?.visible ?? true,
    operators,
    typeConstraints: constraints,
  };
}

/**
 * Validate a value against type constraints
 */
export function validateAgainstConstraints(
  value: any,
  constraints: ConstraintDefinition[]
): string[] {
  const errors: string[] = [];

  constraints.forEach((constraint) => {
    if (constraint.test.check && !constraint.test.check(value)) {
      errors.push(constraint.message || `Failed constraint: ${constraint.name}`);
    }
  });

  return errors;
}

/**
 * Get constraint parameter input type hint
 */
export function getConstraintParamInputType(
  constraintName: string,
  paramName: string
): string {
  const paramTypeMap: Record<string, Record<string, string>> = {
    min: { min: "number" },
    max: { max: "number" },
    length: { length: "number" },
    matches: { re: "text" },
    format: { format: "text" },
    before: { date: "date" },
    after: { date: "date" },
  };

  return paramTypeMap[constraintName]?.[paramName] || "text";
}

/**
 * Format constraint display value
 */
export function formatConstraintValue(constraint: ConstraintDefinition): string {
  const paramValues = Object.entries(constraint.params)
    .map(([key, value]) => `${key}=${value}`)
    .join(", ");

  return paramValues ? `${constraint.name}(${paramValues})` : constraint.name;
}
