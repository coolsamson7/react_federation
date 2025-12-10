import { WidgetData } from "../metadata";
import { DeclareWidget, DeclareProperty } from "../decorators";
import { AutoRegisterWidget } from "../type-registry";

/**
 * Data class for a vertical list widget
 * Demonstrates recursive children handling
 */
@DeclareWidget({
  name: "list",
  label: "List Widget",
  group: "layout",
  icon: "📋",
})
@AutoRegisterWidget()
export class ListWidgetData extends WidgetData {
  @DeclareProperty({
    label: "Gap Between Items",
    group: "layout",
    type: "string",
    defaultValue: "8px",
  })
  gap?: string;

  @DeclareProperty({
    label: "Padding",
    group: "layout",
    type: "string",
    defaultValue: "0",
  })
  padding?: string;

  @DeclareProperty({
    label: "Background Color",
    group: "style",
    type: "string",
  })
  backgroundColor?: string;

  constructor(type: string = "list") {
    super(type);
  }
}
