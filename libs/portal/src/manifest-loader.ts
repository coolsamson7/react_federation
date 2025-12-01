import { singleton } from "tsyringe";

export interface MFEManifest {
  name: string;
  version?: string;
  routes: Array<{
    path: string;
    component: string;
    label?: string;
  }>;
}

@singleton()
export class ManifestLoader {
  private manifests: Map<string, MFEManifest> = new Map();
  private loadingPromises: Map<string, Promise<MFEManifest>> = new Map();

  /**
   * Load manifest from a single remote via HTTP
   */
  async loadManifest(remoteName: string, remoteUrl: string): Promise<MFEManifest> {
    // Return cached manifest if already loaded
    if (this.manifests.has(remoteName)) {
      return this.manifests.get(remoteName)!;
    }

    // Return existing loading promise if already in progress
    if (this.loadingPromises.has(remoteName)) {
      return this.loadingPromises.get(remoteName)!;
    }

    // Create new loading promise
    const loadPromise = this._loadManifest(remoteName, remoteUrl);
    this.loadingPromises.set(remoteName, loadPromise);

    try {
      const manifest = await loadPromise;
      this.manifests.set(remoteName, manifest);
      return manifest;
    } finally {
      this.loadingPromises.delete(remoteName);
    }
  }

  /**
   * Load manifests from multiple remotes
   */
  async loadManifests(
    remotes: Array<{ name: string; url: string }>
  ): Promise<MFEManifest[]> {
    const promises = remotes.map((remote) =>
      this.loadManifest(remote.name, remote.url).catch((error) => {
        console.warn(`Failed to load manifest for ${remote.name}:`, error);
        // Return empty manifest on error
        return {
          name: remote.name,
          routes: [],
        };
      })
    );

    return Promise.all(promises);
  }

  /**
   * Internal method to load manifest from remote HTTP endpoint
   */
  private async _loadManifest(
    remoteName: string,
    remoteUrl: string
  ): Promise<MFEManifest> {
    try {
      // Extract base URL from remoteEntry.js URL
      const baseUrl = remoteUrl.replace(/remoteEntry\.js$/, "");
      const manifestUrl = `${baseUrl}manifest.json`;

      console.log(`Loading manifest from: ${manifestUrl}`);

      const response = await fetch(manifestUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const manifest = await response.json();
      return manifest;
    } catch (error) {
      console.error(`Error loading manifest from ${remoteName}:`, error);
      throw new Error(`Failed to load manifest for ${remoteName}: ${error}`);
    }
  }

  /**
   * Get cached manifest
   */
  getManifest(remoteName: string): MFEManifest | undefined {
    return this.manifests.get(remoteName);
  }

  /**
   * Get all cached manifests
   */
  getAllManifests(): MFEManifest[] {
    return Array.from(this.manifests.values());
  }
}

