import React from "react";
import { TypeDescriptor } from "../query-model";

/**
 * Props for input editor components
 */
export interface InputEditorProps<T = any> {
  value: T;
  onChange: (value: T) => void;
  type: TypeDescriptor;
  operandIndex?: number;
  placeholder?: string;
}

/**
 * Base class for input editors
 */
export abstract class InputEditor<T = any> extends React.Component<InputEditorProps<T>> {
  abstract render(): React.ReactNode;
}
