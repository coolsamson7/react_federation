// cubeDescriptors.ts

// -------------------------
// Cube.js enums / unions
// -------------------------

export type MeasureType =
  | "count"
  | "countDistinct"
  | "sum"
  | "avg"
  | "min"
  | "max";

export type DimensionType =
  | "string"
  | "number"
  | "time"
  | "boolean";

export type JoinRelationship =
  | "belongsTo"
  | "hasMany"
  | "hasOne";

export type TimeGranularity =
  | "second"
  | "minute"
  | "hour"
  | "day"
  | "week"
  | "month"
  | "quarter"
  | "year";

// -------------------------
// Measures
// -------------------------

export interface MeasureDescriptor {
  name: string;
  type: MeasureType;

  /** Column reference (table column) */
  column?: string;

  /** Raw SQL expression */
  expression?: string;

  title?: string;
  description?: string;

  filters?: Record<string, string | number | boolean>;
}

// -------------------------
// Dimensions
// -------------------------

export interface DimensionDescriptor {
  name: string;
  column: string;
  type: DimensionType;

  primaryKey?: boolean;

  /** Only for time dimensions */
  granularities?: TimeGranularity[];

  title?: string;
  description?: string;
}

// -------------------------
// Segments
// -------------------------

export interface SegmentDescriptor {
  name: string;

  /** SQL boolean expression */
  expression: string;

  title?: string;
  description?: string;
}

// -------------------------
// Joins
// -------------------------

export interface JoinDescriptor {
  /** Target cube name */
  name: string;

  relationship: JoinRelationship;

  /** SQL join condition */
  on: string;

  /** Optional link to entity RelationMappingDescriptor */
  relationMappingId?: string;
}

// -------------------------
// Pre-aggregations
// -------------------------

export interface PreAggregationDescriptor {
  name: string;

  measures: string[];
  dimensions: string[];

  timeDimension?: string;
  granularity?: TimeGranularity;

  refreshKey?: string;
}

// -------------------------
// Cube
// -------------------------

export interface CubeDescriptor {
  name: string;

  /** schema.table */
  table: string;

  /** Optional SQL override */
  sql?: string;

  measures?: MeasureDescriptor[];
  dimensions?: DimensionDescriptor[];
  segments?: SegmentDescriptor[];
  joins?: JoinDescriptor[];
  preAggregations?: PreAggregationDescriptor[];

  title?: string;
  description?: string;
}

// -------------------------
// Cube schema container
// -------------------------

export interface CubeSchemaDescriptor {
  cubes: CubeDescriptor[];

  version?: string;
  generatedFromDatabase?: string;
}
