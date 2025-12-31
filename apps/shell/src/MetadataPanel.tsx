import React, { useState } from "react";
import { Plus, Search, Database, Layers, Filter, Link, BarChart3, X, Edit2, Save, Trash2, ChevronRight, ChevronDown, Tag } from "lucide-react";

// Type definitions
type MeasureType = "count" | "countDistinct" | "sum" | "avg" | "min" | "max";
type DimensionType = "string" | "number" | "time" | "boolean";
type JoinRelationship = "belongsTo" | "hasMany" | "hasOne";
type TimeGranularity = "second" | "minute" | "hour" | "day" | "week" | "month" | "quarter" | "year";

interface MeasureDescriptor {
  name: string;
  type: MeasureType;
  column?: string;
  expression?: string;
  title?: string;
  description?: string;
  filters?: Record<string, string | number | boolean>;
}

interface DimensionDescriptor {
  name: string;
  column: string;
  type: DimensionType;
  primaryKey?: boolean;
  granularities?: TimeGranularity[];
  title?: string;
  description?: string;
}

interface SegmentDescriptor {
  name: string;
  expression: string;
  title?: string;
  description?: string;
}

interface JoinDescriptor {
  name: string;
  relationship: JoinRelationship;
  on: string;
  relationMappingId?: string;
}

interface CubeDescriptor {
  name: string;
  table: string;
  sql?: string;
  measures?: MeasureDescriptor[];
  dimensions?: DimensionDescriptor[];
  segments?: SegmentDescriptor[];
  joins?: JoinDescriptor[];
  title?: string;
  description?: string;
}

export default function CubeConfigurator() {
  const [cubes, setCubes] = useState<CubeDescriptor[]>([
    {
      name: "orders",
      table: "public.orders",
      title: "Orders",
      description: "Customer orders and transactions",
      measures: [
        { name: "count", type: "count", title: "Total Orders" },
        { name: "totalAmount", type: "sum", column: "amount", title: "Total Revenue" },
      ],
      dimensions: [
        { name: "id", column: "id", type: "number", primaryKey: true },
        { name: "status", column: "status", type: "string" },
        { name: "createdAt", column: "created_at", type: "time" },
      ],
      joins: [
        { name: "customers", relationship: "belongsTo", on: "orders.customer_id = customers.id" },
      ],
      segments: [
        { name: "completed", expression: "status = 'completed'", title: "Completed Orders" },
      ],
    },
  ]);

  const [selectedCube, setSelectedCube] = useState<string | null>("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    measures: true,
    dimensions: true,
    joins: false,
    segments: false,
  });
  const [editingItem, setEditingItem] = useState<{ type: string; index: number } | null>(null);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const cube = cubes.find(c => c.name === selectedCube);

  const updateCube = (updates: Partial<CubeDescriptor>) => {
    setCubes(cubes.map(c => c.name === selectedCube ? { ...c, ...updates } : c));
  };

  const addMeasure = () => {
    if (!cube) return;
    const newMeasure: MeasureDescriptor = {
      name: "newMeasure",
      type: "count",
      title: "New Measure",
    };
    updateCube({ measures: [...(cube.measures || []), newMeasure] });
  };

  const updateMeasure = (index: number, updates: Partial<MeasureDescriptor>) => {
    if (!cube) return;
    const measures = [...(cube.measures || [])];
    measures[index] = { ...measures[index], ...updates };
    updateCube({ measures });
  };

  const deleteMeasure = (index: number) => {
    if (!cube) return;
    const measures = [...(cube.measures || [])];
    measures.splice(index, 1);
    updateCube({ measures });
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
    updateCube({ dimensions: [...(cube.dimensions || []), newDimension] });
  };

  const updateDimension = (index: number, updates: Partial<DimensionDescriptor>) => {
    if (!cube) return;
    const dimensions = [...(cube.dimensions || [])];
    dimensions[index] = { ...dimensions[index], ...updates };
    updateCube({ dimensions });
  };

  const deleteDimension = (index: number) => {
    if (!cube) return;
    const dimensions = [...(cube.dimensions || [])];
    dimensions.splice(index, 1);
    updateCube({ dimensions });
    setEditingItem(null);
  };

  const addJoin = () => {
    if (!cube) return;
    const newJoin: JoinDescriptor = {
      name: "newJoin",
      relationship: "belongsTo",
      on: "table.id = other.id",
    };
    updateCube({ joins: [...(cube.joins || []), newJoin] });
  };

  const updateJoin = (index: number, updates: Partial<JoinDescriptor>) => {
    if (!cube) return;
    const joins = [...(cube.joins || [])];
    joins[index] = { ...joins[index], ...updates };
    updateCube({ joins });
  };

  const deleteJoin = (index: number) => {
    if (!cube) return;
    const joins = [...(cube.joins || [])];
    joins.splice(index, 1);
    updateCube({ joins });
    setEditingItem(null);
  };

  const addSegment = () => {
    if (!cube) return;
    const newSegment: SegmentDescriptor = {
      name: "newSegment",
      expression: "column = 'value'",
      title: "New Segment",
    };
    updateCube({ segments: [...(cube.segments || []), newSegment] });
  };

  const updateSegment = (index: number, updates: Partial<SegmentDescriptor>) => {
    if (!cube) return;
    const segments = [...(cube.segments || [])];
    segments[index] = { ...segments[index], ...updates };
    updateCube({ segments });
  };

  const deleteSegment = (index: number) => {
    if (!cube) return;
    const segments = [...(cube.segments || [])];
    segments.splice(index, 1);
    updateCube({ segments });
    setEditingItem(null);
  };

  const addNewCube = () => {
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
    setCubes([...cubes, newCube]);
    setSelectedCube(newCube.name);
  };

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
            <Database size={24} color="#00a884" />
            <h1 style={{ fontSize: "20px", fontWeight: "600", margin: 0 }}>
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
            <Search size={18} color="#8696a0" />
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
                <Layers size={18} color={selectedCube === c.name ? "#00a884" : "#8696a0"} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "15px", fontWeight: "500" }}>
                    {c.title || c.name}
                  </div>
                  <div style={{ fontSize: "12px", color: "#8696a0" }}>
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
        }}>
          <button
            onClick={addNewCube}
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
            <Plus size={18} />
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
        {cube ? (
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
                  onChange={(e) => updateCube({ title: e.target.value })}
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
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{
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
                    <Save size={14} />
                    Save
                  </button>
                </div>
              </div>
              <input
                type="text"
                value={cube.description || ""}
                onChange={(e) => updateCube({ description: e.target.value })}
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
              <input
                type="text"
                value={cube.table}
                onChange={(e) => updateCube({ table: e.target.value })}
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
                icon={<BarChart3 size={18} />}
                count={cube.measures?.length || 0}
                expanded={expandedSections.measures}
                onToggle={() => toggleSection("measures")}
                onAdd={addMeasure}
              >
                {cube.measures?.map((measure, idx) => (
                  <MeasureCard
                    key={idx}
                    measure={measure}
                    isEditing={editingItem?.type === "measure" && editingItem?.index === idx}
                    onEdit={() => setEditingItem({ type: "measure", index: idx })}
                    onSave={() => setEditingItem(null)}
                    onDelete={() => deleteMeasure(idx)}
                    onChange={(updates: Partial<MeasureDescriptor>) => updateMeasure(idx, updates)}
                  />
                ))}
              </Section>

              <Section
                title="Dimensions"
                icon={<Filter size={18} />}
                count={cube.dimensions?.length || 0}
                expanded={expandedSections.dimensions}
                onToggle={() => toggleSection("dimensions")}
                onAdd={addDimension}
              >
                {cube.dimensions?.map((dimension, idx) => (
                  <DimensionCard
                    key={idx}
                    dimension={dimension}
                    isEditing={editingItem?.type === "dimension" && editingItem?.index === idx}
                    onEdit={() => setEditingItem({ type: "dimension", index: idx })}
                    onSave={() => setEditingItem(null)}
                    onDelete={() => deleteDimension(idx)}
                    onChange={(updates: Partial<DimensionDescriptor>) => updateDimension(idx, updates)}
                  />
                ))}
              </Section>

              <Section
                title="Joins"
                icon={<Link size={18} />}
                count={cube.joins?.length || 0}
                expanded={expandedSections.joins}
                onToggle={() => toggleSection("joins")}
                onAdd={addJoin}
              >
                {cube.joins?.map((join, idx) => (
                  <JoinCard
                    key={idx}
                    join={join}
                    isEditing={editingItem?.type === "join" && editingItem?.index === idx}
                    onEdit={() => setEditingItem({ type: "join", index: idx })}
                    onSave={() => setEditingItem(null)}
                    onDelete={() => deleteJoin(idx)}
                    onChange={(updates: Partial<JoinDescriptor>) => updateJoin(idx, updates)}
                  />
                ))}
              </Section>

              <Section
                title="Segments"
                icon={<Tag size={18} />}
                count={cube.segments?.length || 0}
                expanded={expandedSections.segments}
                onToggle={() => toggleSection("segments")}
                onAdd={addSegment}
              >
                {cube.segments?.map((segment, idx) => (
                  <SegmentCard
                    key={idx}
                    segment={segment}
                    isEditing={editingItem?.type === "segment" && editingItem?.index === idx}
                    onEdit={() => setEditingItem({ type: "segment", index: idx })}
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
            <Database size={64} />
            <div style={{ fontSize: "18px" }}>Select a cube to configure</div>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, icon, count, expanded, onToggle, onAdd, children }: any) {
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
            <div style={{ fontSize: "16px", fontWeight: "500" }}>
              {title}
            </div>
            <div style={{ fontSize: "12px", color: "#8696a0" }}>
              {count} {count === 1 ? 'item' : 'items'}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
            <Plus size={14} />
            Add
          </button>
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
      </div>
      {expanded && (
        <div style={{ padding: "16px" }}>
          {children}
        </div>
      )}
    </div>
  );
}

function MeasureCard({ measure, isEditing, onEdit, onSave, onDelete, onChange }: any) {
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
          <Input label="Name" value={measure.name} onChange={(v: any) => onChange({ name: v })} />
          <Input label="Title" value={measure.title || ""} onChange={(v: any) => onChange({ title: v })} />
          <Select
            label="Type"
            value={measure.type}
            options={["count", "countDistinct", "sum", "avg", "min", "max"]}
            onChange={(v: any) => onChange({ type: v })}
          />
          <Input label="Column" value={measure.column || ""} onChange={(v: any) => onChange({ column: v })} />
          <Input label="Expression" value={measure.expression || ""} onChange={(v: any) => onChange({ expression: v })} />
          <Input label="Description" value={measure.description || ""} onChange={(v: any) => onChange({ description: v })} />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={onSave} style={btnStyle("#00a884")}>
              <Save size={14} /> Save
            </button>
            <button onClick={onDelete} style={btnStyle("#ea4335")}>
              <Trash2 size={14} /> Delete
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
              <div style={{ fontSize: "15px", fontWeight: "500" }}>
                {measure.title || measure.name}
              </div>
              <div style={{ fontSize: "12px", color: "#8696a0", fontFamily: "monospace" }}>
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
              <Edit2 size={12} />
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={tagStyle("#00a884")}>{measure.type}</span>
            {measure.column && <span style={tagStyle("#005c4b")}>{measure.column}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function DimensionCard({ dimension, isEditing, onEdit, onSave, onDelete, onChange }: any) {
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
          <Input label="Name" value={dimension.name} onChange={(v: any) => onChange({ name: v })} />
          <Input label="Title" value={dimension.title || ""} onChange={(v: any) => onChange({ title: v })} />
          <Input label="Column" value={dimension.column} onChange={(v: any) => onChange({ column: v })} />
          <Select
            label="Type"
            value={dimension.type}
            options={["string", "number", "time", "boolean"]}
            onChange={(v: any) => onChange({ type: v })}
          />
          <Input label="Description" value={dimension.description || ""} onChange={(v: any) => onChange({ description: v })} />
          <Checkbox
            label="Primary Key"
            checked={dimension.primaryKey || false}
            onChange={(v: any) => onChange({ primaryKey: v })}
          />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={onSave} style={btnStyle("#00a884")}>
              <Save size={14} /> Save
            </button>
            <button onClick={onDelete} style={btnStyle("#ea4335")}>
              <Trash2 size={14} /> Delete
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
              <div style={{ fontSize: "15px", fontWeight: "500" }}>
                {dimension.title || dimension.name}
              </div>
              <div style={{ fontSize: "12px", color: "#8696a0", fontFamily: "monospace" }}>
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
              <Edit2 size={12} />
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
            <span style={tagStyle("#4a90e2")}>{dimension.type}</span>
            <span style={tagStyle("#005c4b")}>{dimension.column}</span>
            {dimension.primaryKey && <span style={tagStyle("#8b5cf6")}>PRIMARY KEY</span>}
          </div>
        </div>
      )}
    </div>
  );
}

function JoinCard({ join, isEditing, onEdit, onSave, onDelete, onChange }: any) {
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
          <Input label="Name" value={join.name} onChange={(v: any) => onChange({ name: v })} />
          <Select
            label="Relationship"
            value={join.relationship}
            options={["belongsTo", "hasMany", "hasOne"]}
            onChange={(v: any) => onChange({ relationship: v })}
          />
          <Input label="On" value={join.on} onChange={(v: any) => onChange({ on: v })} />
          <Input label="Relation Mapping ID" value={join.relationMappingId || ""} onChange={(v: any) => onChange({ relationMappingId: v })} />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={onSave} style={btnStyle("#00a884")}>
              <Save size={14} /> Save
            </button>
            <button onClick={onDelete} style={btnStyle("#ea4335")}>
              <Trash2 size={14} /> Delete
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
              <div style={{ fontSize: "15px", fontWeight: "500" }}>
                {join.name}
              </div>
              <div style={{ fontSize: "12px", color: "#8696a0", fontFamily: "monospace", marginTop: "4px" }}>
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
              <Edit2 size={12} />
            </button>
          </div>
          <span style={tagStyle("#f59e0b")}>{join.relationship}</span>
        </div>
      )}
    </div>
  );
}

function SegmentCard({ segment, isEditing, onEdit, onSave, onDelete, onChange }: any) {
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
          <Input label="Name" value={segment.name} onChange={(v: any) => onChange({ name: v })} />
          <Input label="Title" value={segment.title || ""} onChange={(v: any) => onChange({ title: v })} />
          <Input label="Expression" value={segment.expression} onChange={(v: any) => onChange({ expression: v })} />
          <Input label="Description" value={segment.description || ""} onChange={(v: any) => onChange({ description: v })} />
          <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
            <button onClick={onSave} style={btnStyle("#00a884")}>
              <Save size={14} /> Save
            </button>
            <button onClick={onDelete} style={btnStyle("#ea4335")}>
              <Trash2 size={14} /> Delete
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
              <div style={{ fontSize: "15px", fontWeight: "500" }}>
                {segment.title || segment.name}
              </div>
              <div style={{ fontSize: "12px", color: "#8696a0", fontFamily: "monospace", marginTop: "4px" }}>
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
              <Edit2 size={12} />
            </button>
          </div>
          <span style={tagStyle("#10b981")}>segment</span>
        </div>
      )}
    </div>
  );
}

// Helper Components
function Input({ label, value, onChange }: any) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "4px" }}>
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

function Select({ label, value, options, onChange }: any) {
  return (
    <div style={{ marginBottom: "12px" }}>
      <label style={{ display: "block", fontSize: "12px", color: "#8696a0", marginBottom: "4px" }}>
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

function Checkbox({ label, checked, onChange }: any) {
  return (
    <div style={{ marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ cursor: "pointer" }}
      />
      <label style={{ fontSize: "13px", color: "#e9edef", cursor: "pointer" }}>
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