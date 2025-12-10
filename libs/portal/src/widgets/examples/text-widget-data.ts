import { WidgetData } from "../metadata";
import { DeclareWidget, DeclareProperty } from "../decorators";
import { AutoRegisterWidget } from "../type-registry";

/**
 * Data class for a text widget
 * MUST be a class to support decorators
 */
@DeclareWidget({
  name: "text",
  label: "Text Widget",
  group: "basic",
  icon: "📝",
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
    type: "string",
    defaultValue: "normal",
  })
  fontWeight?: string;

  @DeclareProperty({
    label: "Color",
    group: "style",
    type: "string",
    defaultValue: "#000000",
  })
  color?: string;

  @DeclareProperty({
    label: "Background Color",
    group: "style",
    type: "string",
  })
  backgroundColor?: string;

  @DeclareProperty({
    label: "Text Align",
    group: "layout",
    type: "string",
    defaultValue: "left",
  })
  textAlign?: "left" | "center" | "right" | "justify";

  @DeclareProperty({
    label: "Padding",
    group: "layout",
    type: "string",
    defaultValue: "8px",
  })
  padding?: string;

  constructor(type: string = "text") {
    super(type);
    this.text = "";
  }
}
