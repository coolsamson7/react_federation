# JSON Conversion with Classes

## ✅ Fixed: Classes + Decorators + JSON

### The Solution
- **Classes** (required for decorators)
- **`type` field** (REQUIRED in JSON for widget selection)
- **Smart parsing** (creates real class instances from JSON)

### JSON Format

```json
{
  "type": "text",    ← REQUIRED!
  "text": "Hello",
  "fontSize": 18
}
```

The `type` field is used to:
1. Match JSON to widget class (`typeRegistry.parse()`)
2. Select component builder (`widgetFactory.getBuilder()`)

### Example

```typescript
// Parse from JSON - type field is required!
const widget = typeRegistry.parse<TextWidgetData>({
  type: "text",  // ← MUST be present
  text: "Hello from JSON",
  fontSize: 18,
});

// Result: Real TextWidgetData instance with defaults filled
console.log(widget instanceof TextWidgetData);  // true
console.log(widget.type);  // "text"
console.log(widget.color); // "#000000" (from default)
```

### Create vs Parse

```typescript
// Option 1: Create with defaults
const w1 = typeRegistry.create<TextWidgetData>("text");
w1.text = "Hello";

// Option 2: Parse from JSON
const w2 = typeRegistry.parse<TextWidgetData>({
  type: "text",
  text: "Hello",
});

// Both produce real class instances!
```
