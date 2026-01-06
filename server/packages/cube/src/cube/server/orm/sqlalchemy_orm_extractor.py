from sqlalchemy.orm import class_mapper, RelationshipProperty

from cube.interface import (
    DatabaseDescriptor,
    SchemaDescriptor,
    TableDescriptor,
    ColumnDescriptor,
    RelationMappingDescriptor,
    RelationDescriptor,
)

from typing import List, Type


def semantic_type_from_sqla(col_type) -> str:
    """Map SQLAlchemy types to semantic types."""
    from sqlalchemy.sql.sqltypes import Integer, Numeric, Date, DateTime, Boolean
    if isinstance(col_type, (Date, DateTime)):
        return "time"
    if isinstance(col_type, (Integer, Numeric)):
        return "number"
    if isinstance(col_type, Boolean):
        return "boolean"
    return "string"


def extract_tables_from_orm(base_classes: List[Type]) -> List[TableDescriptor]:
    tables = []
    for cls in base_classes:
        mapper = class_mapper(cls)
        table_name = cls.__tablename__

        columns = []
        pk = [c.key for c in mapper.primary_key]

        for col in mapper.columns:
            columns.append(ColumnDescriptor(
                name=col.key,
                db_type=str(col.type),
                sqlalchemy_type=col.type.__class__.__name__,
                semantic_type=semantic_type_from_sqla(col.type),
                nullable=col.nullable,
                is_primary_key=col.primary_key,
                is_foreign_key=bool(col.foreign_keys),
            ))

        tables.append(TableDescriptor(
            id=table_name,
            schema=None,  # SQLite/ORM demo; set schema if needed
            name=table_name,
            columns=columns,
            primary_key=pk,
        ))

    return tables


def extract_relations_from_orm(base_classes: List[Type], tables: List[TableDescriptor]) -> List[RelationDescriptor]:
    tables_by_name = {t.name: t for t in tables}
    relation_descriptors = []

    for cls in base_classes:
        mapper = class_mapper(cls)
        table_name = cls.__tablename__
        table = tables_by_name[table_name]

        for rel in mapper.relationships:  # type: RelationshipProperty
            # Skip self-reflections for now
            if rel.mapper.local_table.name == table_name and rel.key == rel.back_populates:
                continue

            # Column pairs: local → remote
            column_pairs = []
            for lc, rc in zip(rel.local_columns, rel.remote_side):
                column_pairs.append((lc.key, rc.key))

            left_card = "many" if rel.uselist else "one"
            right_card = "one"  # ORM gives many-to-one; reverse can be inferred

            mapping = RelationMappingDescriptor(
                left_table=table_name,
                right_table=rel.mapper.local_table.name,
                column_pairs=column_pairs,
                left_cardinality=left_card,
                right_cardinality=right_card,
            )

            # Left side
            left_rel = RelationDescriptor(
                table=table_name,
                other_table=rel.mapper.local_table.name,
                mapping=mapping,
                direction="left",
                attribute_name=rel.key,
                inverse_name=rel.back_populates
            )
            table.relations.append(left_rel)
            relation_descriptors.append(left_rel)

            # Right side
            remote_table = tables_by_name[rel.mapper.local_table.name]
            right_rel = RelationDescriptor(
                table=rel.mapper.local_table.name,
                other_table=table_name,
                mapping=mapping,
                direction="right",
                attribute_name=rel.back_populates,
                inverse_name=rel.key
            )
            remote_table.relations.append(right_rel)
            relation_descriptors.append(right_rel)

    return relation_descriptors


def extract_database_from_orm(base_classes: List[Type], dialect: str = "sqlite") -> DatabaseDescriptor:
    tables = extract_tables_from_orm(base_classes)
    relations = extract_relations_from_orm(base_classes, tables)
    schema = SchemaDescriptor(name="default", tables=tables)
    return DatabaseDescriptor(dialect=dialect, schemas=[schema])


from sqlalchemy.orm import DeclarativeBase
# Already imported at top of file
# from .metadata_descriptors import DatabaseDescriptor
# from .sqlalchemy_orm_extractor import extract_database_from_orm


def extract_all_entities(base: type[DeclarativeBase], dialect: str = "sqlite") -> DatabaseDescriptor:
    """
    Extract metadata descriptors for all ORM entities registered in a DeclarativeBase.

    :param base: Your DeclarativeBase subclass
    :param dialect: Optional, e.g. 'sqlite', 'postgresql'
    :return: DatabaseDescriptor with all tables and relations
    """
    # Collect all mapped classes from Base registry
    mapped_classes = [mapper.class_ for mapper in base.registry.mappers]

    # Use the ORM extractor to build descriptors
    db_descriptor = extract_database_from_orm(mapped_classes, dialect=dialect)

    return db_descriptor

