import React, { useState } from "react";
import { Plus, Search, Database, Layers, Filter, Link, BarChart3, Calendar, ChevronRight, ChevronDown, X, Edit2, Save, Trash2 } from "lucide-react";
import {CubeDescriptor, DimensionDescriptor, JoinDescriptor, MeasureDescriptor} from "@portal/metadata/cube_metadata";

/* Types
type MeasureType = "count" | "countDistinct" | "sum" | "avg" | "min" | "max";
type DimensionType = "string" | "number" | "time" | "boolean";
type JoinRelationship = "belongsTo" | "hasMany" | "hasOne";

interface MeasureDescriptor {
  name: string;
  type: MeasureType;
  column?: string;
  expression?: string;
  title?: string;
  description?: string;
}

interface DimensionDescriptor {
  name: string;
  column: string;
  type: DimensionType;
  primaryKey?: boolean;
  title?: string;
  description?: string;
}

interface JoinDescriptor {
  name: string;
  relationship: JoinRelationship;
  on: string;
}

interface CubeDescriptor {
  name: string;
  table: string;
  sql?: string;
  measures?: MeasureDescriptor[];
  dimensions?: DimensionDescriptor[];
  joins?: JoinDescriptor[];
  title?: string;
  description?: string;
}*/

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
    },
  ]);

  const [selectedCube, setSelectedCube] = useState<string | null>("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    measures: true,
    dimensions: true,
    joins: false,
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const cube = cubes.find(c => c.name === selectedCube);

  const addMeasure = () => {
    if (!cube) return;
    const newMeasure: MeasureDescriptor = {
      name: "newMeasure",
      type: "count",
      title: "New Measure",
    };
    setCubes(cubes.map(c =>
      c.name === selectedCube
        ? { ...c, measures: [...(c.measures || []), newMeasure] }
        : c
    ));
  };

  const addDimension = () => {
    if (!cube) return;
    const newDimension: DimensionDescriptor = {
      name: "newDimension",
      column: "column_name",
      type: "string",
      title: "New Dimension",
    };
    setCubes(cubes.map(c =>
      c.name === selectedCube
        ? { ...c, dimensions: [...(c.dimensions || []), newDimension] }
        : c
    ));
  };

  const addJoin = () => {
    if (!cube) return;
    const newJoin: JoinDescriptor = {
      name: "newJoin",
      relationship: "belongsTo",
      on: "table.id = other.id",
    };
    setCubes(cubes.map(c =>
      c.name === selectedCube
        ? { ...c, joins: [...(c.joins || []), newJoin] }
        : c
    ));
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
        {/* Header */}
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

          {/* Search */}
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

        {/* Cube List */}
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
              onMouseEnter={(e) => {
                if (selectedCube !== c.name) {
                  e.currentTarget.style.backgroundColor = "#1f2c33";
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCube !== c.name) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
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

        {/* Add Cube Button */}
        <div style={{
          padding: "16px",
          borderTop: "1px solid #2a2f32",
        }}>
          <button style={{
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
            {/* Cube Header */}
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
                <h2 style={{ fontSize: "24px", fontWeight: "600", margin: 0 }}>
                  {cube.title || cube.name}
                </h2>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={{
                    padding: "8px 16px",
                    backgroundColor: "#2a3942",
                    border: "none",
                    borderRadius: "6px",
                    color: "#e9edef",
                    fontSize: "13px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}>
                    <Edit2 size={14} />
                    Edit
                  </button>
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
              <div style={{ fontSize: "14px", color: "#8696a0" }}>
                {cube.description}
              </div>
              <div style={{
                marginTop: "12px",
                padding: "8px 12px",
                backgroundColor: "#0b141a",
                borderRadius: "6px",
                fontSize: "13px",
                fontFamily: "monospace",
                color: "#00a884",
              }}>
                {cube.table}
              </div>
            </div>

            {/* Content Sections */}
            <div style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 32px",
            }}>
              {/* Measures Section */}
              <Section
                title="Measures"
                icon={<BarChart3 size={18} />}
                count={cube.measures?.length || 0}
                expanded={expandedSections.measures}
                onToggle={() => toggleSection("measures")}
                onAdd={addMeasure}
              >
                {cube.measures?.map((measure, idx) => (
                  <MeasureCard key={idx} measure={measure} />
                ))}
              </Section>

              {/* Dimensions Section */}
              <Section
                title="Dimensions"
                icon={<Filter size={18} />}
                count={cube.dimensions?.length || 0}
                expanded={expandedSections.dimensions}
                onToggle={() => toggleSection("dimensions")}
                onAdd={addDimension}
              >
                {cube.dimensions?.map((dimension, idx) => (
                  <DimensionCard key={idx} dimension={dimension} />
                ))}
              </Section>

              {/* Joins Section */}
              <Section
                title="Joins"
                icon={<Link size={18} />}
                count={cube.joins?.length || 0}
                expanded={expandedSections.joins}
                onToggle={() => toggleSection("joins")}
                onAdd={addJoin}
              >
                {cube.joins?.map((join, idx) => (
                  <JoinCard key={idx} join={join} />
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

function MeasureCard({ measure }: { measure: MeasureDescriptor }) {
  return (
    <div style={{
      padding: "12px 16px",
      backgroundColor: "#2a3942",
      borderRadius: "8px",
      marginBottom: "8px",
      border: "1px solid #3b4a54",
    }}>
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
          <div style={{
            fontSize: "12px",
            color: "#8696a0",
            fontFamily: "monospace",
          }}>
            {measure.name}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button style={{
            padding: "4px 8px",
            backgroundColor: "#3b4a54",
            border: "none",
            borderRadius: "4px",
            color: "#e9edef",
            cursor: "pointer",
          }}>
            <Edit2 size={12} />
          </button>
          <button style={{
            padding: "4px 8px",
            backgroundColor: "#3b4a54",
            border: "none",
            borderRadius: "4px",
            color: "#ea4335",
            cursor: "pointer",
          }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
      }}>
        <span style={{
          padding: "4px 10px",
          backgroundColor: "#00a884",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "500",
        }}>
          {measure.type}
        </span>
        {measure.column && (
          <span style={{
            padding: "4px 10px",
            backgroundColor: "#005c4b",
            borderRadius: "12px",
            fontSize: "11px",
            fontFamily: "monospace",
          }}>
            {measure.column}
          </span>
        )}
      </div>
    </div>
  );
}

function DimensionCard({ dimension }: { dimension: DimensionDescriptor }) {
  return (
    <div style={{
      padding: "12px 16px",
      backgroundColor: "#2a3942",
      borderRadius: "8px",
      marginBottom: "8px",
      border: "1px solid #3b4a54",
    }}>
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
          <div style={{
            fontSize: "12px",
            color: "#8696a0",
            fontFamily: "monospace",
          }}>
            {dimension.name}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button style={{
            padding: "4px 8px",
            backgroundColor: "#3b4a54",
            border: "none",
            borderRadius: "4px",
            color: "#e9edef",
            cursor: "pointer",
          }}>
            <Edit2 size={12} />
          </button>
          <button style={{
            padding: "4px 8px",
            backgroundColor: "#3b4a54",
            border: "none",
            borderRadius: "4px",
            color: "#ea4335",
            cursor: "pointer",
          }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <div style={{
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        alignItems: "center",
      }}>
        <span style={{
          padding: "4px 10px",
          backgroundColor: "#4a90e2",
          borderRadius: "12px",
          fontSize: "11px",
          fontWeight: "500",
        }}>
          {dimension.type}
        </span>
        <span style={{
          padding: "4px 10px",
          backgroundColor: "#005c4b",
          borderRadius: "12px",
          fontSize: "11px",
          fontFamily: "monospace",
        }}>
          {dimension.column}
        </span>
        {dimension.primaryKey && (
          <span style={{
            padding: "4px 10px",
            backgroundColor: "#8b5cf6",
            borderRadius: "12px",
            fontSize: "11px",
            fontWeight: "500",
          }}>
            PRIMARY KEY
          </span>
        )}
      </div>
    </div>
  );
}

function JoinCard({ join }: { join: JoinDescriptor }) {
  return (
    <div style={{
      padding: "12px 16px",
      backgroundColor: "#2a3942",
      borderRadius: "8px",
      marginBottom: "8px",
      border: "1px solid #3b4a54",
    }}>
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
          <div style={{
            fontSize: "12px",
            color: "#8696a0",
            fontFamily: "monospace",
            marginTop: "4px",
          }}>
            {join.on}
          </div>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button style={{
            padding: "4px 8px",
            backgroundColor: "#3b4a54",
            border: "none",
            borderRadius: "4px",
            color: "#e9edef",
            cursor: "pointer",
          }}>
            <Edit2 size={12} />
          </button>
          <button style={{
            padding: "4px 8px",
            backgroundColor: "#3b4a54",
            border: "none",
            borderRadius: "4px",
            color: "#ea4335",
            cursor: "pointer",
          }}>
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <span style={{
        padding: "4px 10px",
        backgroundColor: "#f59e0b",
        borderRadius: "12px",
        fontSize: "11px",
        fontWeight: "500",
      }}>
        {join.relationship}
      </span>
    </div>
  );
}