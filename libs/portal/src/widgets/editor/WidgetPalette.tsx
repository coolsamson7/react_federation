import React from "react";
import { useDrag } from "react-dnd";
import { DND_ITEM } from "./dnd";
import { TypeRegistry } from "../type-registry";
import { getIcon } from "../icon-registry";

interface WidgetPaletteProps {
  typeRegistry: TypeRegistry;
}

export const WidgetPalette: React.FC<WidgetPaletteProps> = ({ typeRegistry }) => {
  const descriptors = typeRegistry.getAllDescriptors();

  // Group descriptors by their group property
  const groupedDescriptors = new Map<string, typeof descriptors>();
  descriptors.forEach((desc) => {
    const group = (desc as any).group || "other";
    if (!groupedDescriptors.has(group)) {
      groupedDescriptors.set(group, []);
    }
    groupedDescriptors.get(group)!.push(desc);
  });

  return (
    <div>
      <div style={{ fontWeight: 600, marginBottom: 16, color: "#e0e0e0", fontSize: 16 }}>Widget Palette</div>

      {Array.from(groupedDescriptors.entries()).map(([group, items]) => (
        <div key={group} style={{ marginBottom: 24 }}>
          {/* Group Header */}
          <div
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              color: "#888",
              marginBottom: 12,
              letterSpacing: "0.5px",
            }}
          >
            {group}
          </div>

          {/* Grid of widgets */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 8,
            }}
          >
            {items.map((desc) => (
              <PaletteItem key={desc.name} name={desc.name} label={desc.label} icon={desc.icon} typeRegistry={typeRegistry} />
            ))}
          </div>
        </div>
      ))}
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
        padding: 12,
        border: "1px solid #333",
        borderRadius: 8,
        background: isDragging ? "#2a2a2a" : "#1a1a1a",
        color: "#e0e0e0",
        cursor: isDragging ? "grabbing" : "grab",
        userSelect: "none",
        transition: "all 0.2s ease",
        aspectRatio: "1",
        minHeight: 80,
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
      <div style={{ marginBottom: 8, display: "flex", alignItems: "center", justifyContent: "center", color: "#e0e0e0" }}>{getIcon(icon)}</div>
      <div style={{ fontSize: 11, textAlign: "center", fontWeight: 500, lineHeight: 1.3 }}>
        {label}
      </div>
    </div>
  );
};
