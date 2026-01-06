from __future__ import annotations

from typing import Dict, Any
import yaml

from cube.interface import CubeDescriptor

# -------------------------
# Helpers
# -------------------------

def _js_object(obj: Dict[str, Any], indent: int = 2) -> str:
    """Convert dict into formatted JS object literal."""
    space = " " * indent
    lines = ["{"]

    for key, value in obj.items():
        if value is None:
            continue

        if isinstance(value, str):
            lines.append(f'{space}{key}: `{value}`,')
        elif isinstance(value, bool):
            lines.append(f"{space}{key}: {str(value).lower()},")
        elif isinstance(value, list):
            lines.append(f"{space}{key}: {value},")
        else:
            lines.append(f"{space}{key}: {value},")

    lines.append("}")
    return "\n".join(lines)


# -------------------------
# JS generator
# -------------------------

def generate_cube_js(cube: CubeDescriptor) -> str:
    lines = [f"cube(`{cube.name}`, {{"]
    indent = "  "

    # SQL
    if cube.sql:
        lines.append(f"{indent}sql: `{cube.sql}`,")
    else:
        lines.append(f"{indent}sql: `SELECT * FROM {cube.table}`,")

    # Measures
    if cube.measures:
        lines.append(f"{indent}measures: {{")
        for m in cube.measures:
            body = {
                "type": m.type,
                "sql": m.expression or m.column,
                "title": m.title,
                "description": m.description,
            }
            lines.append(f"{indent*2}{m.name}: {_js_object(body, 6)},")
        lines.append(f"{indent}}},")

    # Dimensions
    if cube.dimensions:
        lines.append(f"{indent}dimensions: {{")
        for d in cube.dimensions:
            body = {
                "sql": d.column,
                "type": d.type,
                "primaryKey": d.primary_key or None,
                "title": d.title,
            }
            lines.append(f"{indent*2}{d.name}: {_js_object(body, 6)},")
        lines.append(f"{indent}}},")

    # Segments
    if cube.segments:
        lines.append(f"{indent}segments: {{")
        for s in cube.segments:
            lines.append(
                f"{indent*2}{s.name}: {{ sql: `{s.expression}` }},"
            )
        lines.append(f"{indent}}},")

    # Joins
    if cube.joins:
        lines.append(f"{indent}joins: {{")
        for j in cube.joins:
            lines.append(
                f"{indent*2}{j.name}: {{ relationship: '{j.relationship}', sql: `{j.on}` }},"
            )
        lines.append(f"{indent}}},")

    lines.append("});")
    return "\n".join(lines)


# -------------------------
# YAML generator
# -------------------------

def generate_cube_yaml(cube: CubeDescriptor) -> str:
    data = {
        "cube": cube.name,
        "table": cube.table,
        "sql": cube.sql,
        "measures": {},
        "dimensions": {},
        "segments": {},
        "joins": {},
    }

    for m in cube.measures:
        data["measures"][m.name] = {
            "type": m.type,
            "column": m.column,
            "expression": m.expression,
            "title": m.title,
        }

    for d in cube.dimensions:
        data["dimensions"][d.name] = {
            "column": d.column,
            "type": d.type,
            "primary_key": d.primary_key or None,
        }

    for s in cube.segments:
        data["segments"][s.name] = {
            "expression": s.expression,
        }

    for j in cube.joins:
        data["joins"][j.name] = {
            "relationship": j.relationship,
            "on": j.on,
        }

    # Remove empty sections
    data = {k: v for k, v in data.items() if v}

    return yaml.safe_dump(data, sort_keys=False)
