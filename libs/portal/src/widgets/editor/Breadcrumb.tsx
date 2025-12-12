import React from "react";
import { WidgetData } from "../metadata";
import { TypeRegistry } from "../type-registry";
import { getIcon } from "../icon-registry";

interface BreadcrumbProps {
  root: WidgetData;
  selectedId: string | null;
  typeRegistry: TypeRegistry;
  onSelect: (widgetId: string) => void;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  root,
  selectedId,
  typeRegistry,
  onSelect,
}) => {
  // Build path from root to selected widget
  const buildPath = (widget: WidgetData, targetId: string, path: WidgetData[] = []): WidgetData[] | null => {
    path.push(widget);

    if (widget.id === targetId) {
      return path;
    }

    for (const child of widget.children) {
      const result = buildPath(child, targetId, [...path]);
      if (result) return result;
    }

    return null;
  };

  let path: WidgetData[] | null = null;

  if (selectedId) {
    path = buildPath(root, selectedId);
  }

  // If no selection or path not found, show root only
  if (!path) {
    path = [root];
  }

  console.log("[Breadcrumb] Rendering with path:", path.map(w => w.type));

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "4px",
        padding: "6px 12px",
        backgroundColor: "#0d0d0d",
        borderTop: "1px solid #333",
        fontSize: 10,
        color: "#a0a0a0",
        overflow: "auto",
        whiteSpace: "nowrap",
        width: "100%",
        flexShrink: 0,
        minHeight: "32px",
        zIndex: 1000,
      }}
    >
      {path.map((widget, index) => {
        const descriptor = typeRegistry.getDescriptorForInstance(widget);
        const isLast = index === path.length - 1;

        return (
          <React.Fragment key={widget.id}>
            <button
              onClick={() => onSelect(widget.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "3px",
                padding: "3px 6px",
                backgroundColor: isLast ? "#4A90E2" : "transparent",
                border: "none",
                borderRadius: 0,
                color: isLast ? "#fff" : "#a0a0a0",
                fontSize: 10,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (!isLast) {
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                  e.currentTarget.style.color = "#e0e0e0";
                }
              }}
              onMouseLeave={(e) => {
                if (!isLast) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#a0a0a0";
                }
              }}
            >
              <span style={{ display: "flex", alignItems: "center", fontSize: 12 }}>
                {getIcon(descriptor?.icon)}
              </span>
              <span>{descriptor?.label || "Widget"}</span>
            </button>

            {!isLast && (
              <span style={{ color: "#555", fontSize: 12 }}>›</span>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
