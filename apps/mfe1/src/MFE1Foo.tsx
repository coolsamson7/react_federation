import React from "react";
import { Feature } from "@portal/component-registry";

@Feature({
  id: "mfe1-foo-small",
  label: "Foo Page (Small)",
  icon: "📄",
  description: "Foo feature page for smaller screens",
  path: "/mfe1/foo",
  tags: [],
  permissions: [],
  features: [],
  visibility: ["public"],
  clients: {
    maxWidth: 999,
  },
})
class MFE1FooSmall extends React.Component {
  render() {
    return (
      <div>
        <h2 style={{ color: "#ffffff", marginBottom: "1rem" }}>Foo (Small Screen)</h2>
        <p style={{ color: "#a0a0a0", lineHeight: "1.6" }}>
          This is the foo feature page optimized for screens &lt; 1000px.
        </p>
      </div>
    );
  }
}

@Feature({
  id: "mfe1-foo-large",
  label: "Foo Page (Large)",
  icon: "📄",
  description: "Foo feature page for larger screens",
  path: "/mfe1/foo",
  tags: [],
  permissions: [],
  features: [],
  visibility: ["public"],
  clients: {
    minWidth: 1000,
  },
})
class MFE1FooLarge extends React.Component {
  render() {
    return (
      <div>
        <h2 style={{ color: "#ffffff", marginBottom: "1rem" }}>Foo (Large Screen)</h2>
        <p style={{ color: "#a0a0a0", lineHeight: "1.6" }}>
          This is the foo feature page optimized for screens ≥ 1000px.
        </p>
      </div>
    );
  }
}

export default MFE1FooSmall;
export { MFE1FooSmall, MFE1FooLarge };
