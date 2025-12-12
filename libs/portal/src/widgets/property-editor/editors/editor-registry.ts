/**
 * Central place to import all property editors
 * Ensures decorators are executed at module load time
 */

import "./string-editor";
import "./int-editor";
import "./color-editor";
import "./font-weight-editor";
import "./text-align-editor";
import "./padding-editor";
import "./select-editor";
import "./grid-template-editor";
import "../grid-items-editor";

console.log("[EditorRegistry] All property editor modules loaded");
