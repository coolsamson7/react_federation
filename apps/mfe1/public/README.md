# MFE1 Manifest (Legacy)

This `manifest.json` is now generated automatically from the `@Feature` decorators.

## New Flow

1. Developer decorates components with `@Feature`:
```tsx
@Feature({
  id: "mfe1-home",
  label: "MFE1 Home",
  path: "/mfe1",
  // ...
})
class MFE1Home extends React.Component { ... }
```

2. Build process generates `metadata.json` automatically:
```
nx run mfe1:scan-metadata  →  dist/apps/mfe1/metadata.json
```

3. Build copies it to the runtime:
```
nx run mfe1:build  →  apps/mfe1/dist/metadata.json
```

4. Shell loads and converts it to routes:
```tsx
// ManifestLoader.loadManifest()
// Converts metadata.json → MFEManifest → routes
```

## Manual manifest.json (Deprecated)

This file is no longer needed. The routes are now derived from `@Feature` decorators.
