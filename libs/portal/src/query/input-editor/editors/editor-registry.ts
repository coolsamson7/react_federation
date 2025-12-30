/**
 * Central place to import all input editors
 * Ensures decorators are executed at module load time
 */

import "./string-input-editor";
import "./number-input-editor";
import "./int-input-editor";
import "./date-input-editor";
import "./boolean-input-editor";

console.log("[InputEditorRegistry] All input editor modules loaded");
