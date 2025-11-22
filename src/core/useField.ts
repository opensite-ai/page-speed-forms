"use client";

import { useCallback, useContext } from "react";
import { FormContext } from "./FormContext";
import type { UseFieldOptions, UseFieldReturn, FieldInputProps, FieldMeta } from "./types";

/**
 * useField - Field-level reactive hook for form inputs
 *
 * Provides isolated reactivity for individual form fields.
 * Only re-renders when the specific field changes, not when other fields update.
 *
 * Must be used within a FormContext (inside <Form> component).
 *
 * @example
 * ```tsx
 * function EmailInput() {
 *   const { field, meta, helpers } = useField({ name: 'email' });
 *
 *   return (
 *     <div>
 *       <input {...field} type="email" />
 *       {meta.touched && meta.error && <span>{meta.error}</span>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/use-field
 */
export function useField<T = any>(
  options: UseFieldOptions<T>
): UseFieldReturn<T> {
  const { name, validate, transform } = options;

  const form = useContext(FormContext);

  if (!form) {
    throw new Error(
      "useField must be used within a FormContext. " +
        "Wrap your component with <Form> or use useForm's getFieldProps instead."
    );
  }

  // Get field props with automatic change/blur handling
  const baseFieldProps = form.getFieldProps(name);

  // Apply transform if provided
  const field: FieldInputProps<T> = {
    ...baseFieldProps,
    value: baseFieldProps.value as T,
    onChange: (value: T) => {
      const transformedValue = transform ? transform(value) : value;
      baseFieldProps.onChange(transformedValue);

      // Run field-level validation if provided
      if (validate) {
        const result = validate(transformedValue, form.values);
        if (result instanceof Promise) {
          result.then((error) => {
            if (error !== undefined) {
              form.setFieldError(name, error);
            }
          });
        } else if (result !== undefined) {
          form.setFieldError(name, result);
        }
      }
    },
  };

  // Get field meta information
  const meta: FieldMeta = form.getFieldMeta(name);

  // Field helpers
  const helpers = {
    setValue: useCallback(
      (value: T) => {
        const transformedValue = transform ? transform(value) : value;
        form.setFieldValue(name, transformedValue);
      },
      [name, transform, form]
    ),
    setTouched: useCallback(
      (touched: boolean) => {
        form.setFieldTouched(name, touched);
      },
      [name, form]
    ),
    setError: useCallback(
      (error: string | undefined) => {
        form.setFieldError(name, error);
      },
      [name, form]
    ),
  };

  return {
    field,
    meta,
    helpers,
  };
}
