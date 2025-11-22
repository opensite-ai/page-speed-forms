"use client";

import { createContext } from "react";
import type { UseFormReturn } from "./types";

/**
 * FormContext - React context for providing form state to child components
 *
 * Allows useField hook to access form state without prop drilling.
 * Automatically provided by the <Form> component.
 *
 * @internal
 */
export const FormContext = createContext<UseFormReturn<any> | null>(null);

FormContext.displayName = "FormContext";
