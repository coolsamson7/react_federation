import React, { useState } from "react";
import { WidgetData } from "../metadata";
import { TypeRegistry } from "../type-registry";
import { PropertyEditorRegistry } from "./property-editor-registry";

export interface PropertyPanelProps {
  widget: WidgetData;
  typeRegistry: TypeRegistry;
  editorRegistry: PropertyEditorRegistry;
  onChange: (widget: WidgetData) => void;
}

/**
 * Property panel that displays editors for all widget properties
 * Changes are immediately reflected in the widget
 */
export const PropertyPanel: React.FC<PropertyPanelProps> = ({
  widget,
  typeRegistry,
  editorRegistry,
  onChange,
}) => {
  const descriptor = typeRegistry.getDescriptorForInstance(widget);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

  if (!descriptor) {
    return (
      <div style={{ padding: "16px", color: "#999" }}>
        No descriptor found for widget type: {widget.type}
      </div>
    );
  }

  const handlePropertyChange = (propertyName: string, value: any) => {
    // Update the widget property directly (it's a reference to the widget in the tree)
    (widget as any)[propertyName] = value;
    // Trigger re-render by passing back the same widget reference
    // The parent component should force a re-render
    onChange(widget);
  };

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupName)) {
        next.delete(groupName);
      } else {
        next.add(groupName);
      }
      return next;
    });
  };

  // Group properties by their group field
  const propertiesByGroup = new Map<string, typeof descriptor.properties>();
  for (const [name, property] of descriptor.properties) {
    if (property.metadata.hide) continue;

    const group = property.metadata.group || "general";
    if (!propertiesByGroup.has(group)) {
      propertiesByGroup.set(group, new Map());
    }
    propertiesByGroup.get(group)!.set(name, property);
  }

  // Add grid span properties if widget has a cell property (is inside a grid)
  if (widget.cell) {
    const gridGroup = "grid";
    if (!propertiesByGroup.has(gridGroup)) {
      propertiesByGroup.set(gridGroup, new Map());
    }

    // Create synthetic property descriptors for grid span
    const gridProps = propertiesByGroup.get(gridGroup)!;

    // Column span property
    const colSpanProperty = {
      name: "gridColumnSpan",
      type: "number",
      label: "Column Span",
      group: gridGroup,
      metadata: {
        name: "gridColumnSpan",
        label: "Column Span",
        group: gridGroup,
        type: "number",
        defaultValue: 1,
        hide: false,
      },
      getValue: (instance: WidgetData) => instance.gridColumnSpan,
      setValue: (instance: WidgetData, value: number) => {
        instance.gridColumnSpan = value;
      },
    };

    // Row span property
    const rowSpanProperty = {
      name: "gridRowSpan",
      type: "number",
      label: "Row Span",
      group: gridGroup,
      metadata: {
        name: "gridRowSpan",
        label: "Row Span",
        group: gridGroup,
        type: "number",
        defaultValue: 1,
        hide: false,
      },
      getValue: (instance: WidgetData) => {
        const val = instance.gridRowSpan;
        console.log('[PropertyPanel] Getting gridRowSpan:', val, 'cell:', JSON.stringify(instance.cell));
        return val;
      },
      setValue: (instance: WidgetData, value: number) => {
        console.log('[PropertyPanel] Setting gridRowSpan to:', value, 'cell before:', instance.cell);
        instance.gridRowSpan = value;
        console.log('[PropertyPanel] Cell after:', instance.cell);
        console.log('[PropertyPanel] Calling onChange to trigger re-render');
      },
    };

    gridProps.set("gridColumnSpan", colSpanProperty as any);
    gridProps.set("gridRowSpan", rowSpanProperty as any);
  }

  return (
    <div style={{ flex: 1, overflowY: "auto" }}>
      {Array.from(propertiesByGroup.entries()).map(([groupName, properties]) => {
        const isCollapsed = collapsedGroups.has(groupName);
        return (
          <div key={groupName} style={{ marginBottom: "1px" }}>
            <div
              onClick={() => toggleGroup(groupName)}
              style={{
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                color: "#888",
                letterSpacing: "0.5px",
                padding: "8px 12px",
                backgroundColor: "#0d0d0d",
                borderBottom: "1px solid #333",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                userSelect: "none",
                paddingLeft: "16px",
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  transform: isCollapsed ? "rotate(0deg)" : "rotate(90deg)",
                  transition: "transform 0.2s ease",
                  display: "inline-block",
                }}
              >
                ›
              </span>
              <span>{groupName}</span>
            </div>

            {!isCollapsed && (
              <div style={{ padding: "12px 12px 0 12px", backgroundColor: "#1a1a1a" }}>
                {Array.from(properties.values()).map((property) => {
                  const Editor = editorRegistry.getEditor(property.type);

                  if (!Editor) {
                    return (
                      <div
                        key={property.name}
                        style={{
                          marginBottom: "16px",
                          padding: "8px",
                          backgroundColor: "#2a2a2a",
                          borderRadius: "4px",
                          color: "#999",
                          fontSize: "12px",
                        }}
                      >
                        No editor for type: {property.type} ({property.name})
                      </div>
                    );
                  }

                  const EditorComponent = Editor as React.ComponentType<any>;
                  const value = property.getValue(widget);

                  return React.createElement(EditorComponent, {
                    key: property.name,
                    propertyName: property.name,
                    label: property.label,
                    value,
                    onChange: (newValue: any) => {
                      property.setValue(widget, newValue);
                      onChange(widget);
                    },
                    propertyMetadata: property.metadata,
                  });
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
