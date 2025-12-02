import "reflect-metadata";
import { FeatureMetadata, ModuleMetadata } from "./registry";

// Global metadata storage
const FEATURE_METADATA_KEY = Symbol("feature:metadata");
const MODULE_METADATA_KEY = Symbol("module:metadata");

/**
 * Get stored feature metadata
 */
export function getFeatureMetadata(target: any): FeatureMetadata | undefined {
  return Reflect.getMetadata(FEATURE_METADATA_KEY, target);
}

/**
 * Get stored module metadata
 */
export function getModuleMetadata(target: any): ModuleMetadata | undefined {
  return Reflect.getMetadata(MODULE_METADATA_KEY, target);
}

/**
 * Feature decorator for marking and configuring feature components
 *
 * Usage:
 * @Feature({
 *   id: "product-list",
 *   icon: "📦",
 *   description: "Product list",
 *   path: "/products",
 *   component: "ProductList",
 *   tags: ["products"],
 *   permissions: ["product:read"],
 *   features: [],
 *   visibility: ["public"],
 * })
 * export class ProductListFeature {}
 */
export function Feature(config: Omit<FeatureMetadata, "sourceFile">) {
  return function decorator(target: any) {
    const metadata: FeatureMetadata = {
      ...config,
      sourceFile: target.name,
    };

    Reflect.defineMetadata(FEATURE_METADATA_KEY, metadata, target);
    return target;
  };
}

/**
 * Module decorator for marking and configuring module metadata
 *
 * Usage:
 * @Module({
 *   id: "product-module",
 *   label: "Product Management",
 *   version: "1.0.0",
 *   remote: {
 *     url: "http://localhost:3001/remoteEntry.js",
 *     scope: "productModule",
 *     module: "./Module",
 *   },
 * })
 * export class ProductModule {}
 */
export function Module(config: Omit<ModuleMetadata, "sourceFile">) {
  return function decorator(target: any) {
    const metadata: ModuleMetadata = {
      ...config,
      sourceFile: target.name,
    };

    Reflect.defineMetadata(MODULE_METADATA_KEY, metadata, target);
    return target;
  };
}

/**
 * Component decorator for marking components within a feature
 * This is used to identify which components are exportable from a module
 *
 * Usage:
 * @Component()
 * export class ProductList extends React.Component {}
 */
export function Component() {
  return function decorator(target: any) {
    Reflect.defineMetadata("component:marked", true, target);
    return target;
  };
}

/**
 * Route decorator for marking route definitions
 *
 * Usage:
 * @Route()
 * export const productRoutes = [
 *   { path: "/products", component: "ProductList" }
 * ];
 */
export function Route() {
  return function decorator(target: any) {
    Reflect.defineMetadata("route:marked", true, target);
    return target;
  };
}

/**
 * Permission decorator for marking permission requirements
 *
 * Usage:
 * @Permission("product:read", "product:write")
 * export class ProductManager {}
 */
export function Permission(...permissions: string[]) {
  return function decorator(target: any) {
    Reflect.defineMetadata("permissions", permissions, target);
    return target;
  };
}
