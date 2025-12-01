import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DefaultComponentRegistry } from "@portal/registry";
import { DI } from "@portal/di";
import { RouteManager, type RouteMeta } from "@portal/route-manager";
import { ManifestLoader, type MFEManifest } from "@portal/manifest-loader";
import { initializeRemote, loadRemoteModule } from "@portal/remote-loader";
import ShellLayout from "./ShellLayout";
import ShellHome from "./ShellHome";
import shellRoutes from "./shell-routes.json";
import { MFE_REMOTES } from "./config/remotes";

export default function App() {
  const [routes, setRoutes] = useState<RouteMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const routeManager = React.useMemo(() => DI.resolve(RouteManager), []);
  const manifestLoader = React.useMemo(() => DI.resolve(ManifestLoader), []);

  useEffect(() => {
    // Register ShellHome component
    DI.resolve(DefaultComponentRegistry).register("ShellHome", () =>
      Promise.resolve({ default: ShellHome })
    );

    // Initialize remotes and load routes
    const initializeApp = async () => {
      try {
        // Load remote entry scripts first
        for (const remote of MFE_REMOTES) {
          await loadRemoteScript(remote.url);
        }

        // Initialize Module Federation with all remotes
        await initializeRemote("mfe1");

        // Load manifests from all MFEs
        const manifests = await manifestLoader.loadManifests(MFE_REMOTES);

        // Convert manifests to routes
        const mfeRoutes = manifests.flatMap((manifest: MFEManifest) =>
          manifest.routes.map((route) => ({
            ...route,
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
          setRoutes(updatedRoutes);
        });

        // Initial load
        setRoutes(routeManager.getRoutes());
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
      <ShellLayout routes={routes}>
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

// Minimal Webpack Module Federation remote loader
async function loadRemoteComponent(remote: string, module: string) {
  try {
    // Use the Module Federation runtime loader
    const moduleName = module.replace("./", "");
    const loadedModule = await loadRemoteModule(remote, moduleName);
    return loadedModule;
  } catch (error) {
    console.error(`Failed to load remote component ${module} from ${remote}:`, error);
    throw error;
  }
}

export { loadRemoteComponent };
