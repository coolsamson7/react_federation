# Widget Rendering System

A decorator-based dynamic widget rendering engine for React/TypeScript, inspired by Flutter's widget system.

## Key Features

- **Decorator-based auto-registration** - No manual registration needed
- **Class-based components** - Full React component lifecycle
- **Metadata-driven** - Property descriptors with types, defaults, validators
- **Theme support** - Separate runtime and edit mode builders
- **JSON serialization** - Parse widgets from JSON
- **DI integration** - Uses tsyringe for dependency injection

## Quick Start

### 1. Define Widget Data

```typescript
@DeclareWidget({
  name: "text",
  label: "Text Widget",
  icon: "📝",
})
@AutoRegisterWidget()
export class TextWidgetData extends WidgetData {
  @DeclareProperty({ label: "Text Content", type: "string" })
  text: string;

  @DeclareProperty({ label: "Font Size", type: "number", defaultValue: 16 })
  fontSize?: number;

  constructor(params: Partial<TextWidgetData> & { text: string }) {
    super("text");
    this.text = params.text;
    this.fontSize = params.fontSize;
  }
}
```

### 2. Create Widget Builder

```typescript
@RegisterBuilder("text", false) // runtime mode
export class TextWidgetBuilder extends WidgetBuilder<TextWidgetData> {
  render() {
    const { data } = this.props;
    return (
      <div style={{ fontSize: `${data.fontSize}px` }}>
        {data.text}
      </div>
    );
  }
}

@RegisterBuilder("text", true) // edit mode
export class TextWidgetEditBuilder extends WidgetBuilder<TextWidgetData> {
  render() {
    const { data } = this.props;
    return (
      <div style={{ border: "1px dashed #ccc" }}>
        {data.text}
      </div>
    );
  }
}
```

### 3. Initialize and Render

```typescript
import { container } from "tsyringe";
import { TypeRegistry, initializeWidgetTypes } from "./type-registry";
import { WidgetFactory, initializeWidgetBuilders } from "./widget-factory";
import { WidgetRenderer } from "./widget-renderer";

// Import widget files to trigger decorator registration
import "./examples/text-widget-data";
import "./examples/text-widget-builder";

// Initialize once at app startup
const typeRegistry = container.resolve(TypeRegistry);
const widgetFactory = container.resolve(WidgetFactory);

initializeWidgetTypes(typeRegistry);
initializeWidgetBuilders(widgetFactory);

// Create and render widgets
const widget = new TextWidgetData({
  text: "Hello World",
  fontSize: 24,
});

<WidgetRenderer
  data={widget}
  typeRegistry={typeRegistry}
  widgetFactory={widgetFactory}
/>
```

## Architecture

### Components

- **WidgetData** - Base class for widget data
- **PropertyDescriptor** - Describes a single property
- **WidgetDescriptor** - Describes a complete widget type
- **TypeRegistry** - Registry for widget types (uses DI)
- **WidgetFactory** - Maps types to React components (uses DI)
- **WidgetBuilder** - Base class for widget renderers
- **WidgetRenderer** - Dynamic rendering component

### Decorators

- `@DeclareWidget` - Declares a widget class with metadata
- `@DeclareProperty` - Declares a property with metadata
- `@AutoRegisterWidget` - Auto-registers widget in TypeRegistry
- `@RegisterBuilder` - Auto-registers builder in WidgetFactory

## Example: JSON Parsing

```typescript
const jsonData = {
  type: "text",
  text: "From JSON",
  fontSize: 18,
};

const widget = typeRegistry.parse<TextWidgetData>(jsonData);
```

## Example: Default Values

```typescript
const widget = typeRegistry.create<TextWidgetData>("text");
// Creates widget with all default values
```

## Comparison to Dart Implementation

| Dart | TypeScript |
|------|-----------|
| `@DeclareWidget` annotation | `@DeclareWidget` decorator |
| `@DeclareProperty` annotation | `@DeclareProperty` decorator |
| `TypeRegistry` with `@Injectable` | `TypeRegistry` with `@injectable` |
| `WidgetFactory` with `@Injectable` | `WidgetFactory` with `@injectable` |
| `WidgetBuilder` abstract class | `WidgetBuilder` abstract class |
| Auto-registration in `@OnInit` | Auto-registration via decorators + init functions |
| `create()` for defaults | `create()` for defaults |
| `parse()` from JSON | `parse()` from JSON |

