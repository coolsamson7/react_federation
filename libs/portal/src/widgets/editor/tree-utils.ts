import { WidgetData } from "../metadata";

export function cloneWidget<T extends WidgetData>(widget: T): T {
  return JSON.parse(JSON.stringify(widget));
}

export function findById(root: WidgetData, id: string): WidgetData | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findById(child, id);
    if (found) return found;
  }
  return null;
}

export function insertChild(parent: WidgetData, child: WidgetData, index?: number) {
  if (index === undefined || index < 0 || index > parent.children.length) {
    parent.children.push(child);
  } else {
    parent.children.splice(index, 0, child);
  }
}

export function bumpVersion(map: Map<string, number>, id: string) {
  map.set(id, (map.get(id) || 0) + 1);
}
