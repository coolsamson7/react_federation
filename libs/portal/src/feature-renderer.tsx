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

  useEffect(() => {
    console.log(`[FeatureRenderer] Looking for feature "${featureId}"`);
    console.log(`[FeatureRenderer] Available features:`, Object.keys((window as any).__PORTAL_FEATURES__ || {}));

    const feature = (window as any).__PORTAL_FEATURES__?.[featureId];

    if (feature) {
      console.log(`[FeatureRenderer] Found feature "${featureId}"`);
      setFeatureComponent(() => feature);
    } else {
      console.error(`[FeatureRenderer] Feature "${featureId}" not found in registry`);
    }
  }, [featureId]);

  if (!FeatureComponent) {
    return null; // Don't render anything if feature is not available
  }

  console.log(`[FeatureRenderer] Rendering feature "${featureId}"`);
  return <FeatureComponent {...props} />;
};
