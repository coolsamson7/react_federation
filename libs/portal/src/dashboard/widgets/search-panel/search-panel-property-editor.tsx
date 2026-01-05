import React from "react";

import { SearchPanelWidgetData } from "./search-panel-widget-data";
import { SearchPanelCompactEditor } from "./search-panel-compact-editor";
import { SearchPanelFullEditor } from "./search-panel-full-editor";
import { Type, string, number, boolean, date } from "@portal/validation";
import {PropertyEditor, RegisterPropertyEditor} from "@portal/dashboard";

/**
 * Property editor for SearchPanelWidget configuration
 * Displays compact editor in property panel
 * Has expand button to open full editor in modal
 */
@RegisterPropertyEditor("searchPanelConfiguration")
export class SearchPanelPropertyEditor extends PropertyEditor<SearchPanelWidgetData> {
  state = {
    showFullEditor: false,
  };

  render() {
    const { value, onChange, propertyName } = this.props;
    const { showFullEditor } = this.state;

    // Built-in validation types
    const availableTypes: Type<any>[] = [
      string("string"),
      number("number"),
      boolean("boolean"),
      date("date"),
    ];

    let widget = value as SearchPanelWidgetData;

    // Initialize widget with default values if null
    if (!widget) {
      widget = new SearchPanelWidgetData();
      // Auto-update parent with initialized widget
      onChange(widget);
    }

    // Handle null searchModel - initialize with empty model
    if (!widget.searchModel) {
      widget.searchModel = {
        name: "default",
        criteria: [],
      };
      onChange(widget);
    }

    return (
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#e0e0e0",
            marginBottom: "8px",
          }}
        >
          {propertyName || "Search Panel Configuration"}
        </label>

        <SearchPanelCompactEditor
          searchModel={widget.searchModel}
          predefinedQuery={widget.predefinedQuery}
          onSearchModelChange={(model) => {
            const updated = Object.assign(Object.create(Object.getPrototypeOf(widget)), widget);
            updated.searchModel = model;
            onChange(updated);
          }}
          onPredefinedQueryChange={(query) => {
            const updated = Object.assign(Object.create(Object.getPrototypeOf(widget)), widget);
            updated.predefinedQuery = query;
            onChange(updated);
          }}
          onOpenFullEditor={() => this.setState({ showFullEditor: true })}
        />

        {/* Full Editor Modal */}
        {showFullEditor && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: "20px",
            }}
            onClick={() => this.setState({ showFullEditor: false })}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: "#0d0d0d",
                borderRadius: "8px",
                border: "1px solid #333",
                maxWidth: "900px",
                maxHeight: "80vh",
                width: "100%",
                overflow: "auto",
              }}
            >
              <SearchPanelFullEditor
                searchModel={widget.searchModel}
                predefinedQuery={widget.predefinedQuery}
                availableTypes={availableTypes}
                onSearchModelChange={(model) => {
                  const updated = Object.assign(Object.create(Object.getPrototypeOf(widget)), widget);
                  updated.searchModel = model;
                  onChange(updated);
                }}
                onPredefinedQueryChange={(query) => {
                  const updated = Object.assign(Object.create(Object.getPrototypeOf(widget)), widget);
                  updated.predefinedQuery = query;
                  onChange(updated);
                }}
                onClose={() => this.setState({ showFullEditor: false })}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
}
