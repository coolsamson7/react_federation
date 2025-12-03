import React, { useEffect, useState } from "react";

interface FeatureRendererProps {
  featureId: string;
  [key: string]: any; // Allow passing any props to the feature component
}

/**
 * Generic component that loads and renders a feature by ID.
 * The feature is loaded from the deployment based on client constraints.
 *
 * Usage:
 * <FeatureRenderer featureId="navigation" routes={routes} currentPath={currentPath} />
 */
export const FeatureRenderer: React.FC<FeatureRendererProps> = ({ featureId, ...props }) => {
  const [FeatureComponent, setFeatureComponent] = useState<React.ComponentType<any> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let pollInterval: NodeJS.Timeout | null = null;

    const checkForFeature = () => {
      if (cancelled) return false;

      console.log(`[FeatureRenderer] Looking for feature "${featureId}"`);
      console.log(`[FeatureRenderer] Available features:`, Object.keys((window as any).__PORTAL_FEATURES__ || {}));

      const feature = (window as any).__PORTAL_FEATURES__?.[featureId];

      if (feature) {
        console.log(`[FeatureRenderer] Found feature "${featureId}"`);
        setFeatureComponent(() => feature);
        setError(null);
        return true;
      }

      console.log(`[FeatureRenderer] Feature "${featureId}" not found yet`);
      setError(`Feature "${featureId}" not found in registry`);
      return false;
    };

    // Try immediately
    if (!checkForFeature()) {
      // Poll every 100ms until found (up to 5 seconds)
      let attempts = 0;
      pollInterval = setInterval(() => {
        attempts++;
        if (checkForFeature() || attempts >= 50) {
          if (pollInterval) clearInterval(pollInterval);
        }
      }, 100);
    }

    return () => {
      cancelled = true;
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [featureId]);

  if (error && !FeatureComponent) {
    console.error(error);
    return <div style={{ padding: "20px", color: "red" }}>Error: {error}</div>;
  }

  if (!FeatureComponent) {
    console.log(`[FeatureRenderer] Waiting for feature "${featureId}" to load...`);
    return <div style={{ padding: "20px", color: "#888" }}>Loading {featureId}...</div>;
  }

  console.log(`[FeatureRenderer] Rendering feature "${featureId}"`);
  return <FeatureComponent {...props} />;
};
