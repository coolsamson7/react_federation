import React from "react";
import { Link } from "react-router-dom";
import { Feature } from "@portal/component-registry";
import { NavigationComponentProps } from "@portal/navigation";

@Feature({
  id: "navigation",
  label: "iOS Navigation",
  icon: "📱",
  description: "iOS-style bottom tab bar navigation",
  path: "",
  tags: [],
  permissions: [],
  features: [],
  visibility: ["public"],
  clients: {
    maxWidth: 767, // Mobile phones only
  },
})
class IOSNavigation extends React.Component<NavigationComponentProps> {
  render() {
    const { routes, currentPath } = this.props;

    return (
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          backgroundColor: "#0d0d0d",
          borderTop: "1px solid #333",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          padding: "0 8px",
          boxShadow: "0 -2px 8px rgba(0,0,0,0.3)",
          zIndex: 100,
        }}
      >
        {routes.slice(0, 5).map((route) => {
          const isActive = currentPath === route.path;
          return (
            <Link
              key={route.path}
              to={route.path}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
                textDecoration: "none",
                color: isActive ? "#60a5fa" : "#8a8a8a",
                padding: "8px",
                borderRadius: "8px",
                transition: "all 0.2s ease",
                backgroundColor: isActive ? "#1e3a5f20" : "transparent",
              }}
              onTouchStart={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "#1a1a1a";
                }
              }}
              onTouchEnd={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              <span
                style={{
                  fontSize: "24px",
                  filter: isActive ? "none" : "grayscale(50%)",
                }}
              >
                {route.icon || "📄"}
              </span>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: isActive ? "600" : "normal",
                  textAlign: "center",
                  maxWidth: "60px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {route.label || route.component}
              </span>
            </Link>
          );
        })}
      </nav>
    );
  }
}

export default IOSNavigation;
