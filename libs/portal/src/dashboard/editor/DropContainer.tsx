import React from "react";
import { useDrop } from "react-dnd";
import { DND_ITEM } from "./dnd";
import { TypeRegistry } from "../type-registry";
import { WidgetData } from "../metadata";

interface DropContainerProps {
  parent: WidgetData;
  typeRegistry: TypeRegistry;
  onDropWidget: (widget: WidgetData) => void;
  children?: React.ReactNode;
  emptyHint?: string;
  style?: React.CSSProperties;
}

export const DropContainer: React.FC<DropContainerProps> = ({ parent, typeRegistry, onDropWidget, children, emptyHint, style: customStyle }) => {
  const descriptor = typeRegistry.getDescriptorForInstance(parent);

  const [{ isOver, canDrop }, dropRef] = useDrop(
    () => ({
      accept: DND_ITEM.WIDGET,
      canDrop: (item: any) => {
        if (!descriptor) {
          console.log('[DropContainer] No descriptor found for parent:', parent);
          return false;
        }
        const result = descriptor.canAcceptChild(parent, item.widget);
        console.log('[DropContainer] canAcceptChild result:', result, 'parent:', parent.type, 'child:', item.widget.type);
        return result;
      },
      drop: (item: any, monitor) => {
        console.log('[DropContainer] drop triggered for widget:', item.widget);

        // Only handle if this is the innermost drop target
        if (monitor.didDrop()) {
          console.log('[DropContainer] Drop already handled by child, skipping');
          return;
        }

        onDropWidget(item.widget);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver({ shallow: true }),
        canDrop: monitor.canDrop(),
      }),
    }),
    [parent, descriptor, onDropWidget]
  );

  const finalStyle: React.CSSProperties = {
    position: "relative",
    outline: isOver && canDrop ? "2px solid #4caf50" : "none",
    minHeight: emptyHint ? 100 : undefined,
    width: "100%",
    height: "100%",
    ...customStyle,
  };

  return (
    <div
      ref={dropRef}
      style={finalStyle}
    >
      {children}
      {emptyHint && (!children || (Array.isArray(children) && children.length === 0)) && (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#888" }}>
          {emptyHint}
        </div>
      )}
    </div>
  );
};
