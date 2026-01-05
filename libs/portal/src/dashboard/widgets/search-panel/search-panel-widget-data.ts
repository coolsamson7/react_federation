import {QueryExpression, SearchModel} from "@portal/query/query-model";
import {AutoRegisterWidget, DeclareProperty, DeclareWidget, WidgetData} from "@portal/dashboard";

/**
 * Configuration for the SearchPanelWidget
 */
export interface SearchPanelWidgetConfiguration {
  title?: string;
  searchModel: SearchModel;
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
  searchModel: SearchModel;

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
