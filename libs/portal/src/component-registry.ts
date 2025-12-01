import "reflect-metadata";
import { DI } from "./di";
import { DefaultComponentRegistry, FeatureMetadata } from "./registry";
import { Feature as FeatureDecorator, getFeatureMetadata, Module } from "./decorators";

/**
 * Enhanced @Feature decorator that combines:
 * 1. Registration in the component registry (for runtime)
 * 2. Metadata storage (for the parser)
 * 
 * Works as both a decorator and a HOC wrapper.
 * 
 * Usage as decorator:
 * @Feature({
 *   id: "mfe1-home",
 *   label: "MFE1 Home",
 *   icon: "🏠",
 *   description: "Home page of MFE1 module",
 *   path: "/mfe1",
 *   meta: { requiresAuth: false },
 * })
 * class MFE1Home extends React.Component { ... }
 * 
 * Usage as HOC wrapper (functional):
 * export default Feature({
 *   id: "product-list",
 *   path: "/products",
 *   label: "Product List",
 * })(ProductList);
 */
export function Feature(config: Omit<FeatureMetadata, "component" | "sourceFile">) {
  return function decorator(target: any) {
    // Apply metadata using the decorator from decorators.ts
    FeatureDecorator({
      ...config,
      component: target.name || target.displayName || "Unknown",
    })(target);

    // Register in component registry
    const componentId = config.id || target.name || target.displayName || "Unknown";
    DI.resolve(DefaultComponentRegistry).register(
      componentId,
      () => Promise.resolve({ default: target })
    );

    return target;
  };
}

/**
 * Legacy function-based registration (deprecated - use @Feature decorator instead)
 * Kept for backward compatibility
 */
export function registerRemoteComponent<T extends React.ComponentType<any>>(
  name: string,
  component: T
): T {
  // Register in component registry
  DI.resolve(DefaultComponentRegistry).register(name, () =>
    Promise.resolve({ default: component })
  );

  return component;
}

// Re-export decorators
export { Module, Component, Route, Permission, getFeatureMetadata, getModuleMetadata } from "./decorators";

