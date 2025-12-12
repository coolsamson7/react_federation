import { WidgetData } from "../metadata";
import { DeclareWidget, DeclareProperty } from "../decorators";
import { AutoRegisterWidget } from "../type-registry";

/**
 * Data class for a grid widget with rows and columns
 * Similar to Webflow's grid system
 */
@DeclareWidget({
  name: "grid",
  label: "Grid",
  group: "layout",
  icon: "⊞",
  // Accept any child widget
  acceptChild: () => true,
})
@AutoRegisterWidget()
export class GridWidgetData extends WidgetData {
  // Grid Template Properties
  @DeclareProperty({
    label: "Columns",
    group: "grid",
    type: "string",
    defaultValue: "1fr 1fr",
  })
  gridTemplateColumns?: string;

  @DeclareProperty({
    label: "Rows",
    group: "grid",
    type: "string",
    defaultValue: "auto",
  })
  gridTemplateRows?: string;

  // Gap Properties
  @DeclareProperty({
    label: "Column Gap",
    group: "grid",
    type: "padding",
    defaultValue: "16px",
  })
  columnGap?: string;

  @DeclareProperty({
    label: "Row Gap",
    group: "grid",
    type: "padding",
    defaultValue: "16px",
  })
  rowGap?: string;

  // Alignment Properties
  @DeclareProperty({
    label: "Justify Items",
    group: "alignment",
    type: "select",
    options: ["start", "end", "center", "stretch"],
    defaultValue: "stretch",
  })
  justifyItems?: string;

  @DeclareProperty({
    label: "Align Items",
    group: "alignment",
    type: "select",
    options: ["start", "end", "center", "stretch", "baseline"],
    defaultValue: "stretch",
  })
  alignItems?: string;

  @DeclareProperty({
    label: "Justify Content",
    group: "alignment",
    type: "select",
    options: ["start", "end", "center", "stretch", "space-between", "space-around", "space-evenly"],
    defaultValue: "start",
  })
  justifyContent?: string;

  @DeclareProperty({
    label: "Align Content",
    group: "alignment",
    type: "select",
    options: ["start", "end", "center", "stretch", "space-between", "space-around", "space-evenly"],
    defaultValue: "start",
  })
  alignContent?: string;

  // Auto Flow
  @DeclareProperty({
    label: "Auto Flow",
    group: "grid",
    type: "select",
    options: ["row", "column", "row dense", "column dense"],
    defaultValue: "row",
  })
  gridAutoFlow?: string;

  @DeclareProperty({
    label: "Auto Columns",
    group: "grid",
    type: "string",
    defaultValue: "auto",
  })
  gridAutoColumns?: string;

  @DeclareProperty({
    label: "Auto Rows",
    group: "grid",
    type: "string",
    defaultValue: "auto",
  })
  gridAutoRows?: string;

  // Size Properties
  @DeclareProperty({
    label: "Width",
    group: "size",
    type: "padding",
    defaultValue: "100%",
  })
  width?: string;

  @DeclareProperty({
    label: "Height",
    group: "size",
    type: "padding",
    defaultValue: "auto",
  })
  height?: string;

  @DeclareProperty({
    label: "Min Width",
    group: "size",
    type: "padding",
  })
  minWidth?: string;

  @DeclareProperty({
    label: "Min Height",
    group: "size",
    type: "padding",
  })
  minHeight?: string;

  // Style Properties
  @DeclareProperty({
    label: "Background Color",
    group: "style",
    type: "color",
  })
  backgroundColor?: string;

  @DeclareProperty({
    label: "Padding",
    group: "style",
    type: "padding",
    defaultValue: "16px",
  })
  padding?: string;

  @DeclareProperty({
    label: "Border Radius",
    group: "style",
    type: "padding",
    defaultValue: "0px",
  })
  borderRadius?: string;

  constructor(type: string = "grid") {
    super(type);
  }
}
