import React from "react";
import { PropertyMetadata } from "../metadata";

/**
 * Props for property editor components
 */
export interface PropertyEditorProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  label?: string;
  propertyName: string;
  propertyMetadata?: PropertyMetadata;
}

/**
 * Base class for property editors
 */
export abstract class PropertyEditor<T = any> extends React.Component<PropertyEditorProps<T>> {
  abstract render(): React.ReactNode;
}
