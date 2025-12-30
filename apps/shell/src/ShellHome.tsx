import React from "react";
import { WidgetEditor } from "../../../libs/portal/src/widgets/editor/WidgetEditor";
import { ChatPanel } from "./ChatPanel";
import MetadataWidget from "./MetadataPanel";

export default function ShellHome() {
  return (
    <div style={{ display: "flex", flex: 1, minHeight: 0, height: "100%", overflow: "hidden" }}>
      { /*Widget Editor - Left Side */}

        { /*   <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto" }}>
          <MetadataWidget />
        </div> */
            }

      <div style={{ flex: 1, minWidth: 0, minHeight: 0, overflow: "auto" }}>
        <WidgetEditor />
      </div>

      {/* Chat Panel - Right Side   <ChatPanel />*/}

    </div>
  );
}
