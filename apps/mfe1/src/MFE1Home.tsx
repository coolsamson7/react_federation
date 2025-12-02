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
})
class MFE1Home extends React.Component {
  render() {
    return (
      <div style={{ padding: "20px" }}>
        <h2>MFE1 Home Page</h2>
        <p>This component is loaded via Module Federation from the mfe1 remote.</p>
      </div>
    );
  }
}

export default MFE1Home;



