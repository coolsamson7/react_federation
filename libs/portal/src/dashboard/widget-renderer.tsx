import React from "react";
import { WidgetData } from "./metadata";
import { WidgetFactory } from "./widget-factory";
import { TypeRegistry } from "./type-registry";

/**
 * Props for WidgetRenderer
 */
export interface WidgetRendererProps {
  data: WidgetData | WidgetData[];
  context?: any;
  edit?: boolean;
  typeRegistry: TypeRegistry;
  widgetFactory: WidgetFactory;
}

/**
 * Main rendering component that dynamically renders widgets based on their type
 * Similar to the Flutter widget tree rendering
 */
export const WidgetRenderer: React.FC<WidgetRendererProps> = ({
  data,
  context,
  edit = false,
  typeRegistry,
  widgetFactory,
}) => {
  // Handle array of widgets
  if (Array.isArray(data)) {
    return (
      <>
        {data.map((widget, index) => {
          const version = context?.widgetVersions?.get(widget.id) || 0;
          return (
            <WidgetRenderer
              key={`${widget.id || index}-${version}`}
              data={widget}
              context={context}
              edit={edit}
              typeRegistry={typeRegistry}
              widgetFactory={widgetFactory}
            />
          );
        })}
      </>
    );
  }

  // Single widget
  const widget = data;
  const builder = widgetFactory.getBuilder(widget.type, edit);

  if (!builder) {
    console.error(`[WidgetRenderer] No builder found for widget type: ${widget.type}`);
    return (
      <div
        style={{
          padding: "16px",
          margin: "8px",
          border: "2px dashed red",
          borderRadius: "4px",
          color: "red",
          fontFamily: "monospace",
        }}
      >
        ⚠️ Unknown widget type: {widget.type}
      </div>
    );
  }

  // Render the widget using its builder (class-based component)
  // Cast to React component type to satisfy TypeScript
  const BuilderComponent = builder as React.ComponentType<any>;
  const version = context?.widgetVersions?.get(widget.id) || 0;

  return React.createElement(BuilderComponent, {
    key: `${widget.id}-${version}`, // Force re-render when version changes
    data: widget,
    context,
    edit,
  });
};

/**
 * Hook to use widget renderer with DI
 */
export function useWidgetRenderer(
  typeRegistry: TypeRegistry,
  widgetFactory: WidgetFactory
) {
  return React.useCallback(
    (data: WidgetData | WidgetData[], context?: any, edit: boolean = false) => {
      return (
        <WidgetRenderer
          data={data}
          context={context}
          edit={edit}
          typeRegistry={typeRegistry}
          widgetFactory={widgetFactory}
        />
      );
    },
    [typeRegistry, widgetFactory]
  );
}
