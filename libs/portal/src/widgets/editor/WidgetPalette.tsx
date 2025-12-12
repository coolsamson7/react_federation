import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { DND_ITEM } from "./dnd";
import { TypeRegistry } from "../type-registry";
import { getIcon } from "../icon-registry";

interface WidgetPaletteProps {
  typeRegistry: TypeRegistry;
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({ typeRegistry }) => {
  const descriptors = typeRegistry.getAllDescriptors();
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  // Group descriptors by their group property
  const groupedDescriptors = new Map<string, typeof descriptors>();
  descriptors.forEach((desc) => {
    const group = (desc as any).group || "other";
    if (!groupedDescriptors.has(group)) {
      groupedDescriptors.set(group, []);
    }
    groupedDescriptors.get(group)!.push(desc);
  });

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) {
        next.delete(group);
      } else {
        next.add(group);
      }
      return next;
    });
  };

  return (
    <div>
      {Array.from(groupedDescriptors.entries()).map(([group, items]) => {
        const isCollapsed = collapsedGroups.has(group);
        return (
          <div key={group} style={{ marginBottom: 1 }}>
            {/* Group Header */}
            <div
              onClick={() => toggleGroup(group)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                textTransform: "uppercase",
                color: "#888",
                letterSpacing: "0.5px",
                padding: "8px 12px",
                backgroundColor: "#0d0d0d",
                borderBottom: "1px solid #333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                userSelect: "none",
                marginBottom: isCollapsed ? 0 : 0,
              }}
            >
              <span>{group}</span>
              <span style={{ fontSize: 10, transition: "transform 0.2s ease", display: "inline-block" }}>
                {isCollapsed ? "▼" : "▲"}
              </span>
            </div>

            {/* Grid of widgets */}
            {!isCollapsed && (
              <div
                style={{
                  padding: "8px",
                  backgroundColor: "#1a1a1a",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: 4,
                  }}
                >
                  {items.map((desc) => (
                    <PaletteItem key={desc.name} name={desc.name} label={desc.label} icon={desc.icon} typeRegistry={typeRegistry} />
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const PaletteItem: React.FC<{ name: string; label: string; icon: string; typeRegistry: TypeRegistry }> = ({ name, label, icon, typeRegistry }) => {
  const [{ isDragging }, dragRef] = useDrag(() => {
    // Create widget once and reuse it during drag
    const widget = typeRegistry.create(name);
    return {
      type: DND_ITEM.WIDGET,
      item: { type: DND_ITEM.WIDGET, widget },
      collect: (monitor) => ({ isDragging: monitor.isDragging() }),
    };
  }, [name, typeRegistry]);

  return (
    <div
      ref={dragRef}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 4,
        border: "1px solid #333",
        borderRadius: 2,
        background: isDragging ? "#2a2a2a" : "#1a1a1a",
        color: "#e0e0e0",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: "all 0.2s ease",
        aspectRatio: "1",
        minHeight: 40,
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? "scale(0.95)" : "scale(1)",
      }}
      title={`Drag to add ${label}`}
      onMouseEnter={(e) => {
        if (!isDragging) {
          e.currentTarget.style.background = "#2a2a2a";
          e.currentTarget.style.borderColor = "#555";
        }
      }}
      onMouseLeave={(e) => {
        if (!isDragging) {
          e.currentTarget.style.background = "#1a1a1a";
          e.currentTarget.style.borderColor = "#333";
        }
      }}
    >
      <div style={{ marginBottom: 2, display: "flex", alignItems: "center", justifyContent: "center", color: "#e0e0e0", fontSize: 16 }}>{getIcon(icon)}</div>
      <div style={{ fontSize: 8, textAlign: "center", fontWeight: 500, lineHeight: 1.1 }}>
        {label}
      </div>
    </div>
  );
};
