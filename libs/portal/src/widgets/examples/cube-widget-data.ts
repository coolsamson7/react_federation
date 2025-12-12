import { WidgetData } from "../metadata";
import { DeclareWidget, DeclareProperty } from "../decorators";
import { AutoRegisterWidget } from "../type-registry";

/**
 * Data class for a text widget
 * MUST be a class to support decorators
 */
@DeclareWidget({
  name: "cube",
  label: "Cube Chart",
  group: "charts",
  icon: "cube",
})
@AutoRegisterWidget()
export class CubeWidgetData extends WidgetData {
  @DeclareProperty({
    label: "Title",
    group: "content",
    type: "string",
    defaultValue: "METRIC TITLE",
    required: true,
  })
  title?: string;

  @DeclareProperty({
    label: "Icon",
    group: "content",
    type: "string",
    defaultValue: "⏱",
  })
  icon?: string;

  @DeclareProperty({
    label: "Footer",
    group: "content",
    type: "string",
    defaultValue: "Last week",
  })
  footer?: string;

  @DeclareProperty({
    label: "Value",
    group: "content",
    type: "string",
    defaultValue: "865",
  })
  value?: string;

  @DeclareProperty({
    label: "Unit",
    group: "content",
    type: "string",
    defaultValue: "MS",
  })
  unit?: string;

  @DeclareProperty({
    label: "Background Color",
    group: "style",
    type: "color",
    defaultValue: "#1e2a35",
  })
  backgroundColor?: string;

  @DeclareProperty({
    label: "Border Radius",
    group: "style",
    type: "number",
    defaultValue: 8,
  })
  borderRadius?: number;

  @DeclareProperty({
    label: "Query",
    group: "data",
    type: "string",
    defaultValue: "?",
  })
  query?: string;

  constructor(type: string = "cube") {
    super(type);
    this.title = "METRIC TITLE";
    this.icon = "⏱";
    this.footer = "Last week";
    this.value = "865";
    this.unit = "MS";
    this.backgroundColor = "#1e2a35";
    this.borderRadius = 8;
    this.query = "?";
  }
}
