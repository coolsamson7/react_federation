import React from "react";
import { Link } from "react-router-dom";
import { Feature } from "@portal/component-registry";
import { NavigationComponentProps } from "@portal/navigation";

@Feature({
  id: "navigation",
  label: "Desktop Navigation",
  icon: "🖥️",
  description: "Desktop-style sidebar navigation",
  path: "",
  tags: [],
  permissions: [],
  features: [],
  visibility: ["public"],
  clients: {
    platforms: ["macos", "windows", "linux", "web"], // Desktop platforms
  },
})
class DesktopNavigation extends React.Component<NavigationComponentProps> {
  render() {
    const { routes, currentPath } = this.props;
    console.log("[DesktopNavigation] Received routes:", routes);
    console.log("[DesktopNavigation] Current path:", currentPath);

    return (
      <nav
        style={{
          width: "250px",
          backgroundColor: "#0d0d0d",
          padding: "20px",
          borderRight: "1px solid #333",
          boxShadow: "2px 0 8px rgba(0,0,0,0.3)",
        }}
      >
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {routes.map((route) => {
            const isActive = currentPath === route.path;
            return (
              <li key={route.path} style={{ marginBottom: "8px" }}>
                <Link
                  to={route.path}
                  style={{
                    color: isActive ? "#60a5fa" : "#a0a0a0",
                    fontWeight: isActive ? "600" : "normal",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    borderRadius: "8px",
                    backgroundColor: isActive ? "#1e3a5f" : "transparent",
                    transition: "all 0.2s ease",
                    border: isActive ? "1px solid #60a5fa" : "1px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "#1a1a1a";
                      e.currentTarget.style.borderColor = "#404040";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  <span style={{ fontSize: "20px" }}>{route.icon || "📄"}</span>
                  <span>{route.label || route.path}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }
}

export default DesktopNavigation;
