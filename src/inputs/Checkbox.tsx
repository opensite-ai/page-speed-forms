"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

/**
 * Additional props specific to Checkbox
 */
export interface CheckboxProps
  extends Omit<InputProps<boolean>, "onChange" | "placeholder"> {
  /**
   * Change handler - receives boolean checked state
   */
  onChange: (checked: boolean) => void;

  /**
   * Indeterminate state for partial selections
   * Useful for "select all" checkboxes with some items selected
   * @default false
   */
  indeterminate?: boolean;

  /**
   * Label text for the checkbox (primary text)
   */
  label?: React.ReactNode;

  /**
   * Optional description text below the label (secondary text)
   */
  description?: React.ReactNode;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * Checkbox - High-performance boolean input component
 *
 * A lightweight, accessible checkbox with error state support.
 * Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Full accessibility support (ARIA attributes)
 * - Error state styling
 * - Controlled input behavior
 * - Indeterminate state support
 * - Optional label and description text (with nil guards)
 * - Proper field-based layout structure
 * - All native checkbox attributes supported
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { terms: false } });
 *
 * <Checkbox
 *   {...form.getFieldProps('terms')}
 *   label="I agree to the terms and conditions"
 *   description="By clicking this checkbox, you agree to the terms."
 *   error={!!form.errors.terms}
 *   aria-describedby={form.errors.terms ? 'terms-error' : undefined}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With indeterminate state
 * <Checkbox
 *   name="selectAll"
 *   value={allSelected}
 *   onChange={handleSelectAll}
 *   indeterminate={someSelected}
 *   label="Select all items"
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/checkbox
 */
export function Checkbox({
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  className = "",
  indeterminate = false,
  label,
  description,
  ...props
}: CheckboxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const checkboxId = props.id || `checkbox-${name}`;

  // Set indeterminate state on the native input element
  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const checkbox = (
    <div className="relative inline-flex">
      <input
        ref={inputRef}
        type="checkbox"
        id={checkboxId}
        name={name}
        checked={value}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className={`peer relative flex size-4 shrink-0 appearance-none items-center justify-center rounded-lg border border-input bg-transparent outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-destructive ring-3 ring-destructive/20" : ""} ${value ? "bg-primary border-primary" : ""} ${className}`}
        aria-invalid={error || props["aria-invalid"]}
        aria-describedby={
          description
            ? `${checkboxId}-description`
            : props["aria-describedby"]
        }
        aria-required={required || props["aria-required"]}
        {...props}
      />
      {value && (
        <span className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-primary-foreground">
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
      )}
      {indeterminate && !value && (
        <span className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-primary">
          <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </span>
      )}
    </div>
  );

  // If label is provided, wrap checkbox in label element with proper structure
  if (label) {
    return (
      <label
        className={`flex w-fit gap-2 items-center ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        htmlFor={checkboxId}
      >
        <div className="flex w-full flex-row items-center gap-2">
          {checkbox}
          <div className="flex flex-1 flex-col gap-0.5">
            <div className="flex items-center gap-2 text-sm font-medium">
              {label}
            </div>
            {description && (
              <p
                className="text-muted-foreground text-sm"
                id={`${checkboxId}-description`}
              >
                {description}
              </p>
            )}
          </div>
        </div>
      </label>
    );
  }

  return checkbox;
}

Checkbox.displayName = "Checkbox";
