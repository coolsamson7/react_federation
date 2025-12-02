import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DefaultComponentRegistry } from "@portal/registry";
import { DI } from "@portal/di";
import { RouteManager, type RouteMeta } from "@portal/route-manager";
import { ManifestLoader, type Manifest } from "@portal/manifest-loader";
import { initializeRemote, loadRemoteModule } from "@portal/remote-loader";
import ShellLayout from "./ShellLayout";
import ShellHome from "./ShellHome";
import shellRoutes from "./shell-routes.json";
import { MFE_REMOTES } from "./config/remotes";

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
    // Register ShellHome component
    DI.resolve(DefaultComponentRegistry).register("ShellHome", () =>
      Promise.resolve({ default: ShellHome })
    );

    // Initialize app - load metadata only, not remote scripts
    const initializeApp = async () => {
      try {
        // Load deployment metadata (just the manifest, not the actual remotes)
        const deployment = await manifestLoader.loadDeployment({
          application: "foo"
        });

        console.log("Deployment metadata loaded:", deployment);

        // Store remote URLs for lazy loading later
        for (const module of Object.values(deployment.modules)) {
          remoteUrlMapGlobal.set(module.name, module.uri);
        }

        // Convert manifests to routes (metadata only)
        const mfeRoutes = Object.values(deployment.modules).flatMap((manifest: Manifest) =>
          manifest.features.map((feature) => ({
            ...feature,
            remote: manifest.name,
          }))
        );

        // Merge shell routes with MFE routes loaded from manifests
        await routeManager.mergeRoutes(
          shellRoutes as RouteMeta[],
          mfeRoutes
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
