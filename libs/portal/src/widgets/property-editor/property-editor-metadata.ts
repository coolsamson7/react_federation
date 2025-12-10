import React from "react";

/**
 * Props for property editor components
 */
export interface PropertyEditorProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  label?: string;
  propertyName: string;
}

/**
 * Base class for property editors
 */
export abstract class PropertyEditor<T = any> extends React.Component<PropertyEditorProps<T>> {
  abstract render(): React.ReactNode;
}
