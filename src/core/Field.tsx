"use client";

import * as React from "react";
import { useField } from "./useField";
import type { FieldProps } from "./types";

/**
 * Field - Field wrapper component with label, description, and error display
 *
 * Provides a complete field UI with automatic error handling and accessibility.
 * Uses useField hook internally for field-level reactivity.
 *
 * Features:
 * - Automatic label association
 * - Error display with accessibility
 * - Optional description text
 * - Render prop pattern for flexibility
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * <Field name="email" label="Email Address" description="We'll never share your email">
 *   {({ field, meta }) => (
 *     <input
 *       {...field}
 *       type="email"
 *       className={meta.error && meta.touched ? 'error' : ''}
 *     />
 *   )}
 * </Field>
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/field
 */
export function Field({
  name,
  label,
  description,
  children,
  showError = true,
  className,
  validate,
}: FieldProps) {
  const fieldState = useField({ name, validate });
  const { meta } = fieldState;

  const hasError = meta.touched && meta.error;
  const errorId = `${name}-error`;
  const descriptionId = `${name}-description`;

  return (
    <div className={className} data-field={name}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className="field-label">
          {label}
        </label>
      )}

      {/* Description */}
      {description && (
        <div id={descriptionId} className="field-description">
          {description}
        </div>
      )}

      {/* Field content (render prop or direct children) */}
      <div className="field-input">
        {typeof children === "function" ? children(fieldState) : children}
      </div>

      {/* Error message */}
      {showError && hasError && (
        <div
          id={errorId}
          className="field-error"
          role="alert"
          aria-live="polite"
        >
          {Array.isArray(meta.error) ? meta.error.join(", ") : meta.error}
        </div>
      )}
    </div>
  );
}

Field.displayName = "Field";
