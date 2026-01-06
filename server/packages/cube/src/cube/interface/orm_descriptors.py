from __future__ import annotations

from dataclasses import dataclass, field
from typing import List, Tuple, Optional, Literal

SemanticType = Literal["string", "number", "time", "boolean"]
Cardinality = Literal["one", "many"]

# -------------------------
# Column descriptor
# -------------------------

@dataclass
class ColumnDescriptor:
    name: str
    db_type: str
    sqlalchemy_type: str

    semantic_type: SemanticType
    nullable: bool

    is_primary_key: bool
    is_foreign_key: bool

# -------------------------
# Optional: low-level FK descriptor
# -------------------------

@dataclass
class ForeignKeyDescriptor:
    name: Optional[str]

    source_column: str
    target_table: str          # schema.table
    target_column: str

# -------------------------
# Canonical relation mapping
# -------------------------
@dataclass
class RelationMappingDescriptor:
    left_table: str
    right_table: str

    # left → right column pairs
    column_pairs: List[Tuple[str, str]]

    left_cardinality: Cardinality
    right_cardinality: Cardinality

    # ORM secondary / bridge table
    bridge_table: Optional[str] = None

    # Optional raw FKs for debugging
    foreign_keys: Optional[List[ForeignKeyDescriptor]] = None

# -------------------------
# Table-local relation descriptor
# -------------------------
@dataclass
class RelationDescriptor:
    table: str
    other_table: str
    mapping: RelationMappingDescriptor
    direction: Literal["left", "right"]

    # ORM attributes
    attribute_name: Optional[str] = None
    inverse_name: Optional[str] = None

# -------------------------
# Table / schema / database descriptors
# -------------------------
@dataclass
class TableDescriptor:
    id: str                   # schema.table
    schema: str
    name: str

    columns: List[ColumnDescriptor] = field(default_factory=list)
    primary_key: List[str] = field(default_factory=list)

    foreign_keys: List[ForeignKeyDescriptor] = field(default_factory=list)
    relations: List[RelationDescriptor] = field(default_factory=list)

@dataclass
class SchemaDescriptor:
    name: str
    tables: List[TableDescriptor]

@dataclass
class DatabaseDescriptor:
    dialect: str
    schemas: List[SchemaDescriptor]
