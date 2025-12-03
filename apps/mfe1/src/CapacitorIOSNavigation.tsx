import React from "react";
import { Link } from "react-router-dom";
import { Feature } from "@portal/component-registry";
import { NavigationComponentProps } from "@portal/navigation";

@Feature({
  id: "navigation",
  label: "Capacitor iOS Navigation",
  icon: "📱",
  description: "Native iOS-style tab bar navigation",
  path: "",
  tags: [],
  permissions: [],
  features: [],
  visibility: ["public"],
  clients: {
    platforms: ["ios", "android"], // Native mobile platforms
  },
})
class CapacitorIOSNavigation extends React.Component<NavigationComponentProps> {
  render() {
    const { routes, currentPath } = this.props;

    return (
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "83px",
          backgroundColor: "rgba(248, 248, 248, 0.95)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderTop: "0.5px solid rgba(0, 0, 0, 0.15)",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "stretch",
          paddingBottom: "env(safe-area-inset-bottom, 0)",
          zIndex: 100,
          boxShadow: "0 -1px 0 rgba(0, 0, 0, 0.05)",
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
                color: isActive ? "#007AFF" : "#8E8E93",
                padding: "6px 0",
                transition: "color 0.15s ease",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <span
                style={{
                  fontSize: "28px",
                  lineHeight: "28px",
                  marginTop: "4px",
                  transform: isActive ? "scale(1.1)" : "scale(1)",
                  transition: "transform 0.15s ease",
                }}
              >
                {route.icon || "📄"}
              </span>
              <span
                style={{
                  fontSize: "10px",
                  fontWeight: isActive ? "600" : "400",
                  textAlign: "center",
                  maxWidth: "70px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.08px",
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

export default CapacitorIOSNavigation;
