import React from "react";
import { Feature } from "@portal/component-registry";

@Feature({
  id: "mfe1-foo",
  label: "Foo Page",
  icon: "📄",
  description: "Foo feature page",
  path: "/mfe1/foo",
  tags: [],
  permissions: [],
  features: [],
  visibility: ["public"],
})
class MFE1Foo extends React.Component {
  render() {
    return (
      <div>
        <p style={{ color: "#a0a0a0", lineHeight: "1.6" }}>
          This is the foo feature page from MFE1.
        </p>
      </div>
    );
  }
}

export default MFE1Foo;
