from __future__ import annotations

from typing import List, Dict, Optional, Literal, Union

from pydantic import BaseModel, Field

# -------------------------
# Cube.js enums
# -------------------------

MeasureType = Literal[
    "count",
    "countDistinct",
    "sum",
    "avg",
    "min",
    "max"
]

DimensionType = Literal[
    "string",
    "number",
    "time",
    "boolean"
]

JoinRelationship = Literal[
    "belongsTo",
    "hasMany",
    "hasOne"
]

TimeGranularity = Literal[
    "second",
    "minute",
    "hour",
    "day",
    "week",
    "month",
    "quarter",
    "year"
]

# -------------------------
# Measures
# -------------------------

class MeasureDescriptor(BaseModel):
    name: str
    type: MeasureType

    column: Optional[str] = None
    expression: Optional[str] = None

    title: Optional[str] = None
    description: Optional[str] = None

    filters: Dict[str, Union[str, int, float]] = Field(default_factory=dict)


# -------------------------
# Dimensions
# -------------------------

class DimensionDescriptor(BaseModel):
    name: str
    column: str
    type: DimensionType

    primary_key: bool = False
    granularities: Optional[List[TimeGranularity]] = None

    title: Optional[str] = None
    description: Optional[str] = None


# -------------------------
# Segments
# -------------------------

class SegmentDescriptor(BaseModel):
    name: str
    expression: str

    title: Optional[str] = None
    description: Optional[str] = None


# -------------------------
# Joins
# -------------------------

class JoinDescriptor(BaseModel):
    name: Optional[str] = None
    relationship: JoinRelationship
    on: str

    # Optional link back to entity relation metadata
    relation_mapping_id: Optional[str] = None


# -------------------------
# Pre-aggregations
# -------------------------

class PreAggregationDescriptor(BaseModel):
    name: str

    measures: List[str]
    dimensions: List[str]

    time_dimension: Optional[str] = None
    granularity: Optional[TimeGranularity] = None

    refresh_key: Optional[str] = None


# -------------------------
# Cube
# -------------------------

class CubeDescriptor(BaseModel):
    name: Optional[str] = None
    table: Optional[str] = None               # schema.table

    sql: Optional[str] = None

    measures: List[MeasureDescriptor] = Field(default_factory=list)
    dimensions: List[DimensionDescriptor] = Field(default_factory=list)
    segments: List[SegmentDescriptor] = Field(default_factory=list)
    joins: List[JoinDescriptor] = Field(default_factory=list)
    pre_aggregations: List[PreAggregationDescriptor] = Field(default_factory=list)

    title: Optional[str] = None
    description: Optional[str] = None


# -------------------------
# Cube schema container
# -------------------------

class CubeSchemaDescriptor(BaseModel):
    cubes: List[CubeDescriptor]

    version: str = "1.0"
    generated_from_database: Optional[str] = None
