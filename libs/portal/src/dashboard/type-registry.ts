import { injectable, singleton } from "tsyringe";
import { WidgetDescriptor, WidgetData, getWidgetMetadata } from "./metadata";

// Global registry for pending widget registrations
const pendingWidgets: Array<new (...args: any[]) => WidgetData> = [];

/**
 * Central registry for all widget types and their metadata
 * Similar to Dart's TypeRegistry
 */
@injectable()
@singleton()
export class TypeRegistry {
  private descriptors = new Map<string, WidgetDescriptor>();
  private descriptorsByClass = new Map<any, WidgetDescriptor>();

  /**
   * Register a widget class with its metadata
   */
  register(widgetClass: new (...args: any[]) => WidgetData): void {
    const metadata = getWidgetMetadata(widgetClass);

    if (!metadata) {
      throw new Error(
        `Widget class ${widgetClass.name} is not decorated with @DeclareWidget`
      );
    }

    const descriptor = new WidgetDescriptor(metadata.name, metadata, widgetClass);

    this.descriptors.set(metadata.name, descriptor);
    this.descriptorsByClass.set(widgetClass, descriptor);

    console.log(`[TypeRegistry] Registered widget: ${metadata.name}`);
  }

  /**
   * Get descriptor by widget type name
   */
  getDescriptor(typeName: string): WidgetDescriptor | undefined {
    return this.descriptors.get(typeName);
  }

  /**
   * Get descriptor by widget data instance
   */
  getDescriptorForInstance(data: WidgetData): WidgetDescriptor | undefined {
    return this.descriptors.get(data.type);
  }

  /**
   * Get descriptor by widget class
   */
  getDescriptorForClass(widgetClass: any): WidgetDescriptor | undefined {
    return this.descriptorsByClass.get(widgetClass);
  }

  /**
   * Get all registered widget descriptors
   */
  getAllDescriptors(): WidgetDescriptor[] {
    return Array.from(this.descriptors.values());
  }

  /**
   * Parse widget data from JSON
   */
  parse<T extends WidgetData>(data: any): T {
    const typeName = data.type;

    if (!typeName) {
      throw new Error("Widget data must have a 'type' field");
    }

    const descriptor = this.getDescriptor(typeName);

    if (!descriptor) {
      throw new Error(`Unknown widget type: ${typeName}`);
    }

    // Recursively parse children
    if (data.children && Array.isArray(data.children)) {
      data.children = data.children.map((child: any) => this.parse(child));
    }

    return descriptor.parse(data) as T;
  }

  /**
   * Create a new widget instance with default values
   */
  create<T extends WidgetData>(typeName: string): T {
    const descriptor = this.getDescriptor(typeName);

    if (!descriptor) {
      throw new Error(`Unknown widget type: ${typeName}`);
    }

    return descriptor.create() as T;
  }

  /**
   * Check if a widget type is registered
   */
  has(typeName: string): boolean {
    return this.descriptors.has(typeName);
  }

  /**
   * Get all registered widget type names
   */
  getTypeNames(): string[] {
    return Array.from(this.descriptors.keys());
  }
}

/**
 * Decorator to automatically register widget data classes
 * Works in conjunction with @DeclareWidget
 */
export function AutoRegisterWidget() {
  return function <T extends new (...args: any[]) => WidgetData>(constructor: T): T {
    pendingWidgets.push(constructor);
    console.log(`[AutoRegisterWidget] Queued registration for: ${constructor.name}`);
    return constructor;
  };
}

/**
 * Initialize all pending widget registrations
 * Call this once during app startup
 */
export function initializeWidgetTypes(registry: TypeRegistry): void {
  console.log(`[TypeRegistry] Initializing ${pendingWidgets.length} widget types...`);

  for (const widgetClass of pendingWidgets) {
    registry.register(widgetClass);
  }

  pendingWidgets.length = 0; // Clear the queue
  console.log(`[TypeRegistry] Initialization complete`);
}
