# SearchPanel Widget

Ein vollständig integrierter Widget-Typ für das Widget Editor System mit:
- **Daten-Klasse** (`SearchPanelWidgetData`)
- **React Context** für Konfigurationsfreigabe
- **Compact Property Editor** für die Eigenschafts-Panel (begrenzte Horizontal-Breite)
- **Full Editor Dialog** für detaillierte Konfiguration
- **Runtime Builder** zum Rendern der SearchPanel-Komponente
- **Edit Mode Builder** zum Darstellen im Widget Editor

## Architektur

```
SearchPanelWidgetData
├─ Datenspeicher (title, searchModel, predefinedQuery, ...)
├─ @DeclareWidget Decorator (Registrierung)
└─ @DeclareProperty Decorator (für jede Property)

SearchPanelContext
├─ Konfiguration verteilen
└─ onConfigChange Callback

SearchPanelCompactEditor (Property Panel)
├─ Model Name Input
├─ Collapsible "Search Criteria" Section
├─ Collapsible "Predefined Query" Section
└─ "Expand to Full Editor" Button

SearchPanelFullEditor (Modal Dialog)
├─ Tabs: "Search Model" | "Predefined Query"
├─ SearchModelDefinition (mit Type Constraints)
└─ QueryExpression Builder (TODO)

SearchPanelPropertyEditor (Property Editor Registration)
├─ Integrated mit Property Panel System
└─ Öffnet Full Editor als Modal

SearchPanelWidgetBuilder
├─ Runtime: Rendert ChipSearchPanel mit Constraints
└─ Edit Mode: Zeigt Placeholder mit Metadata
```

## Integration

### 1. Widget registrieren
Die Registrierung erfolgt automatisch durch:
- `@DeclareWidget` in `search-panel-widget-data.ts`
- `@AutoRegisterWidget` Decorator
- Import in `widget-registry.ts`

### 2. Property Editor registrieren
- `@RegisterPropertyEditor("searchPanelConfiguration")` in `search-panel-property-editor.tsx`
- Import in `editor-registry.ts`

### 3. Builder registrieren
- `@RegisterBuilder("search-panel", false)` für Runtime
- `@RegisterBuilder("search-panel", true)` für Edit Mode
- Automatisch importiert in `widget-registry.ts`

## Usage

### Im Widget Editor hinzufügen:
1. Palette öffnen → "Query" Gruppe
2. "Search Panel" Widget ziehen
3. Properties Panel: SearchPanel konfigurieren
   - Compact Editor: Model Name, kurze Überblicke
   - "Expand to Full Editor" Button: Detaillierte Konfiguration

### Programmisch:
```typescript
const data = new SearchPanelWidgetData();
data.title = "Customer Search";
data.searchModel = {
  name: "customers",
  criteria: [...],
};

// Im WidgetRenderer:
<WidgetRenderer
  data={data}
  typeRegistry={typeRegistry}
  widgetFactory={widgetFactory}
  edit={false} // oder true für Edit Mode
/>
```

## Property Types

| Property | Type | Editor | Beschreibung |
|----------|------|--------|-------------|
| `title` | string | TextInput | Optional: Titel des Search Panels |
| `searchModel` | SearchModelWithConstraints | searchPanelConfiguration | Die Suchkriterien-Definition |
| `predefinedQuery` | QueryExpression | predefinedQueryEditor | Optional: Auto-laden beim Start |
| `minHeight` | number | IntInput | Mindesthöhe in px (Default: 300) |
| `showClear` | boolean | BooleanInput | Clear-Button anzeigen (Default: true) |

## Context API

```typescript
interface SearchPanelContextValue {
  searchModel: SearchModelWithConstraints;
  predefinedQuery?: QueryExpression | null;
  onConfigChange?: (config: {...}) => void;
}

// Verwendung in Komponenten:
const { searchModel, predefinedQuery } = useSearchPanelContext();
```

## Space Management

Das Compact Editor Design spart horizontalen Platz:

- **Collapsible Sections**: Nur das Notwendigste sichtbar
- **Tabs**: Model und Query Editor teilen sich denselben Platz
- **Expand Dialog**: Für komplexe Bearbeitungen
- **Kompakte Input-Felder**: 11px Font, 6px Padding

## TODO

- [ ] QueryExpression Builder Component im Full Editor implementieren
- [ ] Type Selection für SearchModel.criteria
- [ ] Constraint Configuration UI
- [ ] Predefined Query Loader beim Runtime Start
- [ ] Validierung der SearchModel Definition
- [ ] Error Handling und Feedback

## Files

```
/search-panel/
├─ search-panel-widget-data.ts        (WidgetData + Decorators)
├─ search-panel-context.tsx            (React Context)
├─ search-panel-compact-editor.tsx      (Property Panel Editor)
├─ search-panel-full-editor.tsx         (Modal Dialog)
├─ search-panel-property-editor.tsx     (Property Editor Registration)
├─ search-panel-widget-builder.tsx      (Runtime + Edit Builders)
├─ search-panel-registry.ts             (Auto-Init)
└─ index.ts                             (Exports)
```
