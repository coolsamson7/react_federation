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
 * Filter configuration for a cube query - Cube.js compatible
 */
export interface FilterConfig {
  dimension: string; // e.g. "Orders.status" (cube name + dimension name)
  operator: FilterOperator;
  value: string | number | string[] | number[] | boolean;
}

/**
 * Convert FilterConfig to Cube.js API format
 */
export function toCubeJsFilter(filter: FilterConfig) {
  const values = Array.isArray(filter.value) 
    ? filter.value 
    : [filter.value];

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
 */
export function buildCubeQuery(config: CubeWidgetConfig) {
  const measures = config.measures.map(
    (m) => `${config.cubeName}.${m}`
  );
  const dimensions = config.dimensions.map(
    (d) => `${config.cubeName}.${d}`
  );

  const filters = config.filters.map(toCubeJsFilter);

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
