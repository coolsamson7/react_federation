import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import { GridWidgetData } from "./grid-widget-data";
import { GridItem, GridSizeMode, GridAlignment, getGridItemCSSValue } from "./grid-item";
import { WidgetRenderer } from "../widget-renderer";
import { TypeRegistry } from "../type-registry";
import { WidgetFactory } from "../widget-factory";
import { container } from "tsyringe";
import { DropContainer } from "../editor/DropContainer";
import { insertChild, bumpVersion } from "../editor/tree-utils";
import { messageBus } from "../editor/message-bus";
import { SelectionOverlay } from "../editor/SelectionOverlay";



/**
 * Runtime builder for GridWidget
 * Renders children in a CSS Grid layout
 */
@RegisterBuilder("grid", false)
export class GridWidgetBuilder extends WidgetBuilder<GridWidgetData> {
  render() {
    const { data, context } = this.props;
    const typeRegistry = container.resolve(TypeRegistry);
    const widgetFactory = container.resolve(WidgetFactory);

    // Convert GridItem arrays to CSS values - handle both class instances and plain objects
    const columns = data.columns || [new GridItem(GridSizeMode.fr, 1), new GridItem(GridSizeMode.fr, 1)];
    const rows = data.rows || [new GridItem(GridSizeMode.auto, 0)];
    const gridTemplateColumns = columns.map(c => getGridItemCSSValue(c)).join(" ");
    const gridTemplateRows = rows.map(r => getGridItemCSSValue(r)).join(" ");

    const style: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns,
      gridTemplateRows,
      columnGap: data.columnGap || "16px",
      rowGap: data.rowGap || "16px",
      width: data.width || "100%",
      height: data.height || "auto",
      minWidth: data.minWidth,
      minHeight: data.minHeight,
      backgroundColor: data.backgroundColor,
      padding: data.padding || "16px",
      borderRadius: data.borderRadius || "0px",
    };

    return (
      <div style={style}>
        {data.children.map((child) => {
          const version = context?.widgetVersions?.get(child.id) || 0;
          const cellStyle: React.CSSProperties = child.cell
            ? {
                gridColumn: child.cell.colSpan
                  ? `${child.cell.col + 1} / span ${child.cell.colSpan}`
                  : child.cell.col + 1,
                gridRow: child.cell.rowSpan
                  ? `${child.cell.row + 1} / span ${child.cell.rowSpan}`
                  : child.cell.row + 1,
                minHeight: child.cell.rowSpan && child.cell.rowSpan > 1
                  ? `${child.cell.rowSpan * 120}px`
                  : undefined,
              }
            : {};

          return (
            <div key={`${child.id}-${version}`} style={cellStyle}>
              <WidgetRenderer
                data={child}
                context={context}
                edit={false}
                typeRegistry={typeRegistry}
                widgetFactory={widgetFactory}
              />
            </div>
          );
        })}
      </div>
    );
  }
}

/**
 * Edit mode builder for GridWidget
 */
@RegisterBuilder("grid", true)
export class GridWidgetEditBuilder extends WidgetBuilder<GridWidgetData> {
  render() {
    const { data, context } = this.props;
    const typeRegistry = container.resolve(TypeRegistry);
    const widgetFactory = container.resolve(WidgetFactory);

    const isSelected = context?.selectedId === data.id;

    // Convert GridItem arrays to CSS values - handle both class instances and plain objects
    const columns = data.columns || [new GridItem(GridSizeMode.fr, 1), new GridItem(GridSizeMode.fr, 1)];
    const rows = data.rows || [new GridItem(GridSizeMode.auto, 0)];
    const gridTemplateColumns = columns.map(c => getGridItemCSSValue(c)).join(" ");
    const gridTemplateRows = rows.map(r => getGridItemCSSValue(r)).join(" ");

    // Determine grid dimensions
    const cols = columns.length;
    const rows_count = rows.length;

    const style: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns,
      gridTemplateRows,
      columnGap: data.columnGap || "16px",
      rowGap: data.rowGap || "16px",
      width: data.width || "100%",
      height: data.height || "auto",
      minWidth: data.minWidth,
      minHeight: data.minHeight || "auto",
      backgroundColor: data.backgroundColor || "#1a1a1a",
      padding: data.padding || "16px",
      borderRadius: data.borderRadius || "0px",
    };

    // Create grid cells
    const cells: JSX.Element[] = [];
    for (let row = 0; row < rows_count; row++) {
      for (let col = 0; col < cols; col++) {
        const cellKey = `${row}-${col}`;

        // Check if this cell is covered by a spanning widget
        const coveringWidget = data.children.find((child) => {
          if (!child.cell) return false;
          const startRow = child.cell.row;
          const startCol = child.cell.col;
          const rowSpan = child.cell.rowSpan || 1;
          const colSpan = child.cell.colSpan || 1;

          return (
            row >= startRow &&
            row < startRow + rowSpan &&
            col >= startCol &&
            col < startCol + colSpan
          );
        });

        // Find widget that starts in this cell
        const widgetInCell = data.children.find(
          (child) => child.cell?.row === row && child.cell?.col === col
        );

        // If covered by a spanning widget but not the starting cell, skip rendering
        if (coveringWidget && !widgetInCell) {
          continue;
        }

        cells.push(
          <GridCell
            key={cellKey}
            row={row}
            col={col}
            parent={data}
            widget={widgetInCell}
            context={context}
            typeRegistry={typeRegistry}
            widgetFactory={widgetFactory}
          />
        );
      }
    }

    return (
      <SelectionOverlay
        isSelected={isSelected}
        label={`Grid ${cols}×${rows_count} (${data.children.length} items)`}
        widget={data}
        onClick={(e) => {
          e.stopPropagation();
          messageBus.publish({ topic: "editor", message: "select", payload: data });
        }}
      >
        <div style={style}>
          {cells}
        </div>
      </SelectionOverlay>
    );
  }
}

/**
 * Individual grid cell with drop target
 */
interface GridCellProps {
  row: number;
  col: number;
  parent: GridWidgetData;
  widget?: any;
  context: any;
  typeRegistry: TypeRegistry;
  widgetFactory: WidgetFactory;
}

const GridCell: React.FC<GridCellProps> = ({
  row,
  col,
  parent,
  widget,
  context,
  typeRegistry,
  widgetFactory,
}) => {
  // Calculate grid span for this cell
  const cellStyle: React.CSSProperties = widget?.cell
    ? {
        gridColumn: widget.cell.colSpan
          ? `${widget.cell.col + 1} / span ${widget.cell.colSpan}`
          : widget.cell.col + 1,
        gridRow: widget.cell.rowSpan
          ? `${widget.cell.row + 1} / span ${widget.cell.rowSpan}`
          : widget.cell.row + 1,
      }
    : {};

  return (
    <DropContainer
      parent={parent}
      typeRegistry={typeRegistry}
      style={cellStyle}
      onDropWidget={(w) => {
        console.log(`[GridCell] Dropping widget into cell (${row}, ${col}):`, w);

        // Set cell position
        w.cell = { row, col };
        console.log(`[GridCell] Set cell property:`, w.cell);

        // Remove from children if already exists (moving within grid)
        const existingIndex = parent.children.findIndex((c) => c.id === w.id);
        if (existingIndex >= 0) {
          console.log(`[GridCell] Widget already exists at index ${existingIndex}, removing`);
          parent.children.splice(existingIndex, 1);
        }

        // Add to parent
        console.log(`[GridCell] Adding widget to parent. Parent children before:`, parent.children.length);
        insertChild(parent, w);
        console.log(`[GridCell] Parent children after:`, parent.children.length);

        if (context?.widgetVersions) {
          bumpVersion(context.widgetVersions, parent.id);
        }
        if (context?.forceUpdate) {
          context.forceUpdate();
        }
        // Auto-select the dropped widget
        messageBus.publish({ topic: "editor", message: "select", payload: w });
      }}
      emptyHint=""
    >
      <div
        style={{
          position: "relative",
          minHeight: "80px",
          height: "100%",
          border: "2px dotted #444",
          borderRadius: "4px",
          backgroundColor: widget ? "transparent" : "#0d0d0d",
          boxSizing: "border-box",
        }}
      >
        {widget ? (
          <div style={{ width: "100%", height: "100%" }}>
            <WidgetRenderer
              key={`${widget.id}-${context?.widgetVersions?.get(widget.id) || 0}`}
              data={widget}
              context={context}
              edit={true}
              typeRegistry={typeRegistry}
              widgetFactory={widgetFactory}
            />
          </div>
        ) : (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "#555",
              fontSize: "11px",
              pointerEvents: "none",
            }}
          >
            Drop here
          </div>
        )}
      </div>
    </DropContainer>
  );
};
