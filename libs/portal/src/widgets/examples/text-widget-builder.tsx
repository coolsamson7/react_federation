import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import { TextWidgetData } from "./text-widget-data";

/**
 * Runtime builder for TextWidget
 * Renders the actual text with styling
 */
@RegisterBuilder("text", false)
export class TextWidgetBuilder extends WidgetBuilder<TextWidgetData> {
  render() {
    const { data } = this.props;

    const style: React.CSSProperties = {
      fontSize: data.fontSize ? `${data.fontSize}px` : undefined,
      fontWeight: data.fontWeight,
      color: data.color,
      backgroundColor: data.backgroundColor,
      textAlign: data.textAlign,
      padding: data.padding,
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
    const { data } = this.props;

    const style: React.CSSProperties = {
      fontSize: data.fontSize ? `${data.fontSize}px` : undefined,
      fontWeight: data.fontWeight,
      color: data.color,
      backgroundColor: data.backgroundColor,
      textAlign: data.textAlign,
      padding: data.padding,
      border: "1px dashed #ccc",
      cursor: "pointer",
      position: "relative",
    };

    return (
      <div style={style}>
        <div
          style={{
            position: "absolute",
            top: "-20px",
            left: 0,
            fontSize: "10px",
            color: "#666",
            fontFamily: "monospace",
          }}
        >
          Text Widget
        </div>
        {data.text}
      </div>
    );
  }
}
