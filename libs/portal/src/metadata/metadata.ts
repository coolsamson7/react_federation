// metadata-descriptors.ts

export type SemanticType = "string" | "number" | "time" | "boolean";
export type Cardinality = "one" | "many";

// -------------------------
// Column descriptor
// -------------------------
export interface ColumnDescriptor {
  name: string;
  dbType: string;
  sqlalchemyType: string; // can keep as string for generic purposes
  semanticType: SemanticType;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
}

// -------------------------
// Optional low-level FK
// -------------------------
export interface ForeignKeyDescriptor {
  name?: string;
  sourceColumn: string;
  targetTable: string; // schema.table or just table
  targetColumn: string;
}

// -------------------------
// Canonical relation mapping
// -------------------------
export interface RelationMappingDescriptor {
  leftTable: string;
  rightTable: string;

  // column pairs: [leftColumn, rightColumn]
  columnPairs: Array<[string, string]>;

  leftCardinality: Cardinality;
  rightCardinality: Cardinality;

  bridgeTable?: string; // optional N-N association table

  foreignKeys?: ForeignKeyDescriptor[]; // optional for debugging/UI
}

// -------------------------
// Table-local relation descriptor
// -------------------------
export interface RelationDescriptor {
  table: string;
  otherTable: string;
  mapping: RelationMappingDescriptor;
  direction: "left" | "right";

  attributeName?: string; // ORM attribute name
  inverseName?: string;   // ORM back_populates name
}

// -------------------------
// Table / Schema / Database descriptors
// -------------------------
export interface TableDescriptor {
  id: string; // schema.table
  schema?: string;
  name: string;

  columns: ColumnDescriptor[];
  primaryKey: string[];

  foreignKeys: ForeignKeyDescriptor[];
  relations: RelationDescriptor[];
}

export interface SchemaDescriptor {
  name: string;
  tables: TableDescriptor[];
}

export interface DatabaseDescriptor {
  dialect: string;
  schemas: SchemaDescriptor[];
}
