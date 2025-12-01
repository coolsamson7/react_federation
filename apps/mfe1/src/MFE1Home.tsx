import React from "react";
import { registerRemoteComponent } from "@portal/component-registry";

function MFE1Home() {
  return (
    <div style={{ padding: "20px" }}>
      <h2>MFE1 Home Page</h2>
      <p>This component is loaded via Module Federation from the mfe1 remote.</p>
    </div>
  );
}

export default registerRemoteComponent("MFE1Home", MFE1Home);



