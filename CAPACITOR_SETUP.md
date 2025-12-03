# Capacitor Setup Guide

## Architecture Overview

Your app now supports **both web and native** platforms:

```
┌─────────────────────────────────────────────────┐
│          Shell App (Capacitor Container)        │
│  ┌──────────────────────────────────────────┐  │
│  │    Runs as Web OR Native (iOS/Android)   │  │
│  │  • Detects platform via Capacitor API    │  │
│  │  • Dynamically loads MFEs via HTTP       │  │
│  │  • Adapts UI based on client detection   │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
                      ↓ ↓ ↓
        ┌─────────────┴───┴─────────────┐
        ↓                                 ↓
┌───────────────┐               ┌───────────────┐
│  MFE1 (Web)   │               │  MFE2 (Web)   │
│  localhost:   │               │  localhost:   │
│      3001     │               │      3002     │
└───────────────┘               └───────────────┘
```

**Key Points:**
- Shell app can run as **pure web** (browser) or **native** (iOS/Android via Capacitor)
- MFEs remain **web-based** and are loaded dynamically via HTTP (same for both)
- Client detection automatically adapts UI based on platform

---

## Setup Steps (Already Completed)

### 1. ✅ Installed Capacitor
```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
```

### 2. ✅ Initialized Capacitor
Configuration file created at `apps/shell/capacitor.config.ts`:
- Web directory: `dist`
- Allow navigation to MFE URLs
- Mixed content enabled for loading HTTP MFEs

### 3. ✅ Updated Client Detection
The `detectClient()` function now:
- Checks if running in Capacitor
- Returns platform as "ios" or "android" for native
- Sets browser as "capacitor" when in native app

---

## Usage Instructions

### Build and Run for Web (No Changes)
```bash
# Terminal 1: Start shell
npm run start:shell

# Terminal 2: Start MFE1
npm run start:mfe1

# Browser: http://localhost:3000
```

### Build and Run for iOS

#### First Time Setup:
```bash
# 1. Build the shell app
npm run build:shell

# 2. Add iOS platform
npx cap add ios

# 3. Open in Xcode
npx cap open ios
```

#### Development Workflow:
```bash
# 1. Rebuild shell when you make changes
npm run build:shell

# 2. Sync changes to iOS
npx cap sync ios

# 3. Run from Xcode or:
npx cap run ios

# Note: Keep MFE dev servers running!
# Terminal: npm run start:mfe1
```

### Build and Run for Android

#### First Time Setup:
```bash
# 1. Build the shell app
npm run build:shell

# 2. Add Android platform
npx cap add android

# 3. Open in Android Studio
npx cap open android
```

#### Development Workflow:
```bash
# 1. Rebuild shell when you make changes
npm run build:shell

# 2. Sync changes to Android
npx cap sync android

# 3. Run from Android Studio or:
npx cap run android

# Note: Keep MFE dev servers running!
# Terminal: npm run start:mfe1
```

---

## How It Works

### 1. Platform Detection
The app automatically detects if it's running in:
- **Web browser** → Uses standard client detection
- **Capacitor native** → Uses `Capacitor.getPlatform()` API

```typescript
// In client-detector.ts
const isCapacitor = !!(window as any).Capacitor;
if (isCapacitor) {
  const nativePlatform = Capacitor.getPlatform(); // 'ios' or 'android'
  // Set platform accordingly
}
```

### 2. Dynamic MFE Loading
Both web and native use the **same loading mechanism**:
- MFEs hosted on localhost (dev) or CDN (prod)
- Shell loads remote entry scripts dynamically
- Module Federation handles the rest

### 3. Navigation Components
Your existing navigation components (DesktopNavigation, IOSNavigation) are selected based on client constraints:
- Large screens → DesktopNavigation
- Small screens (< 768px) → IOSNavigation
- **Works identically in web and native!**

---

## Production Considerations

### 1. MFE Hosting
In production, host your MFEs on a CDN or server:
```typescript
// deployment.json
{
  "modules": {
    "mfe1": {
      "uri": "https://cdn.yourapp.com/mfe1",
      "name": "mfe1"
    }
  }
}
```

### 2. Update Capacitor Config
```typescript
// capacitor.config.ts
server: {
  allowNavigation: [
    'https://cdn.yourapp.com',
    'https://api.yourapp.com',
  ],
}
```

### 3. HTTPS Only
In production, ensure all MFEs use HTTPS. Update:
```typescript
android: {
  allowMixedContent: false, // Disable HTTP in production
}
```

### 4. Build Scripts
Add to `package.json`:
```json
{
  "scripts": {
    "build:shell": "webpack --config apps/shell/webpack.config.js",
    "cap:sync": "npm run build:shell && npx cap sync",
    "cap:ios": "npm run cap:sync && npx cap open ios",
    "cap:android": "npm run cap:sync && npx cap open android"
  }
}
```

---

## Testing Both Platforms

### Test Web Version
```bash
npm run start:shell
# Visit http://localhost:3000
# Should show "Browser: chrome" or "Browser: safari"
```

### Test Native Version
```bash
npm run build:shell && npx cap sync ios && npx cap open ios
# Run in iOS Simulator
# Should show "Browser: capacitor" and "OS: iOS (Native)"
```

---

## Benefits of This Approach

✅ **Single Codebase** - Same React code runs on web and native
✅ **Dynamic Updates** - MFEs can be updated without app store review
✅ **Gradual Migration** - Keep using web while building native
✅ **Shared Logic** - Client detection, routing, state management all shared
✅ **Cost Effective** - Host MFEs once, serve to all platforms

---

## Next Steps (Optional Enhancements)

### 1. Add Native Plugins
```bash
npm install @capacitor/camera @capacitor/geolocation
```

Then use in your code:
```typescript
import { Camera } from '@capacitor/camera';

const takePicture = async () => {
  const image = await Camera.getPhoto({
    quality: 90,
    allowEditing: true,
    resultType: 'uri'
  });
};
```

### 2. Handle Offline Mode
```typescript
import { Network } from '@capacitor/network';

Network.addListener('networkStatusChange', status => {
  if (!status.connected) {
    // Show offline UI
  }
});
```

### 3. Add App Icons and Splash Screens
Place assets in:
- `ios/App/App/Assets.xcassets/` (iOS)
- `android/app/src/main/res/` (Android)

Or use the Capacitor Asset generator:
```bash
npm install @capacitor/assets --save-dev
npx capacitor-assets generate
```

---

## Troubleshooting

### Issue: MFEs not loading in native app
- Check `allowNavigation` includes MFE URLs
- Ensure MFE dev servers are running and accessible
- Check device/simulator network connectivity

### Issue: Mixed content errors
- Use HTTPS for MFEs in production
- For dev, ensure `cleartext: true` and `allowMixedContent: true`

### Issue: Module Federation errors
- Ensure `react-router-dom` is shared in both shell and MFE webpack configs
- Check remote URLs match in deployment manifest

---

## Summary

Your app now runs on:
- 🌐 **Web** - Direct browser access
- 📱 **iOS** - Native app via Capacitor
- 🤖 **Android** - Native app via Capacitor

All while maintaining:
- ✨ Dynamic MFE loading
- 🎯 Client-based feature filtering
- 🚀 Module Federation architecture
