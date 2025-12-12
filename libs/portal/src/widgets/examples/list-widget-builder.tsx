import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import { ListWidgetData } from "./list-widget-data";
import { WidgetRenderer } from "../widget-renderer";
import { TypeRegistry } from "../type-registry";
import { WidgetFactory } from "../widget-factory";
import { container } from "tsyringe";
import { DropContainer } from "../editor/DropContainer";
import { insertChild, bumpVersion } from "../editor/tree-utils";
import { messageBus } from "../editor/message-bus";
import { SelectionOverlay } from "../editor/SelectionOverlay";

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
      gap: data.gap || "8px",
      padding: data.padding || "8px",
      backgroundColor: data.backgroundColor,
    };

    return (
      <div style={style}>
        {data.children.map((child) => {
          const version = context?.widgetVersions?.get(child.id) || 0;
          return (
            <WidgetRenderer
              key={`${child.id}-${version}`}
              data={child}
              context={context}
              edit={false}
              typeRegistry={typeRegistry}
              widgetFactory={widgetFactory}
            />
          );
        })}
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

    const isSelected = context?.selectedId === data.id;

    const style: React.CSSProperties = {
      display: "flex",
      flexDirection: "column",
      gap: data.gap || "8px",
      padding: data.padding || "8px",
      backgroundColor: data.backgroundColor || "#1a1a1a",
      minHeight: data.children.length === 0 ? "100px" : "auto",
    };

    return (
      <SelectionOverlay
        isSelected={isSelected}
        label={`List Widget (${data.children.length} items)`}
        onClick={(e) => {
          e.stopPropagation();
          messageBus.publish({ topic: "editor", message: "select", payload: data });
        }}
      >
        <div style={style}>
        <DropContainer
          parent={data}
          typeRegistry={typeRegistry}
          onDropWidget={(w) => {
            insertChild(data, w);
            if (context?.widgetVersions) {
              bumpVersion(context.widgetVersions, data.id);
            }
            if (context?.forceUpdate) {
              context.forceUpdate();
            }
            // Auto-select the dropped widget
            messageBus.publish({ topic: "editor", message: "select", payload: w });
          }}
          emptyHint="Drop items here"
        >
          {data.children.length === 0 ? (
            <div style={{ color: "#999", textAlign: "center", padding: "32px" }}>
              Empty list - drop items here
            </div>
          ) : (
            data.children.map((child) => {
              const version = context?.widgetVersions?.get(child.id) || 0;
              return (
                <WidgetRenderer
                  key={`${child.id}-${version}`}
                  data={child}
                  context={context}
                  edit={true}
                  typeRegistry={typeRegistry}
                  widgetFactory={widgetFactory}
                />
              );
            })
          )}
        </DropContainer>
        </div>
      </SelectionOverlay>
    );
  }
}
