import { singleton } from "tsyringe";

/**
 * Remote module configuration
 */
export interface RemoteConfig {
  url: string;
  scope: string;
  module: string;
}

/**
 * Base metadata interface
 */
export interface Metadata {
  id: string;
  label?: string;
  icon?: string;
  description?: string;
  sourceFile?: string;
}

/**
 * Module metadata with features and permissions
 */
export interface ModuleMetadata extends Metadata {
  remote?: RemoteConfig;
  version: string;
  features?: FeatureMetadata[];
  permissions?: string[];
  moduleName?: string;
}

/**
 * Feature metadata for individual components
 */
export interface FeatureMetadata extends Metadata {
  module?: ModuleMetadata;
  permissions?: string[];
  tags?: string[];
  features?: string[];
  visibility?: ("public" | "private")[];
  component: string;
  path: string;
  children?: FeatureMetadata[];
}

/**
 * Interface for the component registry
 */
export interface ComponentRegistry {
  register(name: string, loader: () => Promise<any>): void;
  get(name: string): () => Promise<any>;
}

/**
 * Default singleton implementation
 */
@singleton()
export class DefaultComponentRegistry implements ComponentRegistry {
  private map = new Map<string, () => Promise<any>>();

  register(name: string, loader: () => Promise<any>) {
    this.map.set(name, loader);
  }

  get(name: string) {
    const loader = this.map.get(name);
    if (!loader) {
      throw new Error(`Component ${name} not found in registry`);
    }
    return loader;
  }
}
