import { WidgetData } from "../metadata";
import { DeclareWidget, DeclareProperty } from "../decorators";
import { AutoRegisterWidget } from "../type-registry";
import { SearchModelWithConstraints } from "../../query/components";
import { QueryExpression } from "../../query/query-model";
import { PropertyMetadata, WidgetMetadata } from "../metadata";

/**
 * Configuration for the SearchPanelWidget
 */
export interface SearchPanelWidgetConfiguration {
  title?: string;
  searchModel: SearchModelWithConstraints;
  predefinedQuery?: QueryExpression | null;
  minHeight?: number;
  showClear?: boolean;
}

/**
 * Widget data for search panel
 */
@DeclareWidget({
  name: "search-panel",
  label: "Search Panel",
  group: "query",
  icon: "🔍",
  acceptChild: () => true, // Accept any child widget
})
@AutoRegisterWidget()
export class SearchPanelWidgetData extends WidgetData {
  @DeclareProperty({
    label: "Panel Title",
    type: "string",
    group: "General",
  })
  title?: string;

  @DeclareProperty({
    label: "Search Model",
    type: "searchPanelConfiguration",
    group: "Configuration",
    required: true,
    editor: "searchPanelConfiguration",
  })
  searchModel: SearchModelWithConstraints;

  @DeclareProperty({
    label: "Predefined Query",
    type: "queryExpression",
    group: "Configuration",
    editor: "predefinedQueryEditor",
  })
  predefinedQuery?: QueryExpression | null;

  @DeclareProperty({
    label: "Minimum Height (px)",
    type: "number",
    group: "Appearance",
    defaultValue: 300,
  })
  minHeight: number = 300;

  @DeclareProperty({
    label: "Show Clear Button",
    type: "boolean",
    group: "Appearance",
    defaultValue: true,
  })
  showClear: boolean = true;

  constructor() {
    super("search-panel");
    this.searchModel = {
      name: "default",
      criteria: [],
    };
  }
}
