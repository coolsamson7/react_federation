// cubeDescriptors.ts

// -------------------------
// Cube.js enums / unions
// -------------------------

import {DatabaseDescriptor} from "@portal/metadata/metadata";
import {MetadataServiceOptions} from "@portal/metadata/metadata-service";

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

  primary_key?: boolean;

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
  relation_mapping_id?: string;
}

// -------------------------
// Pre-aggregations
// -------------------------

export interface PreAggregationDescriptor {
  name: string;

  measures: string[];
  dimensions: string[];

  time_dimension?: string;
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
  pre_aggregations?: PreAggregationDescriptor[];

  title?: string;
  description?: string;
}

// -------------------------
// Cube schema container
// -------------------------

export interface CubeSchemaDescriptor {
  cubes: CubeDescriptor[];

  version?: string;
  generated_from_database?: string;
}


// NT HERE


export class CubeService {
  private baseUrl: string;

  constructor(options?: MetadataServiceOptions) {
    this.baseUrl = options?.baseUrl ?? "http://localhost:8000/api/cube/";
  }

  private async get<TResponse>(
  endpoint: string,
  params?: Record<string, string>
): Promise<TResponse> {
  const url = new URL(endpoint, this.baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      "Accept": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `CubeService ${endpoint} failed: ${response.status} ${response.statusText}`
    );
  }

  return (await response.json()) as TResponse;
}

  private async post<TRequest, TResponse>(
    endpoint: string,
    body: TRequest
  ): Promise<TResponse> {
    const url = new URL(endpoint, this.baseUrl);

    const response = await fetch(url.toString(), {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(
        `CubeService ${endpoint} failed: ${response.status} ${response.statusText}`
      );
    }

    return (await response.json()) as TResponse;
  }

  /** POST /create */
  createCube(cube: CubeDescriptor): Promise<CubeDescriptor> {
    return this.post<CubeDescriptor, CubeDescriptor>("create", cube);
  }

  /** POST /update */
  updateCube(cube: CubeDescriptor): Promise<CubeDescriptor> {
    return this.post<CubeDescriptor, CubeDescriptor>("update", cube);
  }

  /** POST /list */
  listCubes(): Promise<CubeDescriptor[]> {
    return this.get<CubeDescriptor[]>("list");
  }

  /** POST /deploy */
  async deployCube(cube: CubeDescriptor): Promise<void> {
    await this.post<CubeDescriptor, unknown>("deploy", cube);
  }
}

export class MetadataService {
  private baseUrl: string;

  constructor(options?: MetadataServiceOptions) {
    this.baseUrl = options?.baseUrl ?? "http://localhost:8000/api/metadata/";
  }

  /**
   * Fetch the metadata from the backend.
   * @param dialect Optional SQL dialect, defaults to 'postgres'
   */
  async getMetadata(dialect: string = "postgres"): Promise<DatabaseDescriptor> {
      console.log( "######## " , this.baseUrl)
    const url = new URL("fetch", this.baseUrl);
    url.searchParams.set("dialect", dialect);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Accept": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as DatabaseDescriptor;
    return data;
  }
}