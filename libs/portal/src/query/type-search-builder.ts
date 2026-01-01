/**
 * Type-based Search Model Builder
 * 
 * Helper utilities for creating search models with Type-based constraints
 */

import { Type } from "@portal/validation";
import {OperatorFactory, SearchCriterion, SearchOperator} from "./query-model";

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
): SearchCriterion {
  return {
    name,
    label,
    path: options?.path || name,
    type,
    mandatory: options?.mandatory ?? false,
    default: options?.default ?? false,
    visible: options?.visible ?? true,
  };
}