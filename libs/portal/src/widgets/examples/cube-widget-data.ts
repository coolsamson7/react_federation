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
  icon: "📊",
})
@AutoRegisterWidget()
export class CubeWidgetData extends WidgetData {
  @DeclareProperty({
    label: "Query",
    group: "content",
    type: "string",
    defaultValue: "?",
    required: true,
  })
  query: string;

  constructor(type: string = "cube") {
    super(type);
    this.query = "?";
  }
}
