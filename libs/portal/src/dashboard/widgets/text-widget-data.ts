import { WidgetData } from "../metadata";
import { DeclareWidget, DeclareProperty } from "../decorators";
import { AutoRegisterWidget } from "../type-registry";

/**
 * Data class for a text widget
 * MUST be a class to support decorators
 */
@DeclareWidget({
  name: "text",
  label: "Text",
  group: "basic",
  icon: "text",
})
@AutoRegisterWidget()
export class TextWidgetData extends WidgetData {
  @DeclareProperty({
    label: "Text Content",
    group: "content",
    type: "string",
    defaultValue: "Hello World",
    required: true,
  })
  text: string;

  @DeclareProperty({
    label: "Font Size",
    group: "style",
    type: "number",
    defaultValue: 16,
  })
  fontSize?: number;

  @DeclareProperty({
    label: "Font Weight",
    group: "style",
    type: "fontWeight",
    defaultValue: "normal",
  })
  fontWeight?: string;

  @DeclareProperty({
    label: "Color",
    group: "style",
    type: "color",
    defaultValue: "#000000",
  })
  color?: string;

  @DeclareProperty({
    label: "Background Color",
    group: "style",
    type: "color",
  })
  backgroundColor?: string;

  @DeclareProperty({
    label: "Text Align",
    group: "layout",
    type: "textAlign",
    defaultValue: "left",
  })
  textAlign?: "left" | "center" | "right" | "justify";

  @DeclareProperty({
    label: "Padding",
    group: "layout",
    type: "padding",
    defaultValue: "8px",
  })
  padding?: string;

  constructor(type: string = "text") {
    super(type);
    this.text = "Hello World";
  }
}
