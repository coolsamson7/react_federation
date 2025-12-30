import { InputEditor } from "./input-editor-metadata";
import { Type } from "@portal/validation";

/**
 * Registry for input editors
 * Maps type descriptors to editor components
 * Supports both:
 * 1. Type instances (e.g., string("name").email()) -> specific editor
 * 2. String-based type names (e.g., "string", "number") -> default editor
 */
export class InputEditorRegistry {
  private editors = new Map<string, typeof InputEditor>();
  private typeEditors = new Map<Type<any>, typeof InputEditor>();

  /**
   * Register an input editor for a string-based type (default fallback)
   * @param type Type name string (e.g., "string", "number", "date")
   * @param editor Editor component class
   */
  register(type: string, editor: typeof InputEditor): void {
    this.editors.set(type, editor);
    console.log(`[InputEditorRegistry] Registered editor for: ${type}`);
  }

  /**
   * Register an input editor for a specific Type instance
   * @param type Type instance (e.g., string("name").email())
   * @param editor Editor component class
   */
  registerForType(type: Type<any>, editor: typeof InputEditor): void {
    this.typeEditors.set(type, editor);
    console.log(`[InputEditorRegistry] Registered editor for Type instance: ${type.name}`);
  }

  /**
   * Get editor for a type (with fallback logic)
   * Priority:
   * 1. Specific Type instance editor (if passed and registered)
   * 2. String-based type name editor (fallback to base type)
   * 3. Undefined (no editor found)
   */
  getEditor(type: string | Type<any>): typeof InputEditor | undefined {
    // If Type instance is passed
    if (typeof type !== "string" && type instanceof Object && "name" in type) {
      const typeInstance = type as Type<any>;
      
      // First, try to find editor registered for this specific Type instance
      if (this.typeEditors.has(typeInstance)) {
        return this.typeEditors.get(typeInstance);
      }

      // Fallback: get base type name and look up string-based editor
      const baseTypeName = this.getBaseTypeName(typeInstance);
      if (baseTypeName) {
        return this.editors.get(baseTypeName);
      }

      return undefined;
    }

    // String-based lookup (legacy)
    return this.editors.get(type as string);
  }

  /**
   * Get the base type name from a Type instance
   * E.g., string("customerName") -> "string"
   * Looks at the Type's constructor/class name to determine its base type
   */
  private getBaseTypeName(type: Type<any>): string | undefined {
    // Get the class/constructor name of the type
    const className = type.constructor.name;
    
    // Map class names to base type strings (handling various naming conventions)
    const baseTypeMap: Record<string, string> = {
      StringConstraint: "string",
      StringType: "string",
      NumberType: "number",
      IntegerType: "integer",
      DateConstraint: "date",
      DateType: "date",
      BooleanConstraint: "boolean",
      BooleanType: "boolean",
      ObjectType: "object",
      ArrayType: "array",
    };

    // First try exact class name match
    if (baseTypeMap[className]) {
      return baseTypeMap[className];
    }

    // Fallback: try using the name property (custom name given to type)
    // and attempt to infer base type from it
    const customName = (type as any).name;
    if (customName && typeof customName === 'string') {
      // Check if it matches common base type names
      const lowerName = customName.toLowerCase();
      if (lowerName === 'string' || lowerName === 'text') return 'string';
      if (lowerName === 'number' || lowerName === 'float') return 'number';
      if (lowerName === 'integer' || lowerName === 'int') return 'integer';
      if (lowerName === 'boolean' || lowerName === 'bool') return 'boolean';
      if (lowerName === 'date' || lowerName === 'datetime') return 'date';
    }

    // Last resort: return undefined if we can't determine the base type
    return undefined;
  }

  /**
   * Check if editor exists for type
   */
  has(type: string | Type<any>): boolean {
    if (typeof type === "string") {
      return this.editors.has(type);
    }
    
    const typeInstance = type as Type<any>;
    if (this.typeEditors.has(typeInstance)) {
      return true;
    }

    const baseTypeName = this.getBaseTypeName(typeInstance);
    return baseTypeName ? this.editors.has(baseTypeName) : false;
  }

  /**
   * Get all registered string-based type names
   */
  getTypes(): string[] {
    return Array.from(this.editors.keys());
  }

  /**
   * Get all registered Type instances
   */
  getRegisteredTypeInstances(): Type<any>[] {
    return Array.from(this.typeEditors.keys());
  }
}


// Global registry instance
export const inputEditorRegistry = new InputEditorRegistry();

// Global pending editors
const pendingEditors: Array<{ type: string | Type<any>; editor: typeof InputEditor }> = [];

/**
 * Decorator to register an input editor
 * Supports both string-based type names and Type instances
 * 
 * @example
 * // String-based (default fallback)
 * @RegisterInputEditor("string")
 * export class StringInputEditor extends InputEditor { }
 * 
 * @example
 * // Type instance (specific editor for constrained type)
 * @RegisterInputEditor(string("email").email())
 * export class EmailInputEditor extends InputEditor { }
 */
export function RegisterInputEditor(type: string | Type<any>) {
  return function <T extends typeof InputEditor>(constructor: T): T {
    pendingEditors.push({ type, editor: constructor });
    const typeDesc = typeof type === "string" ? type : (type as Type<any>).name;
    console.log(`[RegisterInputEditor] Queued registration for: ${typeDesc}`);
    return constructor;
  };
}

/**
 * Initialize all pending input editors
 */
export function initializeInputEditors(): void {
  console.log(`[InputEditorRegistry] Initializing ${pendingEditors.length} editors...`);

  for (const { type, editor } of pendingEditors) {
    if (typeof type === "string") {
      inputEditorRegistry.register(type, editor);
    } else {
      inputEditorRegistry.registerForType(type, editor);
    }
  }

  pendingEditors.length = 0;
  console.log(`[InputEditorRegistry] Initialization complete`);
}

