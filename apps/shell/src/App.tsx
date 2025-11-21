import React, { useEffect, useState, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { DefaultComponentRegistry } from "@portal/registry";
import { DI } from "@portal/di";

// Minimal route metadata type
type RouteMeta = {
  path: string;
  component: string; // Name of component in registry or remote
  remote?: string;
};

export default function App() {
  const [routes, setRoutes] = useState<RouteMeta[]>([]);

  useEffect(() => {
    // For now just a static example; replace with fetch later
    setRoutes([
      { path: "/", component: "Home" },
      { path: "/about", component: "About" }
    ]);
  }, []);

  return (
    <Router>
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
    </Router>
  );
}

// Minimal Webpack Module Federation remote loader
async function loadRemoteComponent(remote: string, module: string) {
  // Wait for Webpack sharing
  //@ts-ignore
  await __webpack_init_sharing__("default");
  //@ts-ignore
  const container = window[remote];
  if (!container) throw new Error(`Remote ${remote} not found on window`);
  //@ts-ignore
  await container.init(__webpack_share_scopes__.default);
  const factory = await container.get(module);
  return factory();
}
