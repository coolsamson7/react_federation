import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DefaultComponentRegistry } from "@portal/registry";
import { DI } from "@portal/di";
import { RouteManager, type RouteMeta } from "@portal/route-manager";
import { ManifestLoader, type Manifest } from "@portal/manifest-loader";
import { initializeRemote, loadRemoteModule } from "@portal/remote-loader";
import { detectClient, clientMatchesConstraints } from "@portal/client-detector";
import ShellLayout from "./ShellLayout";
import ShellHome from "./ShellHome";
import {ChatPanel} from "./ChatPanel";
import CubeConfigurator from "@portal/cube/MetadataPanel";

// Shell routes defined inline to avoid encoding issues
const shellRoutes = [
  {
    path: "/",
    component: "ShellHome",
    label: "Home",
    icon: "H" // Using simple letter to avoid UTF-8 issues
  },
  // search sample

  {
    path: "/query-search",
    component: "QuerySearchSample",
    label: "Query Search",
    icon: "Q" // Using simple letter to avoid UTF-8 issues
  },

  // cube sample

  {
    path: "/cube",
    component: "CubeConfigurator",
    label: "Cube",
    icon: "J" // Using simple letter to avoid UTF-8 issues
  },

  // chat sample

  {
    path: "/chat",
    component: "ChatPanel",
    label: "Chat",
    icon: "C" // Using simple letter to avoid UTF-8 issues
  }
];

// Track which remotes have been loaded
const loadedRemotesSet = new Set<string>();
const remoteUrlMapGlobal = new Map<string, string>();

// Callback to notify when a remote is loaded
let notifyRemoteLoaded: ((remoteName: string) => void) | null = null;

export default function App() {
  const [routes, setRoutes] = useState<RouteMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedRemotes, setLoadedRemotes] = useState<string[]>([]);
  const routeManager = React.useMemo(() => DI.resolve(RouteManager), []);
  const manifestLoader = React.useMemo(() => DI.resolve(ManifestLoader), []);

  // Set up callback for remote loading notifications
  React.useEffect(() => {
    notifyRemoteLoaded = (remoteName: string) => {
      setLoadedRemotes(prev => [...prev, remoteName]);
    };
    return () => {
      notifyRemoteLoaded = null;
    };
  }, []);

  useEffect(() => {
    // Register ShellHome and QuerySearchSample components// TODO: WHat is that?

    DI.resolve(DefaultComponentRegistry).register("ShellHome", () =>
      Promise.resolve({ default: ShellHome })
    );
    //DI.resolve(DefaultComponentRegistry).register("QuerySearchSample", () =>
    //  Promise.resolve({ default: QuerySearchSample })
    //);
    DI.resolve(DefaultComponentRegistry).register("ChatPanel", () =>
      Promise.resolve({ default: ChatPanel })
    );
    DI.resolve(DefaultComponentRegistry).register("CubeConfigurator", () =>
      Promise.resolve({ default: CubeConfigurator })
    );

    // Initialize app - load metadata only, not remote scripts
    const initializeApp = async () => {
      try {
        // Detect client information
        const clientInfo = detectClient();
        console.log("Detected client:", clientInfo);

        // Load deployment metadata with client info for server-side filtering
        const deployment = await manifestLoader.loadDeployment({
          application: "foo",
          client_info: clientInfo
        });

        console.log("Deployment metadata loaded:", deployment);

        // Store remote URLs for lazy loading later
        // For Capacitor (iOS/Android), replace localhost with Mac IP
        const isCapacitor = !!(window as any).Capacitor;
        for (const module of Object.values(deployment.modules)) {
          let uri = module.uri;

          // Replace localhost with Mac's IP for Capacitor
          if (isCapacitor && uri.includes('localhost')) {
            uri = uri.replace('localhost', '192.168.1.16');
            console.log(`Converted ${module.name} URI from ${module.uri} to ${uri}`);
          }

          remoteUrlMapGlobal.set(module.name, uri);
        }

        // Convert manifests to routes and filter by client (client-side fallback)
        const mfeRoutes = Object.values(deployment.modules).flatMap((manifest: Manifest) =>
          manifest.features
            .filter((feature) => clientMatchesConstraints(clientInfo, feature.clients))
            .map((feature) => ({
              ...feature,
              remote: manifest.name,
            }))
        );

        console.log(`Filtered ${mfeRoutes.length} features for client:`, clientInfo.screen_size, clientInfo.platform);
        console.log("All filtered routes:", mfeRoutes.map(r => ({ id: r.id, component: r.component, path: r.path })));

        // Initialize global feature registry
        if (!(window as any).__PORTAL_FEATURES__) {
          (window as any).__PORTAL_FEATURES__ = {};
        }

        // Load features without paths (like navigation) and register them globally
        const specialFeatures = mfeRoutes.filter((route) => !route.path || route.path === "");
        console.log("Special features (no path):", specialFeatures.map(f => ({ id: f.id, component: f.component })));

        for (const feature of specialFeatures) {
          console.log(`Loading feature "${feature.id}":`, feature.component);
          try {
            const module = await loadRemoteComponent(feature.remote!, `./${feature.component}`);
            (window as any).__PORTAL_FEATURES__[feature.id] = module.default;
            console.log(`Registered feature "${feature.id}" in global registry`);
          } catch (error) {
            console.error(`Failed to load feature "${feature.id}":`, error);
          }
        }

        console.log("Global feature registry:", Object.keys((window as any).__PORTAL_FEATURES__));

        // Filter out features without a path (like navigation) from regular routes
        const regularRoutes = mfeRoutes.filter((route) => route.path && route.path !== "");

        // Merge shell routes with MFE routes loaded from manifests
        await routeManager.mergeRoutes(
          shellRoutes as RouteMeta[],
          regularRoutes
        );

        // Subscribe to route changes
        const unsubscribe = routeManager.onRoutesChange((updatedRoutes: RouteMeta[]) => {
          console.log("Routes updated:", updatedRoutes);
          setRoutes(updatedRoutes);
        });

        // Initial load
        const initialRoutes = routeManager.getRoutes();
        console.log("Initial routes:", initialRoutes);
        setRoutes(initialRoutes);
        setLoading(false);

        return unsubscribe;
      } catch (error) {
        console.error("Error initializing app:", error);
        // Fallback to shell routes only
        setRoutes(shellRoutes as RouteMeta[]);
        setLoading(false);
      }
    };

    const cleanup = initializeApp();
    return () => {
      cleanup.then((unsubscribe) => unsubscribe?.());
    };
  }, []);

  if (loading) {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        color: "#e0e0e0",
        fontSize: "18px"
      }}>
        Loading application...
      </div>
    );
  }

  return (
    <Router>
      <ShellLayout
        routes={routes}
        loadedRemotes={loadedRemotes}
        remoteUrlMap={remoteUrlMapGlobal}
      >
        <Routes>
          {routes.map((route, idx) => {
            const LazyComp = React.lazy(async () => {
              // If remote is defined, use Module Federation loader
              if (route.remote) {
                return loadRemoteComponent(route.remote, `./${route.component}`);
              }
              // Otherwise load from registry
              const loader = DI.resolve(DefaultComponentRegistry).get(route.component);
              return loader();
            });

            return (
              <Route
                key={idx}
                path={route.path}
                element={
                  <Suspense fallback={<div>Loading...</div>}>
                    <LazyComp />
                  </Suspense>
                }
              />
            );
          })}
        </Routes>
      </ShellLayout>
    </Router>
  );
}

// Load remote entry script dynamically
async function loadRemoteScript(url: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = url;
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${url}`));
    document.head.appendChild(script);
  });
}

// Lazy load remote on first access
async function loadRemoteComponent(remote: string, module: string) {
  try {
    // Check if remote has been loaded yet
    if (!loadedRemotesSet.has(remote)) {
      console.log(`Loading remote "${remote}" on demand...`);

      // Get the remote URL from our map
      const remoteUrl = remoteUrlMapGlobal.get(remote);
      if (!remoteUrl) {
        throw new Error(`Remote "${remote}" URL not found in deployment`);
      }

      // Load the remote entry script
      await loadRemoteScript(remoteUrl + "/remoteEntry.js");

      // Initialize the remote
      await initializeRemote(remote);

      // Mark as loaded
      loadedRemotesSet.add(remote);
      console.log(`Remote "${remote}" loaded successfully`);

      // Notify the UI to update
      if (notifyRemoteLoaded) {
        notifyRemoteLoaded(remote);
      }
    }

    // Load the specific module from the remote
    const moduleName = module.replace("./", "");
    const loadedModule = await loadRemoteModule(remote, moduleName);
    return loadedModule;
  } catch (error) {
    console.error(`Failed to load remote component ${module} from ${remote}:`, error);
    throw error;
  }
}

export { loadRemoteComponent };
