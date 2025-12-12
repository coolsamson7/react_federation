import React from "react";
import { WidgetBuilder, RegisterBuilder } from "../widget-factory";
import { GridWidgetData } from "./grid-widget-data";
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

    const style: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: data.gridTemplateColumns || "1fr 1fr",
      gridTemplateRows: data.gridTemplateRows || "auto",
      columnGap: data.columnGap || "16px",
      rowGap: data.rowGap || "16px",
      justifyItems: data.justifyItems as any || "stretch",
      alignItems: data.alignItems as any || "stretch",
      justifyContent: data.justifyContent as any || "start",
      alignContent: data.alignContent as any || "start",
      gridAutoFlow: data.gridAutoFlow as any || "row",
      gridAutoColumns: data.gridAutoColumns || "auto",
      gridAutoRows: data.gridAutoRows || "auto",
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
                gridColumn: child.cell.col + 1,
                gridRow: child.cell.row + 1,
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
  // Parse grid template to determine number of columns and rows
  private parseGridTemplate(template: string): number {
    if (!template) return 1;
    // Count space-separated values (fr, px, auto, repeat(), etc.)
    const parts = template.match(/\S+/g) || [];

    // Handle repeat() function
    let count = 0;
    for (const part of parts) {
      const repeatMatch = part.match(/repeat\((\d+),/);
      if (repeatMatch) {
        count += parseInt(repeatMatch[1], 10);
      } else {
        count++;
      }
    }
    return count || 1;
  }

  render() {
    const { data, context } = this.props;
    const typeRegistry = container.resolve(TypeRegistry);
    const widgetFactory = container.resolve(WidgetFactory);

    const isSelected = context?.selectedId === data.id;

    // Determine grid dimensions
    const cols = this.parseGridTemplate(data.gridTemplateColumns || "1fr 1fr");
    const rows = this.parseGridTemplate(data.gridTemplateRows || "auto");

    const style: React.CSSProperties = {
      display: "grid",
      gridTemplateColumns: data.gridTemplateColumns || "1fr 1fr",
      gridTemplateRows: data.gridTemplateRows || "auto",
      columnGap: data.columnGap || "16px",
      rowGap: data.rowGap || "16px",
      justifyItems: data.justifyItems as any || "stretch",
      alignItems: data.alignItems as any || "stretch",
      justifyContent: data.justifyContent as any || "start",
      alignContent: data.alignContent as any || "start",
      gridAutoFlow: data.gridAutoFlow as any || "row",
      gridAutoColumns: data.gridAutoColumns || "auto",
      gridAutoRows: data.gridAutoRows || "auto",
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
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const cellKey = `${row}-${col}`;

        // Find widget in this cell
        const widgetInCell = data.children.find(
          (child) => child.cell?.row === row && child.cell?.col === col
        );

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
        label={`Grid ${cols}×${rows} (${data.children.length} items)`}
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
  return (
    <DropContainer
      parent={parent}
      typeRegistry={typeRegistry}
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
      }}
      emptyHint=""
    >
      <div
        style={{
          position: "relative",
          minHeight: "80px",
          border: "2px dotted #444",
          borderRadius: "4px",
          backgroundColor: widget ? "transparent" : "#0d0d0d",
          boxSizing: "border-box",
        }}
      >
        {widget ? (
          <WidgetRenderer
            key={`${widget.id}-${context?.widgetVersions?.get(widget.id) || 0}`}
            data={widget}
            context={context}
            edit={true}
            typeRegistry={typeRegistry}
            widgetFactory={widgetFactory}
          />
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
