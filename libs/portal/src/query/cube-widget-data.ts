import { CubeDescriptor, DimensionDescriptor, DimensionType as DimensionTypeImport } from "@portal/metadata/cube_metadata";

export type DimensionType = DimensionTypeImport;

/**
 * Cube.js compatible filter operators
 */
export type FilterOperator = 
  | "equals"
  | "notEquals"
  | "greaterThan"
  | "lessThan"
  | "greaterThanOrEqual"
  | "lessThanOrEqual"
  | "contains"
  | "notContains"
  | "in"
  | "notIn"
  | "beforeDate"
  | "afterDate"
  | "inDateRange";

/**
 * Operators available for each dimension type
 */
export const OPERATORS_BY_TYPE: Record<DimensionType, FilterOperator[]> = {
  string: ["equals", "notEquals", "contains", "notContains", "in", "notIn"],
  number: ["equals", "notEquals", "greaterThan", "lessThan", "greaterThanOrEqual", "lessThanOrEqual", "in", "notIn"],
  time: ["equals", "notEquals", "greaterThan", "lessThan", "beforeDate", "afterDate", "inDateRange"],
  boolean: ["equals", "notEquals"],
};

/**
 * Input type for filter value based on dimension type
 */
export const INPUT_TYPE_BY_DIMENSION: Record<DimensionType, string> = {
  string: "text",
  number: "number",
  time: "date",
  boolean: "select",
};

/**
 * Value type for filter configuration
 */
export type ValueType = {
  type: 'variable' | 'value';
  value: string | number | boolean;
};

/**
 * Filter configuration for a cube query - Cube.js compatible
 */
export interface FilterConfig {
  dimension: string; // e.g. "Orders.status" (cube name + dimension name)
  operator: FilterOperator;
  value: ValueType;
}

/**
 * Evaluate a ValueType with the predefinedQuery context
 *
 * This function evaluates a ValueType object based on its type:
 * - If type is 'value', it returns the direct value
 * - If type is 'variable', it looks up the variable name in the predefinedQuery context
 *
 * @example
 * // Direct value
 * const valueType = { type: 'value', value: 'completed' };
 * evaluateValueType(valueType); // Returns 'completed'
 *
 * // Variable reference
 * const valueType = { type: 'variable', value: 'orderStatus' };
 * const context = { predefinedQuery: { orderStatus: 'completed' } };
 * evaluateValueType(valueType, context); // Returns 'completed'
 *
 * @param valueType - The ValueType object to evaluate
 * @param context - The context object containing predefinedQuery variables
 * @returns The evaluated value
 */
export function evaluateValueType(valueType: ValueType, context: any = {}) {
  if (!valueType || typeof valueType !== 'object') {
    console.warn('Invalid ValueType provided:', valueType);
    return valueType;
  }

  if (valueType.type === 'value') {
    return valueType.value;
  } else if (valueType.type === 'variable') {
    // Get the variable name from valueType.value
    const variableName = String(valueType.value);

    // Look for the variable in predefinedQuery from context
    if (context.predefinedQuery && context.predefinedQuery[variableName] !== undefined) {
      return context.predefinedQuery[variableName];
    } else {
      console.warn(`Variable ${variableName} not found in predefinedQuery context`);
      return valueType.value; // Fall back to the variable name as a string
    }
  }

  return valueType.value;
}

/**
 * Convert FilterConfig to Cube.js API format
 */
export function toCubeJsFilter(filter: FilterConfig, context: any = {}) {
  // Evaluate the value based on its type (direct value or variable)
  const evaluatedValue = evaluateValueType(filter.value, context);

  const values = Array.isArray(evaluatedValue)
    ? evaluatedValue
    : [evaluatedValue];

  return {
    member: filter.dimension,
    operator: filter.operator,
    values,
  };
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

/**
 * Complete cube widget configuration
 */
export interface CubeWidgetConfig {
  id: string;
  cubeName: string;
  measures: string[]; // Selected measure names
  dimensions: string[]; // Selected dimension names
  filters: FilterConfig[];
  renderingComponent: RenderingComponentType;
  chartConfig?: ChartConfig; // Required for chart rendering components
  title?: string;
  description?: string;
}

/**
 * Query data returned from Cube.js API
 */
export interface QueryResult {
  data: Record<string, string | number>[];
  meta: Record<string, unknown>;
}

/**
 * Build a Cube.js query object from widget config
 *
 * This function converts a CubeWidgetConfig into a Cube.js compatible query object.
 * It handles filter value resolution from context for variable references.
 *
 * @example
 * // Usage with variable binding in filters
 * const config = {
 *   id: 'order-stats',
 *   cubeName: 'Orders',
 *   measures: ['count'],
 *   dimensions: ['status'],
 *   filters: [{
 *     dimension: 'Orders.status',
 *     operator: 'equals',
 *     value: { type: 'variable', value: 'statusFilter' }
 *   }],
 *   renderingComponent: 'barchart'
 * };
 *
 * // Context with predefined variables
 * const context = {
 *   predefinedQuery: {
 *     statusFilter: 'completed'
 *   }
 * };
 *
 * const query = buildCubeQuery(config, context);
 * // The filter value 'statusFilter' will be replaced with 'completed'
 *
 * @param config - The widget configuration
 * @param context - The context containing predefinedQuery variables
 * @returns A Cube.js compatible query object
 */
export function buildCubeQuery(config: CubeWidgetConfig, context: any = {}) {
  const measures = config.measures.map(
    (m) => `${config.cubeName}.${m}`
  );
  const dimensions = config.dimensions.map(
    (d) => `${config.cubeName}.${d}`
  );

  const filters = config.filters.map(filter => toCubeJsFilter(filter, context));

  return {
    measures,
    dimensions,
    filters: filters.length > 0 ? filters : undefined,
  };
}

/**
 * Extract available fields from a cube for axis selection
 */
export function getAvailableFields(cube: CubeDescriptor) {
  const measures = cube.measures?.map((m) => ({
    name: m.name,
    displayName: m.title || m.name,
    type: "measure" as const,
  })) || [];

  const dimensions = cube.dimensions?.map((d) => ({
    name: d.name,
    displayName: d.title || d.name,
    type: "dimension" as const,
    dimensionType: d.type,
  })) || [];

  return { measures, dimensions };
}

/**
 * Get valid operators for a dimension based on its type
 */
export function getOperatorsForDimension(cube: CubeDescriptor, dimensionName: string) {
  const dimension = cube.dimensions?.find(d => d.name === dimensionName);
  if (!dimension) return ["equals"];
  
  return OPERATORS_BY_TYPE[dimension.type] || ["equals"];
}

/**
 * Get the input type for a dimension
 */
export function getInputTypeForDimension(cube: CubeDescriptor, dimensionName: string) {
  const dimension = cube.dimensions?.find(d => d.name === dimensionName);
  if (!dimension) return "text";
  
  return INPUT_TYPE_BY_DIMENSION[dimension.type] || "text";
}

/**
 * Get sample/enum values for a dimension if available
 */
export function getSampleValuesForDimension(cube: CubeDescriptor, dimensionName: string): string[] {
  const dimension = cube.dimensions?.find(d => d.name === dimensionName);
  if (!dimension) return [];

  // Mock data - in real app, this would come from API or dimension config
  const valuesByDimension: Record<string, string[]> = {
    "status": ["pending", "completed", "cancelled", "shipped"],
    "country": ["USA", "UK", "Germany", "France", "Canada"],
    "category": ["Electronics", "Clothing", "Books", "Home & Garden"],
  };

  return valuesByDimension[dimensionName] || [];
}
