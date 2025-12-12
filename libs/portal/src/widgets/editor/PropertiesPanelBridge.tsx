import React, { useEffect, useState } from "react";
import { PropertyPanel } from "../property-editor/property-panel";
import { TypeRegistry } from "../type-registry";
import { PropertyEditorRegistry } from "../property-editor/property-editor-registry";
import { WidgetData } from "../metadata";
import { findById, bumpVersion } from "./tree-utils";
import { messageBus } from "./message-bus";

interface Props {
  root: WidgetData;
  typeRegistry: TypeRegistry;
  editorRegistry: PropertyEditorRegistry;
  widgetVersions: Map<string, number>;
  onVersionBump: () => void;
}

export const PropertiesPanelBridge: React.FC<Props> = ({ root, typeRegistry, editorRegistry, widgetVersions, onVersionBump }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<WidgetData | null>(null);

  useEffect(() => {
    const unsub = messageBus.subscribe("editor", (msg) => {
      if (msg.message === "select") {
        const w = msg.payload as WidgetData;
        setSelectedId(w?.id || null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
    } else {
      setSelected(findById(root, selectedId));
    }
  }, [root, selectedId]);

  if (!selected) {
    return (
      <div style={{ padding: "16px", color: "#888", textAlign: "center" }}>
        No widget selected
      </div>
    );
  }

  const descriptor = typeRegistry.getDescriptorForInstance(selected);

  return (
    <PropertyPanel
      widget={selected}
      typeRegistry={typeRegistry}
      editorRegistry={editorRegistry}
      onChange={(w) => {
        bumpVersion(widgetVersions, w.id);
        onVersionBump();
      }}
    />
  );
};
