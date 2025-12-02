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
      <div>
        <p style={{ color: "#a0a0a0", lineHeight: "1.6" }}>
          This is the bar feature page from MFE1.
        </p>
      </div>
    );
  }
}

export default MFE1Bar;
