"use client";

import * as React from "react";
import { useField } from "./useField";
import type { FieldProps } from "./types";
import { FieldFeedback } from "./field-feedback";
import { LabelGroup } from "./label-group";
import { Field as FieldWrapper } from "../components/ui/field";

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
    <FieldWrapper
      className={className}
      data-field={name}
      invalid={hasError}
    >
      <LabelGroup
        labelHtmlFor={name}
        required={required}
        variant="label"
        secondaryId={descriptionId}
        secondary={description}
        primary={label}
      />

      {/* Field control slot keeps legacy DOM shape for compatibility */}
      <div data-slot="field-control">
        {typeof children === "function" ? children(fieldState) : children}
      </div>

      {/* Error message */}
      <FieldFeedback
        errorId={errorId}
        errorClassName={errorClassName}
        shouldRenderError={hasError}
        error={meta.error}
      />
    </FieldWrapper>
  );
}

Field.displayName = "Field";
