import React from "react";
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

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        border: "1px solid #333",
        borderRadius: "8px",
        display: "flex",
        flexDirection: "column",
        maxHeight: "calc(100vh - 200px)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "16px", borderBottom: "1px solid #333" }}>
        <h3
          style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: "600",
            color: "#fff",
          }}
        >
          {descriptor.icon} {descriptor.label}
        </h3>
        <div style={{ fontSize: "10px", color: "#666", marginTop: "8px" }}>
          Type: {widget.type} | ID: {widget.id.substring(0, 8)}...
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
        {Array.from(propertiesByGroup.entries()).map(([groupName, properties]) => (
          <div key={groupName} style={{ marginBottom: "24px" }}>
            <div
              style={{
                fontSize: "11px",
                fontWeight: "600",
                textTransform: "uppercase",
                color: "#888",
                marginBottom: "12px",
                letterSpacing: "0.5px",
              }}
            >
              {groupName}
            </div>

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
                onChange: (newValue: any) => handlePropertyChange(property.name, newValue),
              });
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
