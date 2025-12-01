import "reflect-metadata";
import { DI } from "./di";
import { DefaultComponentRegistry } from "./registry";

/**
 * Register a component in the remote registry
 * 
 * Usage:
 * const MFE1Home = registerRemoteComponent("MFE1Home", function MFE1Home() {
 *   return <div>Component</div>;
 * });
 * 
 * Or simpler - use it as a wrapper:
 * export default registerRemoteComponent("MFE1Home", MFE1Home);
 */
export function registerRemoteComponent<T extends React.ComponentType<any>>(
  name: string,
  component: T
): T {
  // Register immediately
  DI.resolve(DefaultComponentRegistry).register(name, () =>
    Promise.resolve({ default: component })
  );

  return component;
}

/**
 * Class-based component registration (for those using class components)
 */
export function RemoteComponent(name: string) {
  return function decorator(target: any) {
    // Register immediately
    DI.resolve(DefaultComponentRegistry).register(name, () =>
      Promise.resolve({ default: target })
    );

    return target;
  };
}

