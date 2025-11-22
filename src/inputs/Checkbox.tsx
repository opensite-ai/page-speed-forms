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
   * Label text for the checkbox
   * Can also wrap checkbox in a label element
   */
  label?: React.ReactNode;

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
 * - Optional label text
 * - All native checkbox attributes supported
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { terms: false } });
 *
 * <Checkbox
 *   {...form.getFieldProps('terms')}
 *   label="I agree to the terms and conditions"
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
  ...props
}: CheckboxProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  const baseClassName = "checkbox";
  const errorClassName = error ? "checkbox--error" : "";
  const combinedClassName = `${baseClassName} ${errorClassName} ${className}`.trim();

  const checkbox = (
    <input
      ref={inputRef}
      type="checkbox"
      name={name}
      checked={value}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      required={required}
      className={combinedClassName}
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={required || props["aria-required"]}
      {...props}
    />
  );

  // If label is provided, wrap checkbox in label element
  if (label) {
    return (
      <label className="checkbox-label">
        {checkbox}
        <span className="checkbox-label-text">{label}</span>
      </label>
    );
  }

  return checkbox;
}

Checkbox.displayName = "Checkbox";
