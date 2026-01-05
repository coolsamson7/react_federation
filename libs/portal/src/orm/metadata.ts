// metadata-descriptors.ts

export type SemanticType = "string" | "number" | "time" | "boolean";
export type Cardinality = "one" | "many";

// -------------------------
// Column descriptor
// -------------------------
export interface ColumnDescriptor {
  name: string;
  db_type: string;
  sqlalchemy_type: string; // can keep as string for generic purposes
  semantic_type: SemanticType;
  nullable: boolean;
  is_primary_key: boolean;
  is_foreign_key: boolean;
}

// -------------------------
// Optional low-level FK
// -------------------------
export interface ForeignKeyDescriptor {
  name?: string;
  source_column: string;
  target_table: string; // schema.table or just table
  target_column: string;
}

// -------------------------
// Canonical relation mapping
// -------------------------
export interface RelationMappingDescriptor {
  left_table: string;
  right_table: string;

  // column pairs: [leftColumn, rightColumn]
  column_pairs: Array<[string, string]>;

  left_cardinality: Cardinality;
  right_cardinality: Cardinality;

  bridge_table?: string; // optional N-N association table

  foreign_keys?: ForeignKeyDescriptor[]; // optional for debugging/UI
}

// -------------------------
// Table-local relation descriptor
// -------------------------
export interface RelationDescriptor {
  table: string;
  other_table: string;
  mapping: RelationMappingDescriptor;
  direction: "left" | "right";

  attribute_name?: string; // ORM attribute name
  inverse_name?: string;   // ORM back_populates name
}

// -------------------------
// Table / Schema / Database descriptors
// -------------------------
export interface TableDescriptor {
  id: string; // schema.table
  schema?: string;
  name: string;

  columns: ColumnDescriptor[];
  primary_key: string[];

  foreign_keys: ForeignKeyDescriptor[];
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
