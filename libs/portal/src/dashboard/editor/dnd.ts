export const DND_ITEM = {
  WIDGET: "WIDGET",
} as const;

export type DragWidgetItem = {
  type: typeof DND_ITEM.WIDGET;
  widget: any; // WidgetData instance
};
