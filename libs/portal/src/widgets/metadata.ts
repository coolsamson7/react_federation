import "reflect-metadata";

/**
 * Property descriptor metadata - describes a single property of a widget
 */
export interface PropertyMetadata {
  name: string;
  label?: string;
  group?: string;
  type: string; // "string" | "number" | "boolean" | "object" | custom type
  defaultValue?: any;
  hide?: boolean;
  editor?: string; // Name of custom editor component
  validator?: string; // Name of validator
  required?: boolean;
  options?: string[]; // For select/enum properties
}

/**
 * Widget descriptor metadata - describes a complete widget type
 */
export interface WidgetMetadata {
  name: string; // Unique widget type name
  label?: string;
  group?: string;
  icon?: string;
  properties: Map<string, PropertyMetadata>;
  // Optional rule to decide if a parent can accept a child drop
  acceptChild?: (parent: WidgetData, child: WidgetData) => boolean;
}

/**
 * Base class for all widget data
 * MUST be a class to support decorators
 */
export abstract class WidgetData {
  readonly type: string; // REQUIRED for widget selection
  children: WidgetData[];
  id: string;
  cell?: { row: number; col: number; colSpan?: number; rowSpan?: number }; // Grid positioning with span

  constructor(type: string) {
    this.type = type;
    this.children = [];
    this.id = crypto.randomUUID();
  }

  // Grid span getters/setters for property panel
  get gridColumnSpan(): number {
    return this.cell?.colSpan || 1;
  }
  set gridColumnSpan(value: number) {
    if (this.cell) {
      this.cell.colSpan = value > 1 ? value : undefined;
    }
  }

  get gridRowSpan(): number {
    return this.cell?.rowSpan || 1;
  }
  set gridRowSpan(value: number) {
    if (this.cell) {
      this.cell.rowSpan = value > 1 ? value : undefined;
    }
  }
}

/**
 * Property descriptor - runtime wrapper around property metadata
 */
export class PropertyDescriptor {
  readonly name: string;
  readonly metadata: PropertyMetadata;

  constructor(name: string, metadata: PropertyMetadata) {
    this.name = name;
    this.metadata = metadata;
  }

  get type(): string {
    return this.metadata.type;
  }

  get label(): string {
    return this.metadata.label || this.name;
  }

  get group(): string {
    return this.metadata.group || "general";
  }

  get defaultValue(): any {
    return this.metadata.defaultValue;
  }

  getValue(instance: any): any {
    return instance[this.name];
  }

  setValue(instance: any, value: any): void {
    instance[this.name] = value;
  }

  createDefault(): any {
    if (this.metadata.defaultValue !== undefined) {
      return this.metadata.defaultValue;
    }

    switch (this.type) {
      case "string":
        return "";
      case "number":
        return 0;
      case "boolean":
        return false;
      case "array":
        return [];
      case "object":
        return {};
      default:
        return null;
    }
  }
}

/**
 * Widget descriptor - runtime wrapper around widget metadata
 */
export class WidgetDescriptor {
  readonly name: string;
  readonly metadata: WidgetMetadata;
  readonly widgetClass: new (...args: any[]) => WidgetData;
  readonly properties: Map<string, PropertyDescriptor>;

  constructor(
    name: string,
    metadata: WidgetMetadata,
    widgetClass: new (...args: any[]) => WidgetData
  ) {
    this.name = name;
    this.metadata = metadata;
    this.widgetClass = widgetClass;
    this.properties = new Map();

    // Convert property metadata to descriptors
    metadata.properties.forEach((propMeta, propName) => {
      this.properties.set(propName, new PropertyDescriptor(propName, propMeta));
    });
  }

  get label(): string {
    return this.metadata.label || this.name;
  }

  get group(): string {
    return this.metadata.group || "general";
  }

  get icon(): string {
    return this.metadata.icon || "📦";
  }

  /**
   * Returns true if the parent can accept the given child according to metadata rule.
   * Default: false when no rule is provided.
   */
  canAcceptChild(parent: WidgetData, child: WidgetData): boolean {
    if (typeof this.metadata.acceptChild === "function") {
      try {
        return !!this.metadata.acceptChild(parent, child);
      } catch (e) {
        console.warn(`[WidgetDescriptor] acceptChild threw for ${this.name}:`, e);
        return false;
      }
    }
    return false;
  }

  getProperty(name: string): PropertyDescriptor | undefined {
    return this.properties.get(name);
  }

  getValue(instance: WidgetData, propertyName: string): any {
    const property = this.getProperty(propertyName);
    return property ? property.getValue(instance) : undefined;
  }

  setValue(instance: WidgetData, propertyName: string, value: any): void {
    const property = this.getProperty(propertyName);
    if (property) {
      property.setValue(instance, value);
    }
  }

  /**
   * Create a new instance with default values
   */
  create(): WidgetData {
    // Create instance using constructor
    const instance = new this.widgetClass(this.name);

    // Set default values for all properties
    this.properties.forEach((property) => {
      (instance as any)[property.name] = property.createDefault();
    });

    return instance;
  }

  /**
   * Parse widget data from JSON
   * Creates a proper class instance with all properties
   */
  parse(jsonData: any): WidgetData {
    if (!jsonData.type) {
      throw new Error("JSON data must have a 'type' field");
    }

    if (jsonData.type !== this.name) {
      throw new Error(`Type mismatch: expected '${this.name}', got '${jsonData.type}'`);
    }

    // Create instance using constructor
    const instance = new this.widgetClass(jsonData.type);

    // Restore id and children if provided
    if (jsonData.id) {
      (instance as any).id = jsonData.id;
    }
    if (jsonData.children) {
      instance.children = jsonData.children;
    }

    // Copy all properties from JSON, filling defaults for missing ones
    this.properties.forEach((property) => {
      if (jsonData[property.name] !== undefined) {
        (instance as any)[property.name] = jsonData[property.name];
      } else {
        (instance as any)[property.name] = property.createDefault();
      }
    });

    return instance;
  }
}

// Metadata keys
const WIDGET_METADATA_KEY = Symbol("widget:metadata");
const PROPERTY_METADATA_KEY = Symbol("property:metadata");

/**
 * Store widget metadata on a class
 */
export function setWidgetMetadata(target: any, metadata: WidgetMetadata): void {
  Reflect.defineMetadata(WIDGET_METADATA_KEY, metadata, target);
}

/**
 * Get widget metadata from a class
 */
export function getWidgetMetadata(target: any): WidgetMetadata | undefined {
  return Reflect.getMetadata(WIDGET_METADATA_KEY, target);
}

/**
 * Store property metadata on a class
 */
export function setPropertyMetadata(target: any, propertyKey: string, metadata: PropertyMetadata): void {
  const properties = Reflect.getMetadata(PROPERTY_METADATA_KEY, target) || new Map<string, PropertyMetadata>();
  properties.set(propertyKey, metadata);
  Reflect.defineMetadata(PROPERTY_METADATA_KEY, properties, target);
}

/**
 * Get all property metadata from a class
 */
export function getPropertyMetadata(target: any): Map<string, PropertyMetadata> {
  return Reflect.getMetadata(PROPERTY_METADATA_KEY, target) || new Map<string, PropertyMetadata>();
}
