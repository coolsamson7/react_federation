import React from "react";
import { useDrag, useDrop } from "react-dnd";
import { WidgetData } from "../metadata";
import { TypeRegistry } from "../type-registry";
import { DND_ITEM } from "./dnd";
import { messageBus } from "./message-bus";

interface WidgetTreeProps {
  root: WidgetData;
  typeRegistry: TypeRegistry;
  selectedId: string | null;
  onMove: (draggedWidget: WidgetData, targetWidget: WidgetData) => void;
}

export const WidgetTree: React.FC<WidgetTreeProps> = ({
  root,
  typeRegistry,
  selectedId,
  onMove,
}) => {
  return (
    <div style={{ padding: "12px", overflowY: "auto" }}>
      <TreeNode
        widget={root}
        typeRegistry={typeRegistry}
        selectedId={selectedId}
        level={0}
        onMove={onMove}
      />
    </div>
  );
};

interface TreeNodeProps {
  widget: WidgetData;
  typeRegistry: TypeRegistry;
  selectedId: string | null;
  level: number;
  onMove: (draggedWidget: WidgetData, targetWidget: WidgetData) => void;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  widget,
  typeRegistry,
  selectedId,
  level,
  onMove,
}) => {
  const [collapsed, setCollapsed] = React.useState(false);
  const descriptor = typeRegistry.getDescriptorForInstance(widget);
  const isSelected = widget.id === selectedId;

  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: DND_ITEM.WIDGET,
      item: { type: DND_ITEM.WIDGET, widget },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    [widget]
  );

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: DND_ITEM.WIDGET,
      canDrop: (item: any) => {
        // Don't drop on self
        if (item.widget.id === widget.id) return false;
        // Don't drop parent into child
        const isDescendant = (parent: WidgetData, child: WidgetData): boolean => {
          if (parent.id === child.id) return true;
          return parent.children.some((c) => isDescendant(c, child));
        };
        if (isDescendant(item.widget, widget)) return false;

        // Check if target can accept children
        if (!descriptor) return false;
        return descriptor.canAcceptChild(widget, item.widget);
      },
      drop: (item: any, monitor) => {
        // Only handle if not already handled by child
        if (monitor.didDrop()) return;

        onMove(item.widget, widget);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [widget, descriptor, onMove]
  );

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    messageBus.publish({ topic: "editor", message: "select", payload: widget });
  };

  const hasChildren = widget.children && widget.children.length > 0;

  return (
    <div style={{ marginLeft: level * 16 }}>
      <div
        ref={(node) => {
          dragRef(node);
          dropRef(node);
        }}
        onClick={handleClick}
        style={{
          display: "flex",
          alignItems: "center",
          padding: "6px 8px",
          marginBottom: "2px",
          backgroundColor: isSelected
            ? "#2a2a2a"
            : isOver && canDrop
            ? "#1a4d1a"
            : "transparent",
          border: isOver && canDrop ? "1px solid #4caf50" : "1px solid transparent",
          borderRadius: "4px",
          cursor: "pointer",
          opacity: isDragging ? 0.5 : 1,
          transition: "all 0.15s ease",
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = "#1a1a1a";
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = "transparent";
          }
        }}
      >
        {/* Collapse/Expand Icon */}
        {hasChildren && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            }}
            style={{
              marginRight: "6px",
              fontSize: "10px",
              color: "#888",
              userSelect: "none",
              cursor: "pointer",
            }}
          >
            {collapsed ? "▶" : "▼"}
          </span>
        )}
        {!hasChildren && (
          <span style={{ marginRight: "6px", width: "10px", display: "inline-block" }} />
        )}

        {/* Widget Icon */}
        <span style={{ marginRight: "8px", fontSize: "14px" }}>
          {descriptor?.icon || "📦"}
        </span>

        {/* Widget Label */}
        <span style={{ fontSize: "12px", color: "#e0e0e0", flex: 1 }}>
          {descriptor?.label || widget.type}
        </span>

        {/* Child Count */}
        {hasChildren && (
          <span style={{ fontSize: "10px", color: "#666", marginLeft: "8px" }}>
            {widget.children.length}
          </span>
        )}

        {/* Cell Position (if in grid) */}
        {widget.cell && (
          <span
            style={{
              fontSize: "9px",
              color: "#888",
              marginLeft: "8px",
              padding: "2px 4px",
              backgroundColor: "#0d0d0d",
              borderRadius: "2px",
            }}
          >
            [{widget.cell.row},{widget.cell.col}]
          </span>
        )}
      </div>

      {/* Children */}
      {hasChildren && !collapsed && (
        <div>
          {widget.children.map((child) => (
            <TreeNode
              key={child.id}
              widget={child}
              typeRegistry={typeRegistry}
              selectedId={selectedId}
              level={level + 1}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
};
