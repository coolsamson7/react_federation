import { injectable, singleton } from "tsyringe";
import { PropertyEditor } from "./property-editor-metadata";

/**
 * Registry for property editors
 * Maps property types to editor components
 */
@injectable()
@singleton()
export class PropertyEditorRegistry {
  private editors = new Map<string, typeof PropertyEditor>();

  /**
   * Register a property editor for a type
   */
  register(type: string, editor: typeof PropertyEditor): void {
    this.editors.set(type, editor);
    console.log(`[PropertyEditorRegistry] Registered editor for: ${type}`);
  }

  /**
   * Get editor for a property type
   */
  getEditor(type: string): typeof PropertyEditor | undefined {
    return this.editors.get(type);
  }

  /**
   * Check if editor exists for type
   */
  has(type: string): boolean {
    return this.editors.has(type);
  }

  /**
   * Get all registered types
   */
  getTypes(): string[] {
    return Array.from(this.editors.keys());
  }
}

// Global pending editors
const pendingEditors: Array<{ type: string; editor: typeof PropertyEditor }> = [];

/**
 * Decorator to register a property editor
 */
export function RegisterPropertyEditor(type: string) {
  return function <T extends typeof PropertyEditor>(constructor: T): T {
    pendingEditors.push({ type, editor: constructor });
    console.log(`[RegisterPropertyEditor] Queued registration for: ${type}`);
    return constructor;
  };
}

/**
 * Initialize all pending property editors
 */
export function initializePropertyEditors(registry: PropertyEditorRegistry): void {
  console.log(`[PropertyEditorRegistry] Initializing ${pendingEditors.length} editors...`);

  for (const { type, editor } of pendingEditors) {
    registry.register(type, editor);
  }

  pendingEditors.length = 0;
  console.log(`[PropertyEditorRegistry] Initialization complete`);
}
