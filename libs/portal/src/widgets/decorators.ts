import "reflect-metadata";
import {
  WidgetMetadata,
  PropertyMetadata,
  setWidgetMetadata,
  setPropertyMetadata,
  getPropertyMetadata,
} from "./metadata";

/**
 * Options for @DeclareWidget decorator
 */
export interface DeclareWidgetOptions {
  name: string;
  label?: string;
  group?: string;
  icon?: string;
}

/**
 * Options for @DeclareProperty decorator
 */
export interface DeclarePropertyOptions {
  label?: string;
  group?: string;
  type?: string;
  defaultValue?: any;
  hide?: boolean;
  editor?: string;
  validator?: string;
  required?: boolean;
}

/**
 * Decorator to declare a widget class
 * Usage: @DeclareWidget({ name: "text", label: "Text Widget", icon: "📝" })
 */
export function DeclareWidget(options: DeclareWidgetOptions) {
  return function <T extends { new (...args: any[]): any }>(constructor: T) {
    // Collect all property metadata from decorated properties
    const properties = getPropertyMetadata(constructor.prototype);

    const metadata: WidgetMetadata = {
      name: options.name,
      label: options.label,
      group: options.group,
      icon: options.icon,
      properties,
    };

    // Store metadata on the class
    setWidgetMetadata(constructor, metadata);

    return constructor;
  };
}

/**
 * Decorator to declare a widget property
 * Usage: @DeclareProperty({ label: "Text Content", group: "content", type: "string" })
 */
export function DeclareProperty(options: DeclarePropertyOptions = {}) {
  return function (target: any, propertyKey: string) {
    // Infer type from TypeScript metadata if not explicitly provided
    const designType = Reflect.getMetadata("design:type", target, propertyKey);
    const inferredType = inferTypeFromDesignType(designType);

    const metadata: PropertyMetadata = {
      name: propertyKey,
      label: options.label,
      group: options.group || "general",
      type: options.type || inferredType,
      defaultValue: options.defaultValue,
      hide: options.hide || false,
      editor: options.editor,
      validator: options.validator,
      required: options.required,
    };

    setPropertyMetadata(target, propertyKey, metadata);
  };
}

/**
 * Helper to infer basic type from TypeScript design:type metadata
 */
function inferTypeFromDesignType(designType: any): string {
  if (!designType) return "any";

  switch (designType.name) {
    case "String":
      return "string";
    case "Number":
      return "number";
    case "Boolean":
      return "boolean";
    case "Array":
      return "array";
    case "Object":
      return "object";
    default:
      return designType.name || "any";
  }
}
