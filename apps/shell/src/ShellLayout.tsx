import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";

type RouteMeta = {
  path: string;
  component: string;
  remote?: string;
  label?: string;
  icon?: string;
};

interface ShellLayoutProps {
  routes: RouteMeta[];
  children: React.ReactNode;
}

export default function ShellLayout({ routes, children }: ShellLayoutProps) {
  const location = useLocation();
  const currentRoute = routes.find(r => r.path === location.pathname);
  const [showRemotesModal, setShowRemotesModal] = useState(false);

  // Get unique remotes from routes
  const remotes = Array.from(new Set(routes.filter(r => r.remote).map(r => r.remote)));
  const remoteGroups = remotes.map(remoteName => ({
    name: remoteName,
    features: routes.filter(r => r.remote === remoteName)
  }));

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      backgroundColor: "#1a1a1a",
      color: "#e0e0e0",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
    }}>
      {/* Top Toolbar */}
      <header style={{
        height: "64px",
        backgroundColor: "#0d0d0d",
        borderBottom: "1px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
      }}>
        <div style={{
          fontSize: "20px",
          fontWeight: "600",
          color: "#fff",
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif"
        }}>
          Portal
        </div>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}>
          {/* Remotes Button */}
          <button
            onClick={() => setShowRemotesModal(true)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4a5568",
              color: "#fff",
              border: "1px solid #2d3748",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              transition: "all 0.2s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#5a6578";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#4a5568";
            }}
          >
            <span>🔌</span>
            <span>Remotes ({remotes.length})</span>
          </button>

          {/* User Avatar */}
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            backgroundColor: "#4a5568",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontSize: "16px",
            fontWeight: "500",
            cursor: "pointer",
            border: "2px solid #2d3748"
          }}>
            👤
          </div>
        </div>
      </header>

      {/* Remotes Modal */}
      {showRemotesModal && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setShowRemotesModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              zIndex: 999,
              backdropFilter: "blur(2px)"
            }}
          />

          {/* Modal */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#0d0d0d",
            border: "1px solid #333",
            borderRadius: "12px",
            padding: "32px",
            minWidth: "600px",
            maxWidth: "80vw",
            maxHeight: "80vh",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.5)"
          }}>
            {/* Modal Header */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "24px",
              paddingBottom: "16px",
              borderBottom: "1px solid #333"
            }}>
              <h2 style={{
                margin: 0,
                fontSize: "24px",
                fontWeight: "600",
                color: "#fff"
              }}>
                Loaded Remotes
              </h2>
              <button
                onClick={() => setShowRemotesModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#a0a0a0",
                  fontSize: "24px",
                  cursor: "pointer",
                  padding: "4px 8px",
                  lineHeight: 1
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#fff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#a0a0a0";
                }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            {remoteGroups.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px", color: "#a0a0a0" }}>
                <p>No remote modules loaded yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                {remoteGroups.map((remote) => (
                  <div key={remote.name} style={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    padding: "20px"
                  }}>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "16px"
                    }}>
                      <span style={{ fontSize: "24px" }}>📦</span>
                      <h3 style={{
                        margin: 0,
                        fontSize: "18px",
                        fontWeight: "600",
                        color: "#60a5fa"
                      }}>
                        {remote.name}
                      </h3>
                    </div>

                    <div style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px"
                    }}>
                      <div style={{
                        fontSize: "14px",
                        color: "#a0a0a0",
                        marginBottom: "8px"
                      }}>
                        Features: {remote.features.length}
                      </div>

                      <div style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "8px"
                      }}>
                        {remote.features.map((feature) => (
                          <div
                            key={feature.path}
                            style={{
                              backgroundColor: "#0d0d0d",
                              border: "1px solid #404040",
                              borderRadius: "6px",
                              padding: "8px 12px",
                              fontSize: "13px",
                              color: "#e0e0e0",
                              display: "flex",
                              alignItems: "center",
                              gap: "6px"
                            }}
                          >
                            <span>{feature.icon || "📄"}</span>
                            <span>{feature.label || feature.component}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar Navigation */}
        <nav
          style={{
            width: "250px",
            backgroundColor: "#0d0d0d",
            padding: "20px",
            borderRight: "1px solid #333",
            boxShadow: "2px 0 8px rgba(0,0,0,0.3)"
          }}
        >
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {routes.map((route) => {
              const isActive = location.pathname === route.path;
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
                      border: isActive ? "1px solid #60a5fa" : "1px solid transparent"
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
                    <span style={{ fontSize: "20px" }}>
                      {route.icon || "📄"}
                    </span>
                    <span>{route.label || route.path}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Main Content */}
        <main style={{
          flex: 1,
          display: "flex",
          flexDirection: "column"
        }}>
          {/* Feature Header */}
          {currentRoute && (
            <div style={{
              backgroundColor: "#0d0d0d",
              borderBottom: "1px solid #333",
              padding: "20px 32px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)"
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "16px"
              }}>
                <span style={{ fontSize: "32px" }}>
                  {currentRoute.icon || "📄"}
                </span>
                <div>
                  <h1 style={{
                    margin: 0,
                    fontSize: "24px",
                    fontWeight: "600",
                    color: "#fff"
                  }}>
                    {currentRoute.label || currentRoute.path}
                  </h1>
                </div>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div style={{
            flex: 1,
            padding: "32px",
            backgroundColor: "#1a1a1a",
            overflowY: "auto"
          }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
