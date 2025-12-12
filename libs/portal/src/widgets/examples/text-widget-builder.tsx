import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import { TextWidgetData } from "./text-widget-data";
import { messageBus } from "../editor/message-bus";
import { SelectionOverlay } from "../editor/SelectionOverlay";

/**
 * Runtime builder for TextWidget
 * Renders the actual text with styling
 */
@RegisterBuilder("text", false)
export class TextWidgetBuilder extends WidgetBuilder<TextWidgetData> {
  render() {
    const { data } = this.props;

    const style: React.CSSProperties = {
      fontSize: data.fontSize ? `${data.fontSize}px` : "16px",
      fontWeight: data.fontWeight || "normal",
      color: data.color || "#e0e0e0",
      backgroundColor: data.backgroundColor,
      textAlign: data.textAlign || "left",
      padding: data.padding || "8px",
    };

    return <div style={style}>{data.text}</div>;
  }
}

/**
 * Edit mode builder for TextWidget
 * Same as runtime but with visual indication that it's in edit mode
 */
@RegisterBuilder("text", true)
export class TextWidgetEditBuilder extends WidgetBuilder<TextWidgetData> {
  render() {
    const { data, context } = this.props;
    const isSelected = context?.selectedId === data.id;

    const style: React.CSSProperties = {
      fontSize: data.fontSize ? `${data.fontSize}px` : undefined,
      fontWeight: data.fontWeight,
      color: data.color || "#e0e0e0",
      backgroundColor: data.backgroundColor || "#2a2a2a",
      textAlign: data.textAlign,
      padding: data.padding || "8px",
    };

    return (
      <SelectionOverlay
        isSelected={isSelected}
        label="Text Widget"
        onClick={(e) => {
          e.stopPropagation();
          messageBus.publish({ topic: "editor", message: "select", payload: data });
        }}
      >
        <div style={style}>{data.text}</div>
      </SelectionOverlay>
    );
  }
}
