import { InputEditor } from "./input-editor-metadata";

/**
 * Registry for input editors
 * Maps type descriptors to editor components
 */
export class InputEditorRegistry {
  private editors = new Map<string, typeof InputEditor>();

  /**
   * Register an input editor for a type
   */
  register(type: string, editor: typeof InputEditor): void {
    this.editors.set(type, editor);
    console.log(`[InputEditorRegistry] Registered editor for: ${type}`);
  }

  /**
   * Get editor for a type
   */
  getEditor(type: string): typeof InputEditor | undefined {
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

// Global registry instance
export const inputEditorRegistry = new InputEditorRegistry();

// Global pending editors
const pendingEditors: Array<{ type: string; editor: typeof InputEditor }> = [];

/**
 * Decorator to register an input editor
 */
export function RegisterInputEditor(type: string) {
  return function <T extends typeof InputEditor>(constructor: T): T {
    pendingEditors.push({ type, editor: constructor });
    console.log(`[RegisterInputEditor] Queued registration for: ${type}`);
    return constructor;
  };
}

/**
 * Initialize all pending input editors
 */
export function initializeInputEditors(): void {
  console.log(`[InputEditorRegistry] Initializing ${pendingEditors.length} editors...`);

  for (const { type, editor } of pendingEditors) {
    inputEditorRegistry.register(type, editor);
  }

  pendingEditors.length = 0;
  console.log(`[InputEditorRegistry] Initialization complete`);
}
