import React, { useEffect, useState } from "react";
import { container } from "tsyringe";
import { TypeRegistry, initializeWidgetTypes } from "../type-registry";
import { WidgetFactory, initializeWidgetBuilders } from "../widget-factory";
import { WidgetRenderer } from "../widget-renderer";
import { ListWidgetData } from "./list-widget-data";
import { PropertyEditorRegistry, initializePropertyEditors } from "../property-editor/property-editor-registry";
import { PropertyPanel } from "../property-editor/property-panel";
import { WidgetData } from "../metadata";

// Import registries to ensure all decorators execute
import "./widget-registry";
import "../property-editor/editors/editor-registry";

export const WidgetSystemExample: React.FC = () => {
  const [initialized, setInitialized] = useState(false);
  const [typeRegistry] = useState(() => container.resolve(TypeRegistry));
  const [widgetFactory] = useState(() => container.resolve(WidgetFactory));
  const [editorRegistry] = useState(() => container.resolve(PropertyEditorRegistry));
  const [listWidget, setListWidget] = useState<ListWidgetData | null>(null);
  const [selectedWidget, setSelectedWidget] = useState<WidgetData | null>(null);
  const [widgetVersions, setWidgetVersions] = useState<Map<string, number>>(new Map());

  // Example: Nested widgets from JSON with recursive parsing
  const jsonData = {
    type: "list",
    gap: "16px",
    padding: "16px",
    backgroundColor: "#f9f9f9",
    children: [
      {
        type: "text",
        text: "Header",
        fontSize: 24,
        fontWeight: "bold",
        color: "#007AFF",
      },
      {
        type: "text",
        text: "This is a paragraph inside a list widget.",
        fontSize: 16,
        color: "#333",
      },
      {
        type: "list",
        gap: "8px",
        padding: "16px",
        backgroundColor: "#e0e0e0",
        children: [
          {
            type: "cube",
            query: "foo",
          }, {
            type: "cube",
            query: "foo",
          },
          {
            type: "text",
            text: "Nested item 2",
            fontSize: 14,
          },
        ],
      },
      {
        type: "text",
        text: "Footer text",
        fontSize: 12,
        color: "#666",
      },
    ],
  };

  useEffect(() => {
    console.log("[WidgetSystemExample] Initializing...");

    initializeWidgetTypes(typeRegistry);
    initializeWidgetBuilders(widgetFactory);
    initializePropertyEditors(editorRegistry);

    console.log("[WidgetSystemExample] Registered types:", typeRegistry.getTypeNames());
    console.log("[WidgetSystemExample] Registered builders:", widgetFactory.getTypeNames());
    console.log("[WidgetSystemExample] Registered editors:", editorRegistry.getTypes());

    setInitialized(true);
  }, [typeRegistry, widgetFactory, editorRegistry]);

  // Parse JSON only once and store in state
  useEffect(() => {
    if (initialized && !listWidget) {
      console.log("[WidgetSystemExample] Parsing JSON...");
      const parsed = typeRegistry.parse<ListWidgetData>(jsonData);
      console.log("[WidgetSystemExample] Parsed successfully!");
      setListWidget(parsed);
      // Select first text widget by default
      if (parsed.children.length > 0) {
        setSelectedWidget(parsed.children[0]);
      }
    }
  }, [initialized, listWidget, typeRegistry]);

  if (!initialized || !listWidget) return <div>Loading...</div>;

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      <h1 style={{ color: "#fff" }}>Widget System Demo</h1>
      <p style={{ color: "#a0a0a0", marginBottom: "24px" }}>
        ✨ Recursive JSON parsing with nested widgets + Live Property Editing!
      </p>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Left: Widget Renderer */}
        <div style={{ flex: 1 }}>
          <h2 style={{ color: "#fff" }}>Runtime Mode</h2>
          <WidgetRenderer
            data={listWidget}
            typeRegistry={typeRegistry}
            widgetFactory={widgetFactory}
            context={{ widgetVersions }}
          />
        </div>

        {/* Right: Property Panel */}
        <div style={{ width: "350px" }}>
          <h2 style={{ color: "#fff" }}>Property Editor</h2>
          <p style={{ color: "#a0a0a0", fontSize: "14px", marginBottom: "16px" }}>
            Select a widget to edit its properties
          </p>

          {/* Widget Selector */}
          <div style={{ marginBottom: "16px" }}>
            <label style={{ color: "#e0e0e0", display: "block", marginBottom: "8px" }}>
              Select Widget:
            </label>
            <select
              value={selectedWidget?.id || ""}
              onChange={(e) => {
                const findWidget = (widget: WidgetData): WidgetData | null => {
                  if (widget.id === e.target.value) return widget;
                  for (const child of widget.children) {
                    const found = findWidget(child);
                    if (found) return found;
                  }
                  return null;
                };
                const found = findWidget(listWidget);
                if (found) setSelectedWidget(found);
              }}
              style={{
                width: "100%",
                padding: "8px 12px",
                backgroundColor: "#2a2a2a",
                border: "1px solid #404040",
                borderRadius: "4px",
                color: "#e0e0e0",
                fontSize: "14px",
              }}
            >
              {(() => {
                const options: React.ReactNode[] = [];
                const traverse = (widget: WidgetData, level: number = 0) => {
                  const indent = "  ".repeat(level);
                  const descriptor = typeRegistry.getDescriptorForInstance(widget);
                  const label = descriptor
                    ? `${indent}${descriptor.icon} ${descriptor.label}`
                    : `${indent}${widget.type}`;
                  options.push(
                    <option key={widget.id} value={widget.id}>
                      {label}
                    </option>
                  );
                  widget.children.forEach((child) => traverse(child, level + 1));
                };
                traverse(listWidget);
                return options;
              })()}
            </select>
          </div>

          {/* Property Panel */}
          {selectedWidget && (
            <PropertyPanel
              widget={selectedWidget}
              typeRegistry={typeRegistry}
              editorRegistry={editorRegistry}
              onChange={(updatedWidget) => {
                // Increment version for this specific widget to trigger re-render
                setWidgetVersions((prev) => {
                  const next = new Map(prev);
                  next.set(updatedWidget.id, (prev.get(updatedWidget.id) || 0) + 1);
                  return next;
                });
              }}
            />
          )}
        </div>
      </div>

      <h2 style={{ marginTop: "48px", color: "#fff" }}>JSON Structure</h2>
      <pre
        style={{
          backgroundColor: "#0d0d0d",
          border: "1px solid #333",
          padding: "16px",
          borderRadius: "8px",
          overflow: "auto",
          fontSize: "12px",
          color: "#a0a0a0",
        }}
      >
        {JSON.stringify(jsonData, null, 2)}
      </pre>
    </div>
  );
};
