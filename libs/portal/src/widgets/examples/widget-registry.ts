/**
 * Central place to import all widget data and builder classes
 * This ensures decorators are executed at module load time
 */

// Import widget data classes (triggers @DeclareWidget and @AutoRegisterWidget)
import "./text-widget-data";
import "./list-widget-data";
import "./cube-widget-data";
import "./grid-widget-data";

// Import widget builders (triggers @RegisterBuilder)
import "./text-widget-builder";
import "./list-widget-builder";
import "./cube-widget-builder";
import "./grid-widget-builder";

console.log("[WidgetRegistry] All widget modules loaded");
