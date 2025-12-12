import { WidgetData } from "../metadata";
import { DeclareWidget, DeclareProperty } from "../decorators";
import { AutoRegisterWidget } from "../type-registry";
import { GridItem, GridSizeMode } from "./grid-item";

/**
 * Data class for a grid widget with rows and columns
 * Similar to Webflow's grid system
 */
@DeclareWidget({
  name: "grid",
  label: "Grid",
  group: "layout",
  icon: "grid",
  // Accept any child widget
  acceptChild: () => true,
})
@AutoRegisterWidget()
export class GridWidgetData extends WidgetData {
  // Grid Template Properties
  @DeclareProperty({
    label: "Columns",
    group: "grid",
    type: "gridItems",
    defaultValue: [new GridItem(GridSizeMode.fr, 1), new GridItem(GridSizeMode.fr, 1)],
  })
  columns?: GridItem[];

  @DeclareProperty({
    label: "Rows",
    group: "grid",
    type: "gridItems",
    defaultValue: [new GridItem(GridSizeMode.auto, 0)],
  })
  rows?: GridItem[];

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

  // Alignment - Cell Content Alignment
  @DeclareProperty({
    label: "Justify Items",
    group: "grid",
    type: "select",
    options: ["start", "end", "center", "stretch"],
    defaultValue: "stretch",
  })
  justifyItems?: string;

  @DeclareProperty({
    label: "Align Items",
    group: "grid",
    type: "select",
    options: ["start", "end", "center", "stretch"],
    defaultValue: "stretch",
  })
  alignItems?: string;

  // Advanced: Grid Track Alignment (usually not needed)
  @DeclareProperty({
    label: "Justify Content",
    group: "grid",
    type: "select",
    options: ["start", "end", "center", "stretch", "space-between", "space-around", "space-evenly"],
    defaultValue: "start",
    hide: true,
  })
  justifyContent?: string;

  @DeclareProperty({
    label: "Align Content",
    group: "grid",
    type: "select",
    options: ["start", "end", "center", "stretch", "space-between", "space-around", "space-evenly"],
    defaultValue: "start",
    hide: true,
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
    hide: true,
  })
  gridAutoColumns?: string;

  @DeclareProperty({
    label: "Auto Rows",
    group: "grid",
    type: "string",
    defaultValue: "auto",
    hide: true,
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
