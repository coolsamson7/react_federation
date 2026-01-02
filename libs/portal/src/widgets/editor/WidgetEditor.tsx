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
import { Breadcrumb } from "./Breadcrumb";
import { getIcon } from "../icon-registry";

import {DashboardService, Dashboard, ListWidgetData} from "@portal/widgets";


const dashboardService : DashboardService = new DashboardService();

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
    const [canvasWidth, setCanvasWidth] = useState(1200);
    const [isResizingCanvas, setIsResizingCanvas] = useState<"left" | "right" | null>(null);

    // NEW

    // Dashboard state
    const [currentDashboard, setCurrentDashboard] = useState<Dashboard | null>(null);
    const [isDashboardChanged, setIsDashboardChanged] = useState<boolean>(false);
    const [dashboards, setDashboards] = useState<Dashboard[]>([]);
    const [showNewDashboardModal, setShowNewDashboardModal] = useState<boolean>(false);
    const [showLoadDashboardModal, setShowLoadDashboardModal] = useState<boolean>(false);
    const [newDashboardName, setNewDashboardName] = useState<string>('');

    // Load available dashboards on mount
    useEffect(() => {
        const loadDashboards = async () => {
            try {
                const availableDashboards = await dashboardService.list();
                setDashboards(availableDashboards);
            } catch (error) {
                console.error("Failed to load dashboards", error);
            }
        };

        loadDashboards();
    }, []);

    // Track changes to mark dashboard as changed
    useEffect(() => {
        if (currentDashboard) {
            // Compare widgets/layout with current dashboard
            // This depends on your specific widget state structure
            setIsDashboardChanged(true);
        }
    }, [/*widgets, layout*/]); // Your widget state variables

    // Dashboard handlers
    const handleNewDashboard = () => {
        setShowNewDashboardModal(true);
    };

    const handleCreateDashboard = () => {
        if (!newDashboardName.trim()) return;

        const r = typeRegistry.create<WidgetData>("list");
        setRoot(r);

        const newDashboard: Dashboard = {
            //id: `dashboard-${Date.now()}`, // Temporary ID until saved
            name: newDashboardName,
            configuration: JSON.stringify(root), // Initial empty state
            // other necessary properties
        };

        setCurrentDashboard(newDashboard);
        setNewDashboardName('');
        setShowNewDashboardModal(false);
        setIsDashboardChanged(true);
    };

    const handleSaveDashboard = async () => {
        if (!currentDashboard) return;

        try {
            // Create dashboard data object with current state
            const dashboardData = {
                ...currentDashboard,
                configuration: JSON.stringify(root), // Your current widgets state
                // other properties to save
            };

            // Save dashboard

            const savedDashboard = await dashboardService.update(dashboardData);

            // Update current dashboard with any server-side changes
            setCurrentDashboard(savedDashboard);
            setIsDashboardChanged(false);

            // Refresh dashboards list
            const updatedDashboards = await dashboardService.list();
            setDashboards(updatedDashboards);
        } catch (error) {
            console.error("Failed to save dashboard", error);
        }
    };

    const handleLoadDashboard = () => {
        setShowLoadDashboardModal(true);
    };


    const loadSelectedDashboard = async (dashboardId: string) => {
        try {
            const dashboard = await dashboardService.findById(dashboardId);
            setCurrentDashboard(dashboard);
            let json = JSON.parse(dashboard.configuration!);

            let widget = typeRegistry.parse<ListWidgetData>(json) ; // TODO

            console.log("###### FOOO");

            setRoot(widget)

            // Load dashboard widgets and layout
            // This would update your widget state

            setIsDashboardChanged(false);
            setShowLoadDashboardModal(false);
        } catch (error) {
            console.error(`Failed to load dashboard ${dashboardId}`, error);
        }
    };

    // NEW

    // Panel configurations with SVG icons
    const panelConfigs: PanelConfig[] = [
        {
            id: "palette",
            label: "Widget Palette",
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path
                        d="M7.5 0a7.5 7.5 0 0 0-5.419 12.735l.53.53A7.472 7.472 0 0 0 7.5 15c1.847 0 3.545-.665 4.889-1.765l.53-.53A7.5 7.5 0 0 0 7.5 0zM6 5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm1.5 3.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm3.5-1.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1.5 5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/>
                </svg>
            ),
            position: "left"
        },
        {
            id: "tree",
            label: "Widget Tree",
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path
                        d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                </svg>
            ),
            position: "left"
        },
        {
            id: "json",
            label: "JSON Structure",
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path
                        d="M14 4.5V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h5.5L14 4.5zm-3 0A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V4.5h-2z"/>
                    <path
                        d="M4.603 14.087a.81.81 0 0 1-.438-.42c-.195-.388-.13-.776.08-1.102.198-.307.526-.568.897-.787a7.68 7.68 0 0 1 1.482-.645 19.697 19.697 0 0 0 1.062-2.227 7.269 7.269 0 0 1-.43-1.295c-.086-.4-.119-.796-.046-1.136.075-.354.274-.672.65-.823.192-.077.4-.12.602-.077a.7.7 0 0 1 .477.365c.088.164.12.356.127.538.007.188-.012.396-.047.614-.084.51-.27 1.134-.52 1.794a10.954 10.954 0 0 0 .98 1.686 5.753 5.753 0 0 1 1.334.05c.364.066.734.195.96.465.12.144.193.32.2.518.007.192-.047.382-.138.563a1.04 1.04 0 0 1-.354.416.856.856 0 0 1-.51.138c-.331-.014-.654-.196-.933-.417a5.712 5.712 0 0 1-.911-.95 11.651 11.651 0 0 0-1.997.406 11.307 11.307 0 0 1-1.02 1.51c-.292.35-.609.656-.927.787a.793.793 0 0 1-.58.029zm1.379-1.901c-.166.076-.32.156-.459.238-.328.194-.541.383-.647.547-.094.145-.096.25-.04.361.01.022.02.036.026.044a.266.266 0 0 0 .035-.012c.137-.056.355-.235.635-.572a8.18 8.18 0 0 0 .45-.606zm1.64-1.33a12.71 12.71 0 0 1 1.01-.193 11.744 11.744 0 0 1-.51-.858 20.801 20.801 0 0 1-.5 1.05zm2.446.45c.15.163.296.3.435.41.24.19.407.253.498.256a.107.107 0 0 0 .07-.015.307.307 0 0 0 .094-.125.436.436 0 0 0 .059-.2.095.095 0 0 0-.026-.063c-.052-.062-.2-.152-.518-.209a3.876 3.876 0 0 0-.612-.053zM8.078 7.8a6.7 6.7 0 0 0 .2-.828c.031-.188.043-.343.038-.465a.613.613 0 0 0-.032-.198.517.517 0 0 0-.145.04c-.087.035-.158.106-.196.283-.04.192-.03.469.046.822.024.111.054.227.09.346z"/>
                </svg>
            ),
            position: "left"
        },
        {
            id: "properties",
            label: "Properties",
            icon: (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path
                        d="M9.405 1.05c-.413-1.4-2.397-1.4-2.81 0l-.1.34a1.464 1.464 0 0 1-2.105.872l-.31-.17c-1.283-.698-2.686.705-1.987 1.987l.169.311c.446.82.023 1.841-.872 2.105l-.34.1c-1.4.413-1.4 2.397 0 2.81l.34.1a1.464 1.464 0 0 1 .872 2.105l-.17.31c-.698 1.283.705 2.686 1.987 1.987l.311-.169a1.464 1.464 0 0 1 2.105.872l.1.34c.413 1.4 2.397 1.4 2.81 0l.1-.34a1.464 1.464 0 0 1 2.105-.872l.31.17c1.283.698 2.686-.705 1.987-1.987l-.169-.311a1.464 1.464 0 0 1 .872-2.105l.34-.1c1.4-.413 1.4-2.397 0-2.81l-.34-.1a1.464 1.464 0 0 1-.872-2.105l.17-.31c.698-1.283-.705-2.686-1.987-1.987l-.311.169a1.464 1.464 0 0 1-2.105-.872l-.1-.34zM8 10.93a2.929 2.929 0 1 1 0-5.86 2.929 2.929 0 0 1 0 5.858z"/>
                </svg>
            ),
            position: "right"
        },
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
        try {
            initializeWidgetTypes(typeRegistry);
            initializeWidgetBuilders(widgetFactory);
            initializePropertyEditors(editorRegistry);

            // Root canvas is a list widget
            const r = typeRegistry.create<WidgetData>("list");
            setRoot(r);
        } catch (e) {
            console.error("[WidgetEditor] Initialization failed:", e);
        } finally {
            setInitialized(true);
        }
    }, [typeRegistry, widgetFactory, editorRegistry]);

    useEffect(() => {
        const unsub = messageBus.subscribe("editor", (msg) => {
            if (msg.message === "select") {
                const w = msg.payload as WidgetData;
                setSelectedId(w?.id || null);
            } else if (msg.message === "delete") {
                const w = msg.payload as WidgetData;
                if (root) {
                    // Find and remove the widget from its parent
                    const removeWidget = (parent: WidgetData, targetId: string): boolean => {
                        const index = parent.children.findIndex(c => c.id === targetId);
                        if (index >= 0) {
                            parent.children.splice(index, 1);
                            bumpVersion(widgetVersions, parent.id);
                            return true;
                        }
                        for (const child of parent.children) {
                            if (removeWidget(child, targetId)) return true;
                        }
                        return false;
                    };

                    if (removeWidget(root, w.id)) {
                        if (selectedId === w.id) {
                            setSelectedId(null);
                        }
                        forceUpdate();
                    }
                }
            }
        });
        return () => unsub();
    }, [root, selectedId, widgetVersions]);

    useEffect(() => {
        if (!isResizingCanvas) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (isResizingCanvas === "left") {
                setCanvasWidth((prev) => Math.max(320, Math.min(2400, prev - e.movementX * 2)));
            } else if (isResizingCanvas === "right") {
                setCanvasWidth((prev) => Math.max(320, Math.min(2400, prev + e.movementX * 2)));
            }
        };

        const handleMouseUp = () => {
            setIsResizingCanvas(null);
        };

        document.addEventListener("mousemove", handleMouseMove);
        document.addEventListener("mouseup", handleMouseUp);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizingCanvas]);

    const forceUpdate = () => setRenderKey((k) => k + 1);

    const handleWidgetSelect = (widgetId: string) => {
        setSelectedId(widgetId);
        // Find the widget by ID to publish
        const findWidget = (w: WidgetData, id: string): WidgetData | null => {
            if (w.id === id) return w;
            for (const child of w.children) {
                const found = findWidget(child, id);
                if (found) return found;
            }
            return null;
        };
        const widget = root ? findWidget(root, widgetId) : null;
        if (widget) {
            messageBus.publish({topic: "editor", message: "select", payload: widget});
        }
    };

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
        () => ({widgetVersions, selectedId, forceUpdate}),
        [widgetVersions, selectedId, renderKey]
    );

    if (!initialized || !root) {
        return (
            <DndProvider backend={HTML5Backend}>
                <div style={{display: "flex", flexDirection: "column", height: "100%", overflow: "hidden"}}>
                    {/* Toolbar (disabled while loading) */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            padding: "12px 16px",
                            backgroundColor: "#1a1a1a",
                            borderBottom: "1px solid #333",
                        }}
                    >
                        <button
                            disabled
                            style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "6px 12px",
                                backgroundColor: "#222",
                                border: "1px solid #333",
                                borderRadius: 4,
                                color: "#777",
                                fontWeight: 600,
                                fontSize: 13,
                                cursor: "not-allowed",
                                opacity: 0.6,
                            }}
                        >
                            <span style={{fontSize: 14}}>⏳</span>
                            <span>Loading…</span>
                        </button>
                    </div>

                    {/* Loading placeholder */}
                    <div style={{
                        flex: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        background: "#0d0d0d"
                    }}>
                        <div style={{color: "#aaa", fontSize: 14}}>Initializing editor…</div>
                    </div>
                </div>
            </DndProvider>
        );
    }

    return (
        <>
            <DndProvider backend={HTML5Backend}>
                <div style={{display: "flex", flexDirection: "column", height: "100%", overflow: "hidden"}}>
                    {/* Toolbar */}
                    <div
                        style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            padding: "12px 16px",
                            backgroundColor: "#1a1a1a",
                            borderBottom: "1px solid #333",
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
                            <span style={{fontSize: 14}}>{isEditMode ? "▶" : "⏸"}</span>
                            <span>{isEditMode ? "Preview" : "Edit"}</span>
                        </button>

                        {/* Dashboard controls */}
                        <div className="dashboard-controls">
                            <button
                                className="new-dashboard-btn"
                                onClick={handleNewDashboard}
                            >
                                New
                            </button>

                            <div className="dashboard-name">
                                {currentDashboard ? currentDashboard.name : "Untitled Dashboard"}
                            </div>

                            <button
                                className="save-dashboard-btn"
                                onClick={handleSaveDashboard}
                                disabled={!currentDashboard}
                            >
                                Save
                            </button>

                            <button
                                className="load-dashboard-btn"
                                onClick={handleLoadDashboard}
                            >
                                Load
                            </button>
                        </div>
                    </div>

                    {/* Main Content with Panels */}
                    <div style={{
                        position: "relative",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        overflow: "hidden",
                        minHeight: 0
                    }}>
                        {/* Panels and Canvas Row */}
                        <div style={{
                            position: "relative",
                            flex: "1 1 0",
                            display: "flex",
                            minHeight: 0,
                            overflow: "hidden"
                        }}>
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
                                        panelId="palette"
                                    >
                                        <div style={{padding: "8px"}}>
                                            <WidgetPalette typeRegistry={typeRegistry}/>
                                        </div>
                                    </SlidingPanel>

                                    <SlidingPanel
                                        position="left"
                                        isOpen={activePanels.has("tree")}
                                        title="Widget Tree"
                                        width={320}
                                        float={false}
                                        onClose={() => togglePanel("tree")}
                                        panelId="tree"
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
                                        panelId="json"
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
                        margin: 16,
                        flex: 1,
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
                                    minHeight: 0,
                                    marginLeft: isEditMode ? "36px" : 0,
                                    marginRight: isEditMode ? "36px" : 0,
                                }}
                            >
                                {/* Outer canvas area - lighter background */}
                                <div
                                    style={{
                                        background: "#1a1a1a",
                                        flex: "1 1 0",
                                        display: "flex",
                                        flexDirection: "column",
                                        minHeight: 0,
                                        overflow: "hidden",
                                    }}
                                >
                                    {/* Top bar with device icon - fills full width */}
                                    {isEditMode && (
                                        <div
                                            style={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                padding: "8px",
                                                borderBottom: "1px solid #333",
                                                backgroundColor: "#0d0d0d",
                                                width: "100%",
                                                flexShrink: 0,
                                            }}
                                        >
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"
                                                 style={{color: "#888"}}>
                                                <path
                                                    d="M0 12.5A1.5 1.5 0 0 0 1.5 14h13a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 14.5 2h-13A1.5 1.5 0 0 0 0 3.5v9zM1.5 3a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V3zm0 9a.5.5 0 0 1 .5-.5h12a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H2a.5.5 0 0 1-.5-.5V12z"/>
                                            </svg>
                                        </div>
                                    )}

                                    {/* Canvas content area */}
                                    <div
                                        style={{
                                            flex: 1,
                                            display: "flex",
                                            justifyContent: "center",
                                            alignItems: "stretch",
                                            padding: "20px",
                                            minHeight: 0,
                                            overflow: "hidden",
                                        }}
                                    >
                                        {/* Inner edit area - centered with resize handles */}
                                        <div
                                            style={{
                                                position: "relative",
                                                width: isEditMode ? `${canvasWidth}px` : "100%",
                                                maxWidth: "100%",
                                                background: "#111",
                                                border: "1px solid #333",
                                                borderRadius: 4,
                                                display: "flex",
                                                flexDirection: "column",
                                                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.5)",
                                                alignSelf: "stretch",
                                            }}
                                        >
                                            {/* Left resize handle */}
                                            {isEditMode && (
                                                <div
                                                    onMouseDown={() => setIsResizingCanvas("left")}
                                                    style={{
                                                        position: "absolute",
                                                        left: 4,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        width: 12,
                                                        height: 40,
                                                        cursor: "ew-resize",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: isResizingCanvas === "left" ? "#4A90E2" : "#2a2a2a",
                                                        border: "1px solid #555",
                                                        borderRadius: "3px",
                                                        transition: "background-color 0.2s ease",
                                                        zIndex: 1000,
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isResizingCanvas) {
                                                            e.currentTarget.style.backgroundColor = "#4A90E2";
                                                            const svg = e.currentTarget.querySelector("svg");
                                                            if (svg) svg.setAttribute("fill", "#4A90E2");
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isResizingCanvas) {
                                                            e.currentTarget.style.backgroundColor = "#2a2a2a";
                                                            const svg = e.currentTarget.querySelector("svg");
                                                            if (svg) svg.setAttribute("fill", "#888");
                                                        }
                                                    }}
                                                >
                                                    <svg width="6" height="16" viewBox="0 0 6 16" fill="#888">
                                                        <rect x="1" y="0" width="1.5" height="16" rx="0.5"/>
                                                        <rect x="3.5" y="0" width="1.5" height="16" rx="0.5"/>
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Right resize handle */}
                                            {isEditMode && (
                                                <div
                                                    onMouseDown={() => setIsResizingCanvas("right")}
                                                    style={{
                                                        position: "absolute",
                                                        right: 4,
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        width: 12,
                                                        height: 40,
                                                        cursor: "ew-resize",
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                        backgroundColor: isResizingCanvas === "right" ? "#4A90E2" : "#2a2a2a",
                                                        border: "1px solid #555",
                                                        borderRadius: "3px",
                                                        transition: "background-color 0.2s ease",
                                                        zIndex: 1000,
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        if (!isResizingCanvas) {
                                                            e.currentTarget.style.backgroundColor = "#4A90E2";
                                                            const svg = e.currentTarget.querySelector("svg");
                                                            if (svg) svg.setAttribute("fill", "#4A90E2");
                                                        }
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        if (!isResizingCanvas) {
                                                            e.currentTarget.style.backgroundColor = "#2a2a2a";
                                                            const svg = e.currentTarget.querySelector("svg");
                                                            if (svg) svg.setAttribute("fill", "#888");
                                                        }
                                                    }}
                                                >
                                                    <svg width="6" height="16" viewBox="0 0 6 16" fill="#888">
                                                        <rect x="1" y="0" width="1.5" height="16" rx="0.5"/>
                                                        <rect x="3.5" y="0" width="1.5" height="16" rx="0.5"/>
                                                    </svg>
                                                </div>
                                            )}

                                            {/* Canvas content */}
                                            <div style={{flex: 1, overflow: "auto", padding: 12}}>
                                                <WidgetRenderer
                                                    data={root}
                                                    context={{...context, typeRegistry, widgetFactory}}
                                                    edit={isEditMode}
                                                    typeRegistry={typeRegistry}
                                                    widgetFactory={widgetFactory}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Breadcrumb at bottom of canvas */}
                                {(() => {
                                    console.log("[WidgetEditor] isEditMode:", isEditMode, "root:", root?.type);
                                    return isEditMode && (
                                        <Breadcrumb
                                            root={root}
                                            selectedId={selectedId}
                                            typeRegistry={typeRegistry}
                                            onSelect={handleWidgetSelect}
                                        />
                                    );
                                })()}
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
                                                return descriptor ? (
                                                    <span style={{display: "flex", alignItems: "center", gap: "8px"}}>
                          {getIcon(descriptor.icon)}
                                                        <span>{descriptor.label}</span>
                        </span>
                                                ) : "Properties";
                                            })()
                                            : "Properties"
                                    }
                                    width={320}
                                    float={false}
                                    onClose={() => togglePanel("properties")}
                                    panelId="properties"
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
                </div>
            </DndProvider>

            {/* New Dashboard Modal */}
            {showNewDashboardModal && (
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
                        zIndex: 2000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#1a1a1a",
                            borderRadius: "8px",
                            padding: "20px",
                            width: "400px",
                            maxWidth: "90%",
                            border: "1px solid #333",
                        }}
                    >
                        <h3
                            style={{
                                margin: "0 0 20px 0",
                                color: "#e0e0e0",
                                fontSize: "18px",
                            }}
                        >
                            New Dashboard
                        </h3>

                        <label style={{display: "block", marginBottom: "15px"}}>
            <span
                style={{
                    display: "block",
                    color: "#b0b0b0",
                    fontSize: "14px",
                    marginBottom: "5px",
                }}
            >
              Name:
            </span>
                            <input
                                type="text"
                                value={newDashboardName}
                                onChange={(e) => setNewDashboardName(e.target.value)}
                                autoFocus
                                style={{
                                    width: "100%",
                                    padding: "8px 10px",
                                    backgroundColor: "#2a2a2a",
                                    border: "1px solid #444",
                                    borderRadius: "4px",
                                    color: "#e0e0e0",
                                    fontSize: "14px",
                                }}
                            />
                        </label>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                onClick={() => setShowNewDashboardModal(false)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#3a3a3a",
                                    border: "1px solid #444",
                                    borderRadius: "4px",
                                    color: "#e0e0e0",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }}
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleCreateDashboard}
                                disabled={!newDashboardName.trim()}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: newDashboardName.trim()
                                        ? "#2a623d"
                                        : "#3a3a3a",
                                    border: "1px solid #444",
                                    borderRadius: "4px",
                                    color: newDashboardName.trim()
                                        ? "#e0e0e0"
                                        : "#808080",
                                    cursor: newDashboardName.trim()
                                        ? "pointer"
                                        : "not-allowed",
                                    fontSize: "14px",
                                }}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Load Dashboard Modal */}
            {showLoadDashboardModal && (
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
                        zIndex: 2000,
                    }}
                >
                    <div
                        style={{
                            backgroundColor: "#1a1a1a",
                            borderRadius: "8px",
                            padding: "20px",
                            width: "500px",
                            maxWidth: "90%",
                            border: "1px solid #333",
                        }}
                    >
                        <h3
                            style={{
                                margin: "0 0 20px 0",
                                color: "#e0e0e0",
                                fontSize: "18px",
                            }}
                        >
                            Load Dashboard
                        </h3>

                        <div
                            style={{
                                maxHeight: "300px",
                                overflowY: "auto",
                                border: "1px solid #333",
                                borderRadius: "4px",
                                backgroundColor: "#0d0d0d",
                            }}
                        >
                            {dashboards.length === 0 ? (
                                <div
                                    style={{
                                        padding: "20px",
                                        textAlign: "center",
                                        color: "#808080",
                                        fontSize: "14px",
                                    }}
                                >
                                    No dashboards available
                                </div>
                            ) : (
                                dashboards.map((dashboard) => (
                                    <div
                                        key={dashboard.id}
                                        onClick={() => loadSelectedDashboard(dashboard.id!)}
                                        style={{
                                            padding: "12px 16px",
                                            borderBottom: "1px solid #333",
                                            cursor: "pointer",
                                            color: "#e0e0e0",
                                            transition: "background-color 0.2s",
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = "#2a2a2a";
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = "transparent";
                                        }}
                                    >
                                        <div style={{fontSize: "15px", fontWeight: 500}}>
                                            {dashboard.name}
                                        </div>
                                        <div
                                            style={{
                                                fontSize: "12px",
                                                color: "#808080",
                                                marginTop: "4px",
                                            }}
                                        >
                                            No date
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "10px",
                                marginTop: "20px",
                            }}
                        >
                            <button
                                onClick={() => setShowLoadDashboardModal(false)}
                                style={{
                                    padding: "8px 16px",
                                    backgroundColor: "#3a3a3a",
                                    border: "1px solid #444",
                                    borderRadius: "4px",
                                    color: "#e0e0e0",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
