import React, { useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { container } from "tsyringe";
import { TypeRegistry, initializeWidgetTypes } from "../type-registry";
import { WidgetFactory, initializeWidgetBuilders } from "../widget-factory";
import { PropertyEditorRegistry, initializePropertyEditors } from "../property-editor/property-editor-registry";
import { WidgetRenderer } from "../widget-renderer";
import { WidgetData } from "../metadata";
import { WidgetPalette } from "./WidgetPalette";
import { PropertiesPanelBridge } from "./PropertiesPanelBridge";
import { DropContainer } from "./DropContainer";
import { insertChild, bumpVersion } from "./tree-utils";
import { messageBus } from "./message-bus";
import { SlidingPanel } from "./SlidingPanel";
import { PanelToggleBar, PanelConfig } from "./PanelToggleBar";
import { WidgetTree } from "./WidgetTree";

// Ensure registries and builders are initialized via side-effect imports
import "../examples/widget-registry";
import "../property-editor/editors/editor-registry";

export const WidgetEditor: React.FC = () => {
  const [typeRegistry] = useState(() => container.resolve(TypeRegistry));
  const [widgetFactory] = useState(() => container.resolve(WidgetFactory));
  const [editorRegistry] = useState(() => container.resolve(PropertyEditorRegistry));

  const [initialized, setInitialized] = useState(false);
  const [root, setRoot] = useState<WidgetData | null>(null);
  const [widgetVersions, setWidgetVersions] = useState<Map<string, number>>(() => new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [renderKey, setRenderKey] = useState(0);
  const [isEditMode, setIsEditMode] = useState(true);
  const [activePanels, setActivePanels] = useState<Set<string>>(new Set(["palette", "properties"]));

  // Panel configurations
  const panelConfigs: PanelConfig[] = [
    { id: "palette", label: "Widget Palette", icon: "🎨", position: "left" },
    { id: "tree", label: "Widget Tree", icon: "🌲", position: "left" },
    { id: "json", label: "JSON Structure", icon: "📄", position: "left" },
    { id: "properties", label: "Properties", icon: "⚙️", position: "right" },
  ];

  const togglePanel = (panelId: string) => {
    setActivePanels((prev) => {
      const next = new Set(prev);

      // Find the position of the clicked panel
      const clickedPanel = panelConfigs.find(p => p.id === panelId);
      if (!clickedPanel) return next;

      // If clicking the same panel that's already open, close it
      if (next.has(panelId)) {
        next.delete(panelId);
        return next;
      }

      // Close all other panels on the same side
      panelConfigs.forEach(panel => {
        if (panel.position === clickedPanel.position && panel.id !== panelId) {
          next.delete(panel.id);
        }
      });

      // Open the clicked panel
      next.add(panelId);

      return next;
    });
  };

  useEffect(() => {
    initializeWidgetTypes(typeRegistry);
    initializeWidgetBuilders(widgetFactory);
    initializePropertyEditors(editorRegistry);

    // Root canvas is a list widget
    const r = typeRegistry.create<WidgetData>("list");
    setRoot(r);

    setInitialized(true);
  }, [typeRegistry, widgetFactory, editorRegistry]);

  useEffect(() => {
    const unsub = messageBus.subscribe("editor", (msg) => {
      if (msg.message === "select") {
        const w = msg.payload as WidgetData;
        setSelectedId(w?.id || null);
      }
    });
    return () => unsub();
  }, []);

  const forceUpdate = () => setRenderKey((k) => k + 1);

  const handleWidgetMove = (draggedWidget: WidgetData, targetWidget: WidgetData) => {
    if (!root) return;

    // Remove from current parent
    const removeFromTree = (widget: WidgetData): boolean => {
      for (let i = 0; i < widget.children.length; i++) {
        if (widget.children[i].id === draggedWidget.id) {
          widget.children.splice(i, 1);
          bumpVersion(widgetVersions, widget.id);
          return true;
        }
        const found = removeFromTree(widget.children[i]);
        if (found) {
          bumpVersion(widgetVersions, widget.id);
          return true;
        }
      }
      return false;
    };

    removeFromTree(root);

    // Add to new parent
    insertChild(targetWidget, draggedWidget);
    bumpVersion(widgetVersions, targetWidget.id);

    forceUpdate();
  };

  const context = useMemo(
    () => ({ widgetVersions, selectedId, forceUpdate }),
    [widgetVersions, selectedId, renderKey]
  );

  if (!initialized || !root) return null;

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            padding: "12px 16px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: 8,
            marginBottom: 0,
          }}
        >
          <button
            onClick={() => setIsEditMode(!isEditMode)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 12px",
              backgroundColor: isEditMode ? "#fff" : "#000",
              border: "1px solid #333",
              borderRadius: 4,
              color: isEditMode ? "#000" : "#fff",
              fontWeight: 600,
              fontSize: 13,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = "0.8";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = "1";
            }}
          >
            <span style={{ fontSize: 14 }}>{isEditMode ? "▶" : "⏸"}</span>
            <span>{isEditMode ? "Preview" : "Edit"}</span>
          </button>
        </div>

        {/* Main Content with Panels */}
        <div style={{ position: "relative", minHeight: 600, display: "flex" }}>
          {/* Panel Toggle Bars - only in edit mode */}
          {isEditMode && (
            <>
              <PanelToggleBar
                position="left"
                panels={panelConfigs.filter((p) => p.position === "left")}
                activePanels={activePanels}
                onToggle={togglePanel}
              />
              <PanelToggleBar
                position="right"
                panels={panelConfigs.filter((p) => p.position === "right")}
                activePanels={activePanels}
                onToggle={togglePanel}
              />
              <PanelToggleBar
                position="bottom"
                panels={panelConfigs.filter((p) => p.position === "bottom")}
                activePanels={activePanels}
                onToggle={togglePanel}
              />
            </>
          )}

          {/* Left Panels */}
          {isEditMode && (
            <>
              <SlidingPanel
                position="left"
                isOpen={activePanels.has("palette")}
                title="Widget Palette"
                width={280}
                float={false}
                onClose={() => togglePanel("palette")}
              >
                <WidgetPalette typeRegistry={typeRegistry} />
              </SlidingPanel>

              <SlidingPanel
                position="left"
                isOpen={activePanels.has("tree")}
                title="Widget Tree"
                width={320}
                float={false}
                onClose={() => togglePanel("tree")}
              >
                <WidgetTree
                  root={root}
                  typeRegistry={typeRegistry}
                  selectedId={selectedId}
                  onMove={handleWidgetMove}
                />
              </SlidingPanel>

              <SlidingPanel
                position="left"
                isOpen={activePanels.has("json")}
                title="JSON Structure"
                width={400}
                float={false}
                onClose={() => togglePanel("json")}
              >
                <pre
                  style={{
                    backgroundColor: "#0d0d0d",
                    border: "1px solid #333",
                    padding: 12,
                    borderRadius: 6,
                    overflow: "auto",
                    fontSize: 10,
                    color: "#a0a0a0",
                    lineHeight: 1.4,
                    margin: 0,
                    height: "100%",
                  }}
                >
                  {JSON.stringify(root, null, 2)}
                </pre>
              </SlidingPanel>
            </>
          )}

          {/* Center: Canvas */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              padding: isEditMode ? "0 52px 52px 52px" : "0 16px 16px 16px",
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 12, color: "#e0e0e0" }}>
              {isEditMode ? "Editor Canvas" : "Preview"}
            </div>
            <div
              style={{
                background: "#111",
                border: "1px solid #333",
                borderRadius: 8,
                padding: 12,
                minHeight: 550,
                flex: 1,
              }}
            >
              <WidgetRenderer
                data={root}
                context={{ ...context, typeRegistry, widgetFactory }}
                edit={isEditMode}
                typeRegistry={typeRegistry}
                widgetFactory={widgetFactory}
              />
            </div>
          </div>

          {/* Right Panel - Properties */}
          {isEditMode && (
            <SlidingPanel
              position="right"
              isOpen={activePanels.has("properties")}
              title={
                selectedId
                  ? (() => {
                      const findWidget = (w: WidgetData): WidgetData | null => {
                        if (w.id === selectedId) return w;
                        for (const child of w.children) {
                          const found = findWidget(child);
                          if (found) return found;
                        }
                        return null;
                      };
                      const widget = findWidget(root);
                      const descriptor = widget ? typeRegistry.getDescriptorForInstance(widget) : null;
                      return descriptor ? `${descriptor.icon} ${descriptor.label}` : "Properties";
                    })()
                  : "Properties"
              }
              width={320}
              float={false}
              onClose={() => togglePanel("properties")}
            >
              <PropertiesPanelBridge
                root={root}
                typeRegistry={typeRegistry}
                editorRegistry={editorRegistry}
                widgetVersions={widgetVersions}
                onVersionBump={() => setRenderKey((k) => k + 1)}
              />
            </SlidingPanel>
          )}
        </div>
      </div>
    </DndProvider>
  );
};
