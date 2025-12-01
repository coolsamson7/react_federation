import { singleton } from "tsyringe";

export type RouteMeta = {
  path: string;
  component: string;
  remote?: string;
  label?: string;
};

@singleton()
export class RouteManager {
  private routes: RouteMeta[] = [];
  private routeCallbacks: Set<(routes: RouteMeta[]) => void> = new Set();

  /**
   * Register a callback to be called when routes change
   */
  onRoutesChange(callback: (routes: RouteMeta[]) => void): () => void {
    this.routeCallbacks.add(callback);
    // Return unsubscribe function
    return () => {
      this.routeCallbacks.delete(callback);
    };
  }

  /**
   * Set routes from a configuration source (could be static JSON or server call)
   */
  async setRoutes(routeSource: RouteMeta[] | (() => Promise<RouteMeta[]>)) {
    try {
      if (typeof routeSource === "function") {
        this.routes = await routeSource();
      } else {
        this.routes = routeSource;
      }
      this.notifyRouteChanges();
    } catch (error) {
      console.error("Error setting routes:", error);
      throw error;
    }
  }

  /**
   * Merge routes from multiple sources
   */
  async mergeRoutes(...routeSources: (RouteMeta[] | (() => Promise<RouteMeta[]>))[]) {
    const allRoutes: RouteMeta[] = [];

    for (const source of routeSources) {
      try {
        if (typeof source === "function") {
          const loadedRoutes = await source();
          allRoutes.push(...loadedRoutes);
        } else {
          allRoutes.push(...source);
        }
      } catch (error) {
        console.error("Error loading routes from source:", error);
      }
    }

    this.routes = allRoutes;
    this.notifyRouteChanges();
  }

  /**
   * Get all routes
   */
  getRoutes(): RouteMeta[] {
    return [...this.routes];
  }

  /**
   * Get a specific route by path
   */
  getRoute(path: string): RouteMeta | undefined {
    return this.routes.find((r) => r.path === path);
  }

  /**
   * Notify all subscribers of route changes
   */
  private notifyRouteChanges() {
    this.routeCallbacks.forEach((callback) => callback([...this.routes]));
  }
}
