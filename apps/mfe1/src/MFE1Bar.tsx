import React from "react";
import { Feature } from "@portal/component-registry";

@Feature({
  id: "mfe1-bar",
  label: "Bar Page",
  icon: "🎯",
  description: "Bar feature page",
  path: "/mfe1/bar",
  tags: ["secret"],
  permissions: [],
  features: [],
  visibility: ["public"],
})
class MFE1Bar extends React.Component {
  render() {
    return (
      <div style={{ padding: "20px" }}>
        <h2>MFE1 Bar Page</h2>
        <p>This is the bar feature page from MFE1.</p>
      </div>
    );
  }
}

export default MFE1Bar;
