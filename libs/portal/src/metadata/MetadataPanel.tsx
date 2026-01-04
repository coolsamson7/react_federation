import React, {useState} from "react";
import {
    Plus,
    Search,
    Database,
    Layers,
    Filter,
    Link,
    BarChart3,
    X,
    Edit2,
    Save,
    Trash2,
    ChevronRight,
    ChevronDown,
    Tag,
    Wand2,
    Table
} from "lucide-react";
import {
    CubeDescriptor,
    MeasureDescriptor,
    DimensionDescriptor,
    JoinDescriptor,
    SegmentDescriptor,
    JoinRelationship
} from "./cube_metadata";
import {ColumnDescriptor, DatabaseDescriptor, RelationDescriptor, TableDescriptor} from "./metadata";

import {CubeService, MetadataService} from "@portal/metadata/cube_metadata";

export default function CubeConfigurator() {

    // TEsTMetadataService

    // TEST

    const [metadata, setMetadata] = useState<DatabaseDescriptor | null>(null);
    const [cubes, setCubes] = useState<CubeDescriptor[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const metadataService = new MetadataService();
    const cubeService = new CubeService();

    // Add useEffect for loading data:
    React.useEffect(() => {
        async function loadData() {
            try {
                setLoading(true);
                const [metadataResult, cubesResult] = await Promise.all([
                    metadataService.getMetadata(),
                    cubeService.listCubes()
                ]);
                setMetadata(metadataResult);
                setCubes(cubesResult);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : "Failed to load data");
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    const [selectedCube, setSelectedCube] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        measures: true,
        dimensions: true,
        joins: false,
        segments: false,
    });
    const [editingItem, setEditingItem] = useState<{ type: string; index: number } | null>(null);
    const [showTableSelector, setShowTableSelector] = useState(false);

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({...prev, [section]: !prev[section]}));
    };

    const cube = cubes.find(c => c.name === selectedCube);
    const cubeTable = cube ? metadata?.schemas.flatMap(s => s.tables).find(t => t.id === cube.table) : null;

    const updateCube = async (updates: Partial<CubeDescriptor>) => {
        if (!cube) return;
        const updated = {...cube, ...updates};
        try {
            await cubeService.updateCube(updated);
            setCubes(cubes.map(c => c.name === selectedCube ? updated : c));
        } catch (err) {
            alert(`Failed to update cube: ${err}`);
        }
    };

    // Generate cube from table metadata
    const generateCubeFromTable = (table: TableDescriptor) => {
        // --- Dimensions ---
        const dimensions: DimensionDescriptor[] = table.columns.map(col => ({
            name: col.name,
            column: col.name,
            type: col.semantic_type,
            primary_key: col.is_primary_key,
            title: col.name
                .split('_')
                .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                .join(' '),
        }));

        // --- Measures ---
        const measures: MeasureDescriptor[] = [
            {name: "count", type: "count", title: "Count"},
        ];

        table.columns.forEach(col => {
            if (col.semantic_type === "number" && !col.is_primary_key && !col.is_foreign_key) {
                const title = col.name
                    .split('_')
                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                    .join(' ');

                measures.push(
                    {name: `${col.name}Sum`, type: "sum", column: col.name, title: `Total ${title}`},
                    {name: `${col.name}Avg`, type: "avg", column: col.name, title: `Average ${title}`}
                );
            }
        });

        // --- Joins ---
        // Remove duplicate relations by key
        const seenJoins = new Set<string>();
        const joins: JoinDescriptor[] = [];

        table.relations.forEach(rel => {
            // Unique key for this relation
            const key = [rel.table, rel.other_table, JSON.stringify(rel.mapping.column_pairs)].join('|');
            if (seenJoins.has(key)) return; // skip duplicates
            seenJoins.add(key);

            // Determine relationship type
            let relationship: JoinRelationship;
            if (rel.direction === "left") {
                relationship = rel.mapping.left_cardinality === "many" ? "belongsTo" : "hasOne";
            } else {
                relationship = rel.mapping.left_cardinality === "many" ? "hasMany" : "hasOne";
            }

            // Build join condition
            const joinCondition = rel.mapping.column_pairs
                .map(([left, right]) => `${rel.table}.${left} = ${rel.other_table}.${right}`)
                .join(" AND ");

            // Join name = other table name (can adjust if you want aliasing)
            joins.push({
                name: rel.other_table.split('.').pop() || rel.other_table,
                relationship,
                on: joinCondition,
            });
        });

        // --- New cube object ---
        const newCube: CubeDescriptor = {
            name: table.name,
            table: table.id,
            title: table.name.charAt(0).toUpperCase() + table.name.slice(1),
            description: `Auto-generated cube for ${table.name}`,
            measures,
            dimensions,
            joins,
            segments: [],
        };

        // --- Update state ---
        setCubes([...cubes, newCube]);
        setSelectedCube(newCube.name);
        setShowTableSelector(false);
    };


    const addMeasure = () => {
        if (!cube) return;
        const newMeasure: MeasureDescriptor = {
            name: "newMeasure",
            type: "count",
            title: "New Measure",
        };
        updateCube({measures: [...(cube.measures || []), newMeasure]});
    };

    const updateMeasure = (index: number, updates: Partial<MeasureDescriptor>) => {
        if (!cube) return;
        const measures = [...(cube.measures || [])];
        measures[index] = {...measures[index], ...updates};
        updateCube({measures});
    };

    const deleteMeasure = (index: number) => {
        if (!cube) return;
        const measures = [...(cube.measures || [])];
        measures.splice(index, 1);
        updateCube({measures});
        setEditingItem(null);
    };

    const addDimension = () => {
        if (!cube) return;
        const newDimension: DimensionDescriptor = {
            name: "newDimension",
            column: "column_name",
            type: "string",
            title: "New Dimension",
        };
        updateCube({dimensions: [...(cube.dimensions || []), newDimension]});
    };

    const updateDimension = (index: number, updates: Partial<DimensionDescriptor>) => {
        if (!cube) return;
        const dimensions = [...(cube.dimensions || [])];
        dimensions[index] = {...dimensions[index], ...updates};
        updateCube({dimensions});
    };

    const deleteDimension = (index: number) => {
        if (!cube) return;
        const dimensions = [...(cube.dimensions || [])];
        dimensions.splice(index, 1);
        updateCube({dimensions});
        setEditingItem(null);
    };

    const addJoin = () => {
        if (!cube) return;
        const newJoin: JoinDescriptor = {
            name: "newJoin",
            relationship: "belongsTo",
            on: "table.id = other.id",
        };
        updateCube({joins: [...(cube.joins || []), newJoin]});
    };

    const updateJoin = (index: number, updates: Partial<JoinDescriptor>) => {
        if (!cube) return;
        const joins = [...(cube.joins || [])];
        joins[index] = {...joins[index], ...updates};
        updateCube({joins});
    };

    const deleteJoin = (index: number) => {
        if (!cube) return;
        const joins = [...(cube.joins || [])];
        joins.splice(index, 1);
        updateCube({joins});
        setEditingItem(null);
    };

    const addSegment = () => {
        if (!cube) return;
        const newSegment: SegmentDescriptor = {
            name: "newSegment",
            expression: "column = 'value'",
            title: "New Segment",
        };
        updateCube({segments: [...(cube.segments || []), newSegment]});
    };

    const updateSegment = (index: number, updates: Partial<SegmentDescriptor>) => {
        if (!cube) return;
        const segments = [...(cube.segments || [])];
        segments[index] = {...segments[index], ...updates};
        updateCube({segments});
    };

    const deleteSegment = (index: number) => {
        if (!cube) return;
        const segments = [...(cube.segments || [])];
        segments.splice(index, 1);
        updateCube({segments});
        setEditingItem(null);
    };

    const addNewCube = async () => {
        const newCube: CubeDescriptor = {
            name: "newCube",
            table: "schema.table",
            title: "New Cube",
            description: "Description",
            measures: [],
            dimensions: [],
            joins: [],
            segments: [],
        };
        try {
            const created = await cubeService.createCube(newCube);
            setCubes([...cubes, created]);
            setSelectedCube(created.name);
        } catch (err) {
            alert(`Failed to create cube: ${err}`);
        }
    };

    const allTables = metadata?.schemas.flatMap(s => s.tables) || [];
    const availableColumns = cubeTable?.columns || [];
    const availableRelations = cubeTable?.relations || [];
    const otherCubes = cubes.filter(c => c.name !== selectedCube);

    return (
        <div style={{
            display: "flex",
            height: "100vh",
            backgroundColor: "#0b141a",
            color: "#e9edef",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        }}>
            {/* Sidebar */}
            <div style={{
                width: "320px",
                backgroundColor: "#111b21",
                borderRight: "1px solid #2a2f32",
                display: "flex",
                flexDirection: "column",
            }}>
                <div style={{
                    padding: "20px",
                    backgroundColor: "#1f2c33",
                    borderBottom: "1px solid #2a2f32",
                }}>
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        marginBottom: "16px",
                    }}>
                        <Database size={24} color="#00a884"/>
                        <h1 style={{fontSize: "20px", fontWeight: "600", margin: 0}}>
                            Cube Schema
                        </h1>
                    </div>

                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        backgroundColor: "#2a3942",
                        borderRadius: "8px",
                        padding: "8px 12px",
                        gap: "8px",
                    }}>
                        <Search size={18} color="#8696a0"/>
                        <input
                            type="text"
                            placeholder="Search cubes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                flex: 1,
                                backgroundColor: "transparent",
                                border: "none",
                                outline: "none",
                                color: "#e9edef",
                                fontSize: "14px",
                            }}
                        />
                    </div>
                </div>

                <div style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "8px",
                }}>
                    {cubes.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map((c) => (
                        <div
                            key={c.name}
                            onClick={() => setSelectedCube(c.name)}
                            style={{
                                padding: "12px 16px",
                                backgroundColor: selectedCube === c.name ? "#2a3942" : "transparent",
                                borderRadius: "8px",
                                cursor: "pointer",
                                marginBottom: "4px",
                                transition: "background-color 0.2s",
                                border: selectedCube === c.name ? "1px solid #00a884" : "1px solid transparent",
                            }}
                        >
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "10px",
                            }}>
                                <Layers size={18} color={selectedCube === c.name ? "#00a884" : "#8696a0"}/>
                                <div style={{flex: 1}}>
                                    <div style={{fontSize: "15px", fontWeight: "500"}}>
                                        {c.title || c.name}
                                    </div>
                                    <div style={{fontSize: "12px", color: "#8696a0"}}>
                                        {c.table}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div style={{
                    padding: "16px",
                    borderTop: "1px solid #2a2f32",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                }}>
                    <button
                        onClick={() => setShowTableSelector(!showTableSelector)}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#00a884",
                            border: "none",
                            borderRadius: "8px",
                            color: "#fff",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}>
                        <Wand2 size={18}/>
                        Generate from DB
                    </button>
                    <button
                        onClick={addNewCube}
                        style={{
                            width: "100%",
                            padding: "12px",
                            backgroundColor: "#2a3942",
                            border: "none",
                            borderRadius: "8px",
                            color: "#e9edef",
                            fontSize: "14px",
                            fontWeight: "500",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                        }}>
                        <Plus size={18}/>
                        New Cube
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
            }}>
                {showTableSelector ? (
                    <div style={{
                        flex: 1,
                        padding: "32px",
                        overflowY: "auto",
                    }}>
                        <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginBottom: "24px",
                        }}>
                            <h2 style={{fontSize: "24px", fontWeight: "600", margin: 0}}>
                                Select a Table to Generate Cube
                            </h2>
                            <button
                                onClick={() => setShowTableSelector(false)}
                                style={{
                                    padding: "8px",
                                    backgroundColor: "#2a3942",
                                    border: "none",
                                    borderRadius: "6px",
                                    color: "#e9edef",
                                    cursor: "pointer",
                                }}
                            >
                                <X size={20}/>
                            </button>
                        </div>
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                            gap: "16px",
                        }}>
                            {allTables.map(table => (
                                <div
                                    key={table.id}
                                    onClick={() => generateCubeFromTable(table)}
                                    style={{
                                        padding: "20px",
                                        backgroundColor: "#1f2c33",
                                        borderRadius: "12px",
                                        border: "1px solid #2a2f32",
                                        cursor: "pointer",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.borderColor = "#00a884";
                                        e.currentTarget.style.transform = "translateY(-2px)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.borderColor = "#2a2f32";
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    <div style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "12px",
                                        marginBottom: "12px",
                                    }}>
                                        <Table size={20} color="#00a884"/>
                                        <div style={{fontSize: "18px", fontWeight: "500"}}>
                                            {table.name}
                                        </div>
                                    </div>
                                    <div style={{
                                        fontSize: "13px",
                                        color: "#8696a0",
                                        marginBottom: "12px",
                                        fontFamily: "monospace",
                                    }}>
                                        {table.id}
                                    </div>
                                    <div style={{
                                        display: "flex",
                                        flexWrap: "wrap",
                                        gap: "8px",
                                    }}>
                    <span style={{
                        padding: "4px 10px",
                        backgroundColor: "#2a3942",
                        borderRadius: "12px",
                        fontSize: "11px",
                    }}>
                      {table.columns.length} columns
                    </span>
                                        <span style={{
                                            padding: "4px 10px",
                                            backgroundColor: "#2a3942",
                                            borderRadius: "12px",
                                            fontSize: "11px",
                                        }}>
                      {table.relations.length} relations
                    </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : cube ? (
                    <>
                        <div style={{
                            padding: "24px 32px",
                            backgroundColor: "#1f2c33",
                            borderBottom: "1px solid #2a2f32",
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                marginBottom: "12px",
                            }}>
                                <input
                                    type="text"
                                    value={cube.title || cube.name}
                                    onChange={(e) => updateCube({title: e.target.value})}
                                    style={{
                                        fontSize: "24px",
                                        fontWeight: "600",
                                        backgroundColor: "transparent",
                                        border: "none",
                                        outline: "none",
                                        color: "#e9edef",
                                        width: "60%",
                                    }}
                                />
                                <div style={{display: "flex", gap: "8px"}}>
                            <button
                                onClick={async () => {
                                    if (cube) {
                                        try {
                                            await cubeService.createCube(cube);
                                            //alert("Cube saved successfully!");
                                        } catch (err) {
                                            alert(`Failed to save cube: ${err}`);
                                        }
                                    }
                                }}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#2a3942",
                                    border: "none",
                                    borderRadius: "6px",
                                    color: "#e9edef",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}>
                                <Save size={14}/>
                                Save
                            </button>
                            <button
                                onClick={async () => {
                                    if (cube) {
                                        try {
                                            await cubeService.deployCube(cube);
                                            alert("Cube deployed successfully!");
                                        } catch (err) {
                                            alert(`Failed to deploy cube: ${err}`);
                                        }
                                    }
                                }}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#00a884",
                                    border: "none",
                                    borderRadius: "6px",
                                    color: "#fff",
                                    fontSize: "13px",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "6px",
                                }}>
                                <Wand2 size={14}/>
                                Deploy
                            </button>
                        </div>
                            </div>
                            <input
                                type="text"
                                value={cube.description || ""}
                                onChange={(e) => updateCube({description: e.target.value})}
                                placeholder="Description..."
                                style={{
                                    fontSize: "14px",
                                    color: "#8696a0",
                                    backgroundColor: "transparent",
                                    border: "none",
                                    outline: "none",
                                    width: "100%",
                                    marginBottom: "12px",
                                }}
                            />
                            <Autocomplete
                                value={cube.table}
                                options={allTables.map(t => t.id)}
                                onChange={(v: any) => updateCube({table: v})}
                                placeholder="schema.table"
                                style={{
                                    width: "100%",
                                    padding: "8px 12px",
                                    backgroundColor: "#0b141a",
                                    border: "1px solid #2a2f32",
                                    borderRadius: "6px",
                                    fontSize: "13px",
                                    fontFamily: "monospace",
                                    color: "#00a884",
                                    outline: "none",
                                }}
                            />
                        </div>

                        <div style={{
                            flex: 1,
                            overflowY: "auto",
                            padding: "24px 32px",
                        }}>
                            <Section
                                title="Measures"
                                icon={<BarChart3 size={18}/>}
                                count={cube.measures?.length || 0}
                                expanded={expandedSections.measures}
                                onToggle={() => toggleSection("measures")}
                                onAdd={addMeasure}
                            >
                                {cube.measures?.map((measure, idx) => (
                                    <MeasureCard
                                        key={idx}
                                        measure={measure}
                                        availableColumns={availableColumns}
                                        isEditing={editingItem?.type === "measure" && editingItem?.index === idx}
                                        onEdit={() => setEditingItem({type: "measure", index: idx})}
                                        onSave={() => setEditingItem(null)}
                                        onDelete={() => deleteMeasure(idx)}
                                        onChange={(updates: Partial<MeasureDescriptor>) => updateMeasure(idx, updates)}
                                    />
                                ))}
                            </Section>

                            <Section
                                title="Dimensions"
                                icon={<Filter size={18}/>}
                                count={cube.dimensions?.length || 0}
                                expanded={expandedSections.dimensions}
                                onToggle={() => toggleSection("dimensions")}
                                onAdd={addDimension}
                            >
                                {cube.dimensions?.map((dimension, idx) => (
                                    <DimensionCard
                                        key={idx}
                                        dimension={dimension}
                                        availableColumns={availableColumns}
                                        isEditing={editingItem?.type === "dimension" && editingItem?.index === idx}
                                        onEdit={() => setEditingItem({type: "dimension", index: idx})}
                                        onSave={() => setEditingItem(null)}
                                        onDelete={() => deleteDimension(idx)}
                                        onChange={(updates: Partial<DimensionDescriptor>) => updateDimension(idx, updates)}
                                    />
                                ))}
                            </Section>

                            <Section
                                title="Joins"
                                icon={<Link size={18}/>}
                                count={cube.joins?.length || 0}
                                expanded={expandedSections.joins}
                                onToggle={() => toggleSection("joins")}
                                onAdd={addJoin}
                            >
                                {cube.joins?.map((join, idx) => (
                                    <JoinCard
                                        key={idx}
                                        join={join}
                                        availableRelations={availableRelations}
                                        otherCubes={otherCubes}
                                        cubeTable={cubeTable}
                                        isEditing={editingItem?.type === "join" && editingItem?.index === idx}
                                        onEdit={() => setEditingItem({type: "join", index: idx})}
                                        onSave={() => setEditingItem(null)}
                                        onDelete={() => deleteJoin(idx)}
                                        onChange={(updates: Partial<JoinDescriptor>) => updateJoin(idx, updates)}
                                    />
                                ))}
                            </Section>

                            <Section
                                title="Segments"
                                icon={<Tag size={18}/>}
                                count={cube.segments?.length || 0}
                                expanded={expandedSections.segments}
                                onToggle={() => toggleSection("segments")}
                                onAdd={addSegment}
                            >
                                {cube.segments?.map((segment, idx) => (
                                    <SegmentCard
                                        key={idx}
                                        segment={segment}
                                        availableColumns={availableColumns}
                                        isEditing={editingItem?.type === "segment" && editingItem?.index === idx}
                                        onEdit={() => setEditingItem({type: "segment", index: idx})}
                                        onSave={() => setEditingItem(null)}
                                        onDelete={() => deleteSegment(idx)}
                                        onChange={(updates: Partial<SegmentDescriptor>) => updateSegment(idx, updates)}
                                    />
                                ))}
                            </Section>
                        </div>
                    </>
                ) : (
                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexDirection: "column",
                        gap: "16px",
                        color: "#8696a0",
                    }}>
                        <Database size={64}/>
                        <div style={{fontSize: "18px"}}>Select a cube to configure</div>
                        <div style={{fontSize: "14px"}}>or generate one from your database</div>
                    </div>
                )}
            </div>
        </div>
    );
}

function Section({title, icon, count, expanded, onToggle, onAdd, children}: any) {
    return (
        <div style={{
            marginBottom: "24px",
            backgroundColor: "#1f2c33",
            borderRadius: "12px",
            border: "1px solid #2a2f32",
            overflow: "hidden",
        }}>
            <div
                onClick={onToggle}
                style={{
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    borderBottom: expanded ? "1px solid #2a2f32" : "none",
                }}
            >
                <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                }}>
                    {icon}
                    <div>
                        <div style={{fontSize: "16px", fontWeight: "500"}}>
                            {title}
                        </div>
                        <div style={{fontSize: "12px", color: "#8696a0"}}>
                            {count} {count === 1 ? 'item' : 'items'}
                        </div>
                    </div>
                </div>
                <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAdd();
                        }}
                        style={{
                            padding: "6px 12px",
                            backgroundColor: "#00a884",
                            border: "none",
                            borderRadius: "6px",
                            color: "#fff",
                            fontSize: "12px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                        }}
                    >
                        <Plus size={14}/>
                        Add
                    </button>
                    {expanded ? <ChevronDown size={20}/> : <ChevronRight size={20}/>}
                </div>
            </div>
            {expanded && (
                <div style={{padding: "16px"}}>
                    {children}
                </div>
            )}
        </div>
    );
}

function MeasureCard({measure, availableColumns, isEditing, onEdit, onSave, onDelete, onChange}: any) {
    const numericColumns = availableColumns.filter((c: ColumnDescriptor) =>
        c.semantic_type === "number" && !c.is_primary_key
    );

    return (
        <div style={{
            padding: "12px 16px",
            backgroundColor: "#2a3942",
            borderRadius: "8px",
            marginBottom: "8px",
            border: isEditing ? "1px solid #00a884" : "1px solid #3b4a54",
        }}>
            {isEditing ? (
                <div>
                    <Input label="Name" value={measure.name} onChange={(v: string) => onChange({name: v})}/>
                    <Input label="Title" value={measure.title || ""} onChange={(v: string) => onChange({title: v})}/>
                    <Select
                        label="Type"
                        value={measure.type}
                        options={["count", "countDistinct", "sum", "avg", "min", "max"]}
                        onChange={(v: string) => onChange({type: v})}
                    />
                    {measure.type !== "count" && (
                        <Autocomplete
                            label="Column"
                            value={measure.column || ""}
                            options={numericColumns.map((c: ColumnDescriptor) => c.name)}
                            onChange={(v: string) => onChange({column: v})}
                            placeholder="Select column..."
                        />
                    )}
                    <Input label="Expression (SQL)" value={measure.expression || ""}
                           onChange={(v: string) => onChange({expression: v})}/>
                    <Input label="Description" value={measure.description || ""}
                           onChange={(v: string) => onChange({description: v})}/>
                    <div style={{display: "flex", gap: "8px", marginTop: "12px"}}>
                        <button onClick={onSave} style={btnStyle("#00a884")}>
                            <Save size={14}/> Save
                        </button>
                        <button onClick={onDelete} style={btnStyle("#ea4335")}>
                            <Trash2 size={14}/> Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "8px",
                    }}>
                        <div>
                            <div style={{fontSize: "15px", fontWeight: "500"}}>
                                {measure.title || measure.name}
                            </div>
                            <div style={{fontSize: "12px", color: "#8696a0", fontFamily: "monospace"}}>
                                {measure.name}
                            </div>
                        </div>
                        <button onClick={onEdit} style={{
                            padding: "4px 8px",
                            backgroundColor: "#3b4a54",
                            border: "none",
                            borderRadius: "4px",
                            color: "#e9edef",
                            cursor: "pointer",
                        }}>
                            <Edit2 size={12}/>
                        </button>
                    </div>
                    <div style={{display: "flex", gap: "8px", flexWrap: "wrap"}}>
                        <span style={tagStyle("#00a884")}>{measure.type}</span>
                        {measure.column && <span style={tagStyle("#005c4b")}>{measure.column}</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

function DimensionCard({dimension, availableColumns, isEditing, onEdit, onSave, onDelete, onChange}: any) {
    return (
        <div style={{
            padding: "12px 16px",
            backgroundColor: "#2a3942",
            borderRadius: "8px",
            marginBottom: "8px",
            border: isEditing ? "1px solid #00a884" : "1px solid #3b4a54",
        }}>
            {isEditing ? (
                <div>
                    <Input label="Name" value={dimension.name} onChange={(v: string) => onChange({name: v})}/>
                    <Input label="Title" value={dimension.title || ""} onChange={(v: string) => onChange({title: v})}/>
                    <Autocomplete
                        label="Column"
                        value={dimension.column}
                        options={availableColumns.map((c: ColumnDescriptor) => c.name)}
                        onChange={(v: string) => {
                            const col = availableColumns.find((c: ColumnDescriptor) => c.name === v);
                            onChange({
                                column: v,
                                type: col?.semanticType || dimension.type,
                                primaryKey: col?.isPrimaryKey || false
                            });
                        }}
                        placeholder="Select column..."
                    />
                    <Select
                        label="Type"
                        value={dimension.type}
                        options={["string", "number", "time", "boolean"]}
                        onChange={(v: string) => onChange({type: v})}
                    />
                    <Input label="Description" value={dimension.description || ""}
                           onChange={(v: string) => onChange({description: v})}/>
                    <Checkbox
                        label="Primary Key"
                        checked={dimension.primaryKey || false}
                        onChange={(v: boolean) => onChange({primaryKey: v})}
                    />
                    <div style={{display: "flex", gap: "8px", marginTop: "12px"}}>
                        <button onClick={onSave} style={btnStyle("#00a884")}>
                            <Save size={14}/> Save
                        </button>
                        <button onClick={onDelete} style={btnStyle("#ea4335")}>
                            <Trash2 size={14}/> Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "8px",
                    }}>
                        <div>
                            <div style={{fontSize: "15px", fontWeight: "500"}}>
                                {dimension.title || dimension.name}
                            </div>
                            <div style={{fontSize: "12px", color: "#8696a0", fontFamily: "monospace"}}>
                                {dimension.name}
                            </div>
                        </div>
                        <button onClick={onEdit} style={{
                            padding: "4px 8px",
                            backgroundColor: "#3b4a54",
                            border: "none",
                            borderRadius: "4px",
                            color: "#e9edef",
                            cursor: "pointer",
                        }}>
                            <Edit2 size={12}/>
                        </button>
                    </div>
                    <div style={{display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center"}}>
                        <span style={tagStyle("#4a90e2")}>{dimension.type}</span>
                        <span style={tagStyle("#005c4b")}>{dimension.column}</span>
                        {dimension.primaryKey && <span style={tagStyle("#8b5cf6")}>PRIMARY KEY</span>}
                    </div>
                </div>
            )}
        </div>
    );
}

function JoinCard({
                      join,
                      availableRelations,
                      otherCubes,
                      cubeTable,
                      isEditing,
                      onEdit,
                      onSave,
                      onDelete,
                      onChange
                  }: any) {
    const suggestJoinFromRelation = (relName: string) => {
        const rel = availableRelations.find((r: RelationDescriptor) => r.other_table.includes(relName));
        if (rel && cubeTable) {
            const relationship: JoinRelationship =
                rel.direction === "left"
                    ? (rel.mapping.leftCardinality === "many" ? "belongsTo" : "hasOne")
                    : "hasMany";

            // @ts-ignore
            // @ts-ignore
            const joinCondition = rel.mapping.columnPairs
                // @ts-ignore
                .map(([left, right]) => `${cubeTable.id}.${left} = ${rel.otherTable}.${right}`)
                .join(" AND ");

            onChange({
                name: relName,
                relationship,
                on: joinCondition
            });
        }
    };

    return (
        <div style={{
            padding: "12px 16px",
            backgroundColor: "#2a3942",
            borderRadius: "8px",
            marginBottom: "8px",
            border: isEditing ? "1px solid #00a884" : "1px solid #3b4a54",
        }}>
            {isEditing ? (
                <div>
                    <Autocomplete
                        label="Target Cube"
                        value={join.name}
                        options={[...otherCubes.map((c: CubeDescriptor) => c.name), ...availableRelations.map((r: RelationDescriptor) => r.other_table.split('.')[1])]}
                        onChange={(v: string) => {
                            suggestJoinFromRelation(v);
                        }}
                        placeholder="Select cube to join..."
                    />
                    <Select
                        label="Relationship"
                        value={join.relationship}
                        options={["belongsTo", "hasMany", "hasOne"]}
                        onChange={(v: string) => onChange({relationship: v})}
                    />
                    <Input label="Join Condition (SQL)" value={join.on} onChange={(v: string) => onChange({on: v})}/>
                    <Input label="Relation Mapping ID" value={join.relationMappingId || ""}
                           onChange={(v: string) => onChange({relationMappingId: v})}/>
                    <div style={{display: "flex", gap: "8px", marginTop: "12px"}}>
                        <button onClick={onSave} style={btnStyle("#00a884")}>
                            <Save size={14}/> Save
                        </button>
                        <button onClick={onDelete} style={btnStyle("#ea4335")}>
                            <Trash2 size={14}/> Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "8px",
                    }}>
                        <div>
                            <div style={{fontSize: "15px", fontWeight: "500"}}>
                                {join.name}
                            </div>
                            <div
                                style={{fontSize: "12px", color: "#8696a0", fontFamily: "monospace", marginTop: "4px"}}>
                                {join.on}
                            </div>
                        </div>
                        <button onClick={onEdit} style={{
                            padding: "4px 8px",
                            backgroundColor: "#3b4a54",
                            border: "none",
                            borderRadius: "4px",
                            color: "#e9edef",
                            cursor: "pointer",
                        }}>
                            <Edit2 size={12}/>
                        </button>
                    </div>
                    <span style={tagStyle("#f59e0b")}>{join.relationship}</span>
                </div>
            )}
        </div>
    );
}

function SegmentCard({segment, availableColumns, isEditing, onEdit, onSave, onDelete, onChange}: any) {
    return (
        <div style={{
            padding: "12px 16px",
            backgroundColor: "#2a3942",
            borderRadius: "8px",
            marginBottom: "8px",
            border: isEditing ? "1px solid #00a884" : "1px solid #3b4a54",
        }}>
            {isEditing ? (
                <div>
                    <Input label="Name" value={segment.name} onChange={(v: string) => onChange({name: v})}/>
                    <Input label="Title" value={segment.title || ""} onChange={(v: string) => onChange({title: v})}/>
                    <Input label="Expression (SQL)" value={segment.expression}
                           onChange={(v: string) => onChange({expression: v})}/>
                    <Input label="Description" value={segment.description || ""}
                           onChange={(v: string) => onChange({description: v})}/>
                    {availableColumns.length > 0 && (
                        <div style={{
                            marginTop: "8px",
                            padding: "8px",
                            backgroundColor: "#1f2c33",
                            borderRadius: "4px",
                            fontSize: "11px",
                            color: "#8696a0"
                        }}>
                            Available columns: {availableColumns.map((c: ColumnDescriptor) => c.name).join(", ")}
                        </div>
                    )}
                    <div style={{display: "flex", gap: "8px", marginTop: "12px"}}>
                        <button onClick={onSave} style={btnStyle("#00a884")}>
                            <Save size={14}/> Save
                        </button>
                        <button onClick={onDelete} style={btnStyle("#ea4335")}>
                            <Trash2 size={14}/> Delete
                        </button>
                    </div>
                </div>
            ) : (
                <div>
                    <div style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "8px",
                    }}>
                        <div>
                            <div style={{fontSize: "15px", fontWeight: "500"}}>
                                {segment.title || segment.name}
                            </div>
                            <div
                                style={{fontSize: "12px", color: "#8696a0", fontFamily: "monospace", marginTop: "4px"}}>
                                {segment.expression}
                            </div>
                        </div>
                        <button onClick={onEdit} style={{
                            padding: "4px 8px",
                            backgroundColor: "#3b4a54",
                            border: "none",
                            borderRadius: "4px",
                            color: "#e9edef",
                            cursor: "pointer",
                        }}>
                            <Edit2 size={12}/>
                        </button>
                    </div>
                    <span style={tagStyle("#10b981")}>segment</span>
                </div>
            )}
        </div>
    );
}

// Helper Components
function Input({label, value, onChange}: any) {
    return (
        <div style={{marginBottom: "12px"}}>
            <label style={{display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "4px"}}>
                {label}
            </label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#1f2c33",
                    border: "1px solid #3b4a54",
                    borderRadius: "6px",
                    color: "#e9edef",
                    fontSize: "13px",
                    outline: "none",
                }}
            />
        </div>
    );
}

function Select({label, value, options, onChange}: any) {
    return (
        <div style={{marginBottom: "12px"}}>
            <label style={{display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "4px"}}>
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#1f2c33",
                    border: "1px solid #3b4a54",
                    borderRadius: "6px",
                    color: "#e9edef",
                    fontSize: "13px",
                    outline: "none",
                    cursor: "pointer",
                }}
            >
                {options.map((opt: string) => (
                    <option key={opt} value={opt}>{opt}</option>
                ))}
            </select>
        </div>
    );
}

function Autocomplete({label, value, options, onChange, placeholder, style}: any) {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [filteredOptions, setFilteredOptions] = useState<string[]>([]);

    const handleChange = (val: string) => {
        onChange(val);
        if (val) {
            const filtered = options.filter((opt: string) =>
                opt.toLowerCase().includes(val.toLowerCase())
            );
            setFilteredOptions(filtered);
            setShowSuggestions(filtered.length > 0);
        } else {
            setFilteredOptions(options);
            setShowSuggestions(false);
        }
    };

    const handleFocus = () => {
        setFilteredOptions(options);
        setShowSuggestions(options.length > 0);
    };

    return (
        <div style={{marginBottom: label ? "12px" : 0, position: "relative"}}>
            {label && (
                <label style={{display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "4px"}}>
                    {label}
                </label>
            )}
            <input
                type="text"
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onFocus={handleFocus}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                placeholder={placeholder}
                style={style || {
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#1f2c33",
                    border: "1px solid #3b4a54",
                    borderRadius: "6px",
                    color: "#e9edef",
                    fontSize: "13px",
                    outline: "none",
                }}
            />
            {showSuggestions && filteredOptions.length > 0 && (
                <div style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "#1f2c33",
                    border: "1px solid #3b4a54",
                    borderRadius: "6px",
                    marginTop: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                }}>
                    {filteredOptions.map((opt: string) => (
                        <div
                            key={opt}
                            onClick={() => {
                                onChange(opt);
                                setShowSuggestions(false);
                            }}
                            style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                fontSize: "13px",
                                color: "#e9edef",
                                borderBottom: "1px solid #2a2f32",
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = "#2a3942";
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = "transparent";
                            }}
                        >
                            {opt}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function Checkbox({label, checked, onChange}: any) {
    return (
        <div style={{marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px"}}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                style={{cursor: "pointer"}}
            />
            <label style={{fontSize: "13px", color: "#e9edef", cursor: "pointer"}}>
                {label}
            </label>
        </div>
    );
}

function btnStyle(bg: string) {
    return {
        padding: "8px 16px",
        backgroundColor: bg,
        border: "none",
        borderRadius: "6px",
        color: "#fff",
        fontSize: "13px",
        fontWeight: "500" as const,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    };
}

function tagStyle(bg: string) {
    return {
        padding: "4px 10px",
        backgroundColor: bg,
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "500" as const,
        fontFamily: bg.includes("#005c4b") ? "monospace" : "inherit",
    };
}