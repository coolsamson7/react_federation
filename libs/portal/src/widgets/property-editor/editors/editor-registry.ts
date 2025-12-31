/**
 * Central place to import all property editors
 * Ensures decorators are executed at module load time
 */

import "./string-editor";
import "./int-editor";
import "./boolean-editor";
import "./color-editor";
import "./font-weight-editor";
import "./text-align-editor";
import "./padding-editor";
import "./select-editor";
import "./grid-template-editor";
import "./span-editor";
import "./query-model-editor";
import "./query-expression-editor";
import "./cube-widget-configuration-editor";
import "../grid-items-editor";
import "../../search-panel/search-panel-property-editor";

console.log("[EditorRegistry] All property editor modules loaded");
