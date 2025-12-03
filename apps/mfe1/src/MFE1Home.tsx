import React from "react";
import { Feature } from "@portal/component-registry";

@Feature({
  id: "mfe1-home",
  label: "MFE1 Home",
  icon: "🏠",
  description: "Home page of MFE1 module",
  path: "/mfe1",
  tags: [],
  permissions: [],
  features: [],
  visibility: ["public"],
  clients: {
    screenSizes: ["sm", "md", "lg", "xl"],  // All except xs (phones portrait)
  },
})
class MFE1Home extends React.Component {
  render() {
    return (
      <div>
        <p style={{ color: "#a0a0a0", lineHeight: "1.6", marginBottom: "12px" }}>
          This component is loaded via Module Federation from the mfe1 remote.
        </p>
        <div style={{
          backgroundColor: "#0d0d0d",
          padding: "20px",
          borderRadius: "8px",
          border: "1px solid #333",
          marginTop: "20px"
        }}>
          <h3 style={{ color: "#60a5fa", marginBottom: "12px" }}>Features</h3>
          <ul style={{ color: "#a0a0a0", lineHeight: "1.8" }}>
            <li>Dynamic module loading</li>
            <li>Shared dependencies with the shell</li>
            <li>Independent deployment</li>
          </ul>
        </div>
      </div>
    );
  }
}

export default MFE1Home;



