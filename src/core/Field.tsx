"use client";

import * as React from "react";
import { useField } from "./useField";
import type { FieldProps } from "./types";
import { FieldFeedback } from "./field-feedback";
import { LabelGroup } from "./label-group";

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
  errorClassName,
  required = false,
  validate,
}: FieldProps) {
  const fieldState = useField({ name, validate });
  const { meta } = fieldState;

  const hasError = React.useMemo(() => {
    return showError && meta.touched && meta.error ? true : false;
  }, [meta?.touched, meta?.error, showError]);

  const errorId = `${name}-error`;
  const descriptionId = `${name}-description`;

  return (
    <div className={className} data-field={name}>
      <LabelGroup
        labelHtmlFor={name}
        required={required}
        variant="label"
        secondaryId={descriptionId}
        secondary={description}
        primary={label}
      />

      {/* Field content (render prop or direct children) */}
      <div>
        {typeof children === "function" ? children(fieldState) : children}
      </div>

      {/* Error message */}
      <FieldFeedback
        errorId={errorId}
        errorClassName={errorClassName}
        shouldRenderError={hasError}
        error={meta.error}
      />
    </div>
  );
}

Field.displayName = "Field";
