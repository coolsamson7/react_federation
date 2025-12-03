import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.assaia.portal.app',
  appName: 'Portal App',
  webDir: 'apps/shell/dist',
  server: {
    // Allow loading external MFEs from localhost during development
    // In production, set allowNavigation to your MFE domains
    allowNavigation: [
      'localhost',
      'http://localhost:3001', // MFE1
      // Add other MFE URLs here
    ],
    // Enable CORS for loading remote modules
    cleartext: true,
  },
  ios: {
    contentInset: 'automatic',
  },
  android: {
    allowMixedContent: true, // Required for loading HTTP content in HTTPS app
  },
};

export default config;
