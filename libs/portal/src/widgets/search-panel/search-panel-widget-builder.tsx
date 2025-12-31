import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import { WidgetBuilderProps } from "../widget-factory";
import { SearchPanelWidgetData } from "./search-panel-widget-data";
import { SearchPanelProvider } from "./search-panel-context";
import { ChipSearchPanel } from "../../query/components";
import { SelectionOverlay } from "../editor/SelectionOverlay";
import { messageBus } from "../editor/message-bus";
import { WidgetRenderer } from "../widget-renderer";
import { TypeRegistry } from "../type-registry";
import { WidgetFactory } from "../widget-factory";
import { container } from "tsyringe";
import { DropContainer } from "../editor/DropContainer";
import { insertChild, bumpVersion } from "../editor/tree-utils";

/**
 * Runtime builder for SearchPanelWidget
 */
@RegisterBuilder("search-panel", false)
export class SearchPanelWidgetBuilder extends WidgetBuilder<SearchPanelWidgetData> {
  handleSearch = (expression: any) => {
    console.log("[SearchPanelWidget] Search:", expression);
    // Could emit an event or call a callback here
  };

  render() {
    const { data, context } = this.props;
    const typeRegistry = container.resolve(TypeRegistry);
    const widgetFactory = container.resolve(WidgetFactory);

    return (
      <SearchPanelProvider
        value={{
          searchModel: data.searchModel,
          predefinedQuery: data.predefinedQuery,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "16px",
            backgroundColor: "#1a1a1a",
            borderRadius: "8px",
            border: "1px solid #333",
            minHeight: data.minHeight || 300,
          }}
        >
          {data.title && (
            <h3 style={{ margin: 0, color: "#e0e0e0", fontSize: "16px", fontWeight: "600" }}>
              {data.title}
            </h3>
          )}

          {data.searchModel && (
            <ChipSearchPanel
              criteria={data.searchModel.criteria || []}
              queryExpression={data.predefinedQuery || null}
              onQueryExpressionChange={() => {}} 
              onSearch={this.handleSearch}
            />
          )}

          {/* Render child widgets */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
            {data.children && data.children.length > 0 && (
              <>
                {data.children.map((child) => {
                  const version = context?.widgetVersions?.get(child.id) || 0;
                  return (
                    <WidgetRenderer
                      key={`${child.id}-${version}`}
                      data={child}
                      context={context}
                      edit={false}
                      typeRegistry={typeRegistry}
                      widgetFactory={widgetFactory}
                    />
                  );
                })}
              </>
            )}
          </div>
        </div>
      </SearchPanelProvider>
    );
  }
}

/**
 * Edit mode builder for SearchPanelWidget
 */
@RegisterBuilder("search-panel", true)
export class SearchPanelEditBuilder extends WidgetBuilder<SearchPanelWidgetData> {
  render() {
    const { data, context } = this.props;
    const typeRegistry = container.resolve(TypeRegistry);
    const widgetFactory = container.resolve(WidgetFactory);

    const isSelected = context?.selectedId === data.id;

    return (
      <SelectionOverlay
        isSelected={isSelected}
        label={`Search Panel Widget${data.title ? ` - ${data.title}` : ""}`}
        widget={data}
        onClick={(e) => {
          e.stopPropagation();
          messageBus.publish({ topic: "editor", message: "select", payload: data });
        }}
      >
        <DropContainer
          parent={data}
          typeRegistry={typeRegistry}
          onDropWidget={(w: any) => {
            insertChild(data, w);
            if (context?.widgetVersions) {
              bumpVersion(context.widgetVersions, data.id);
            }
            if (context?.forceUpdate) {
              context.forceUpdate();
            }
            // Auto-select the dropped widget
            messageBus.publish({ topic: "editor", message: "select", payload: w });
          }}
          emptyHint="Drop child widgets here"
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              padding: "16px",
              backgroundColor: "#1a1a1a",
              borderRadius: "8px",
              border: isSelected ? "2px solid #4caf50" : "1px solid #333",
              minHeight: data.minHeight || 300,
              cursor: isSelected ? "default" : "pointer",
              position: "relative",
            }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            {data.title && (
              <h3 style={{ margin: 0, color: "#e0e0e0", fontSize: "16px", fontWeight: "600" }}>
                {data.title}
              </h3>
            )}

            <div
              style={{
                padding: "12px",
                backgroundColor: "#0f0f0f",
                border: "1px dashed #333",
                borderRadius: "4px",
                color: "#666",
                fontSize: "12px",
                textAlign: "center",
              }}
            >
              🔍 Search Panel Widget
              <div style={{ fontSize: "11px", marginTop: "4px", color: "#555" }}>
                {data.searchModel?.criteria?.length || 0} criteria defined
              </div>
            </div>

            {/* Render child widgets */}
            {data.children && data.children.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginTop: "8px" }}>
                {data.children.map((child) => {
                  const version = context?.widgetVersions?.get(child.id) || 0;
                  return (
                    <WidgetRenderer
                      key={`${child.id}-${version}`}
                      data={child}
                      context={context}
                      edit={true}
                      typeRegistry={typeRegistry}
                      widgetFactory={widgetFactory}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </DropContainer>
      </SelectionOverlay>
    );
  }
}
