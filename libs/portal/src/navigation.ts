import React from "react";

export interface NavigationRoute {
  path: string;
  label?: string;
  icon?: string;
  component: string;
  remote?: string;
}

export interface NavigationComponentProps {
  routes: NavigationRoute[];
  currentPath: string;
}

export type NavigationComponent = React.ComponentType<NavigationComponentProps>;
