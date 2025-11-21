import { singleton } from "tsyringe";

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
