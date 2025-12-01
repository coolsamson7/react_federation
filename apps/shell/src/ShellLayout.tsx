import React from "react";
import { Link, useLocation } from "react-router-dom";

type RouteMeta = {
  path: string;
  component: string;
  remote?: string;
  label?: string;
};

interface ShellLayoutProps {
  routes: RouteMeta[];
  children: React.ReactNode;
}

export default function ShellLayout({ routes, children }: ShellLayoutProps) {
  const location = useLocation();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar Navigation */}
      <nav
        style={{
          width: "200px",
          backgroundColor: "#f5f5f5",
          padding: "20px",
          borderRight: "1px solid #ddd",
        }}
      >
        <h2>Navigation</h2>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {routes.map((route) => (
            <li key={route.path} style={{ marginBottom: "10px" }}>
              <Link
                to={route.path}
                style={{
                  color: location.pathname === route.path ? "#0066cc" : "#333",
                  fontWeight: location.pathname === route.path ? "bold" : "normal",
                  textDecoration: "none",
                  display: "block",
                  padding: "8px",
                  borderRadius: "4px",
                  backgroundColor:
                    location.pathname === route.path ? "#e3f2fd" : "transparent",
                }}
              >
                {route.label || route.path}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: "20px" }}>
        {children}
      </main>
    </div>
  );
}
