/**
 * Central place to import all property editors
 * Ensures decorators are executed at module load time
 */

import "./string-editor";
import "./int-editor";

console.log("[EditorRegistry] All property editor modules loaded");
