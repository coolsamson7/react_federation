import React from "react";
import { Feature } from "@portal/component-registry";

@Feature({
  id: "mfe1-foo",
  label: "Foo Page",
  icon: "📄",
  description: "Foo feature page",
  path: "/mfe1/foo",
  meta: { requiresAuth: false },
})
class MFE1Foo extends React.Component {
  render() {
    return (
      <div style={{ padding: "20px" }}>
        <h2>MFE1 Foo Page</h2>
        <p>This is the foo feature page from MFE1.</p>
      </div>
    );
  }
}

export default MFE1Foo;
