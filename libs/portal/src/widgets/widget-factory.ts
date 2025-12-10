import React from "react";
import { injectable, singleton } from "tsyringe";
import { WidgetData } from "./metadata";

/**
 * Props passed to widget builder components
 */
export interface WidgetBuilderProps<T extends WidgetData = WidgetData> {
  data: T;
  context?: any; // Application context (forms, state, etc.)
  edit?: boolean; // Whether in edit mode
}

/**
 * Base class for widget builder components
 */
export abstract class WidgetBuilder<T extends WidgetData = WidgetData> extends React.Component<
  WidgetBuilderProps<T>
> {
  abstract render(): React.ReactNode;
}

/**
 * Factory that maps widget types to their React components (theme)
 * Similar to Dart's WidgetFactory
 */
@injectable()
@singleton()
export class WidgetFactory {
  private builders = new Map<string, typeof WidgetBuilder>();
  private editBuilders = new Map<string, typeof WidgetBuilder>();

  /**
   * Register a widget builder for runtime rendering
   */
  register(typeName: string, builder: typeof WidgetBuilder, edit: boolean = false): void {
    if (edit) {
      this.editBuilders.set(typeName, builder);
      console.log(`[WidgetFactory] Registered edit builder for: ${typeName}`);
    } else {
      this.builders.set(typeName, builder);
      console.log(`[WidgetFactory] Registered builder for: ${typeName}`);
    }
  }

  /**
   * Get builder for a widget type
   */
  getBuilder(typeName: string, edit: boolean = false): typeof WidgetBuilder | undefined {
    return edit ? this.editBuilders.get(typeName) : this.builders.get(typeName);
  }

  /**
   * Check if a builder exists for a widget type
   */
  has(typeName: string, edit: boolean = false): boolean {
    return edit ? this.editBuilders.has(typeName) : this.builders.has(typeName);
  }

  /**
   * Get all registered widget type names
   */
  getTypeNames(edit: boolean = false): string[] {
    return Array.from(edit ? this.editBuilders.keys() : this.builders.keys());
  }
}

// Global registry for pending builder registrations
const pendingBuilders: Array<{ typeName: string; builder: typeof WidgetBuilder; edit: boolean }> = [];

/**
 * Decorator to automatically register a widget builder
 * Usage: @RegisterBuilder("text", false)
 */
export function RegisterBuilder(typeName: string, edit: boolean = false) {
  return function <T extends typeof WidgetBuilder>(constructor: T): T {
    // Store registration info for later initialization
    pendingBuilders.push({ typeName, builder: constructor, edit });
    console.log(`[RegisterBuilder] Queued registration for: ${typeName} (edit: ${edit})`);
    return constructor;
  };
}

/**
 * Initialize all pending builder registrations
 * Call this once during app startup
 */
export function initializeWidgetBuilders(factory: WidgetFactory): void {
  console.log(`[WidgetFactory] Initializing ${pendingBuilders.length} builders...`);

  for (const { typeName, builder, edit } of pendingBuilders) {
    factory.register(typeName, builder, edit);
  }

  pendingBuilders.length = 0; // Clear the queue
  console.log(`[WidgetFactory] Initialization complete`);
}
