# Recursive Children Parsing

## ✅ Children Property

The `WidgetData` base class has a `children` property:

```typescript
export abstract class WidgetData {
  readonly type: string;
  children: WidgetData[];  // ← For nested widgets
  id: string;

  constructor(type: string) {
    this.type = type;
    this.children = [];
    this.id = crypto.randomUUID();
  }
}
```

## Recursive Parsing

The `TypeRegistry.parse()` method automatically handles nested children:

```typescript
parse<T extends WidgetData>(data: any): T {
  // ...validate type...

  // Recursively parse children
  if (data.children && Array.isArray(data.children)) {
    data.children = data.children.map((child: any) => this.parse(child));
  }

  return descriptor.parse(data) as T;
}
```

## Example: List Widget

### JSON with Nested Children

```json
{
  "type": "list",
  "gap": "16px",
  "children": [
    {
      "type": "text",
      "text": "Header",
      "fontSize": 24
    },
    {
      "type": "list",
      "gap": "8px",
      "children": [
        {
          "type": "text",
          "text": "Nested item 1"
        },
        {
          "type": "text",
          "text": "Nested item 2"
        }
      ]
    }
  ]
}
```

### Parse Automatically

```typescript
// One call parses entire tree recursively!
const listWidget = typeRegistry.parse<ListWidgetData>(jsonData);

// All children are proper class instances
listWidget.children[0] instanceof TextWidgetData;  // true
listWidget.children[1] instanceof ListWidgetData;  // true
listWidget.children[1].children[0] instanceof TextWidgetData;  // true
```

### Render with WidgetRenderer

```typescript
@RegisterBuilder("list", false)
export class ListWidgetBuilder extends WidgetBuilder<ListWidgetData> {
  render() {
    const { data } = this.props;
    
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: data.gap }}>
        {data.children.map((child) => (
          <WidgetRenderer
            key={child.id}
            data={child}  // ← Recursively renders nested widgets
            typeRegistry={typeRegistry}
            widgetFactory={widgetFactory}
          />
        ))}
      </div>
    );
  }
}
```

## How It Works

1. **JSON arrives** with nested children structure
2. **TypeRegistry.parse()** is called on root
3. **Children detected** - `parse()` calls itself for each child
4. **Recursive descent** - builds entire widget tree
5. **Result** - All widgets are proper class instances with correct types
6. **Rendering** - WidgetRenderer recursively renders children

This matches your Dart implementation!
