import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import { ListWidgetData } from "./list-widget-data";
import { WidgetRenderer } from "../widget-renderer";
import { TypeRegistry } from "../type-registry";
import { WidgetFactory } from "../widget-factory";
import { container } from "tsyringe";

/**
 * Runtime builder for ListWidget
 * Renders children vertically
 */
@RegisterBuilder("list", false)
export class ListWidgetBuilder extends WidgetBuilder<ListWidgetData> {
  render() {
    const { data, context } = this.props;
    const typeRegistry = container.resolve(TypeRegistry);
    const widgetFactory = container.resolve(WidgetFactory);

    const style: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: data.gap,
      padding: data.padding,
      backgroundColor: data.backgroundColor,
    };

    return (
      <div style={style}>
        {data.children.map((child, index) => (
          <WidgetRenderer
            key={child.id || index}
            data={child}
            context={context}
            typeRegistry={typeRegistry}
            widgetFactory={widgetFactory}
          />
        ))}
      </div>
    );
  }
}

/**
 * Edit mode builder for ListWidget
 */
@RegisterBuilder("list", true)
export class ListWidgetEditBuilder extends WidgetBuilder<ListWidgetData> {
  render() {
    const { data, context } = this.props;
    const typeRegistry = container.resolve(TypeRegistry);
    const widgetFactory = container.resolve(WidgetFactory);

    const style: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: data.gap,
      padding: data.padding,
      backgroundColor: data.backgroundColor,
      border: "2px dashed #ccc",
      position: "relative",
      minHeight: data.children.length === 0 ? "100px" : "auto",
    };

    return (
      <div style={style}>
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: 0,
            fontSize: "10px",
            //color: "#666",
            fontFamily: "monospace",
          }}
        >
          List Widget ({data.children.length} items)
        </div>
        {data.children.length === 0 ? (
          <div style={{ color: "#999", textAlign: "center", padding: "32px" }}>
            Empty list - drop items here
          </div>
        ) : (
          data.children.map((child, index) => (
            <WidgetRenderer
              key={child.id || index}
              data={child}
              context={context}
              edit={true}
              typeRegistry={typeRegistry}
              widgetFactory={widgetFactory}
            />
          ))
        )}
      </div>
    );
  }
}
