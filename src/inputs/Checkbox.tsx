"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { cn } from "../utils";

/**
 * Additional props specific to Checkbox
 */
export interface CheckboxProps extends Omit<
  InputProps<boolean>,
  "onChange" | "placeholder"
> {
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
   * Layout variant
   */
  checkboxVariant?: "boxed" | "inline";

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
  checkboxVariant = "boxed",
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

  const isActive = value || (indeterminate && !value);

  const checkbox = (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        !label && className,
      )}
    >
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
        className="peer sr-only"
        aria-invalid={error || props["aria-invalid"]}
        aria-describedby={
          description ? `${checkboxId}-description` : props["aria-describedby"]
        }
        aria-required={required || props["aria-required"]}
        {...props}
      />
      <div
        className={cn(
          "flex shrink-0 items-center justify-center rounded-full border-2 transition-colors size-6",
          !error && isActive && "border-primary bg-primary text-primary-foreground",
          !error && !isActive && "border-input bg-transparent",
          error && isActive && "border-destructive bg-destructive text-destructive-foreground",
          error && !isActive && "border-destructive bg-transparent",
          disabled && "opacity-50",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/50 peer-focus-visible:ring-offset-1",
        )}
      >
        {value && (
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
        {indeterminate && !value && (
          <svg
            className="size-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        )}
      </div>
    </div>
  );

  if (label) {
    return (
      <label
        className={cn(
          "w-full h-full flex gap-3 p-3 duration-200",
          checkboxVariant === "boxed" && "border rounded-lg hover:ring-2",
          checkboxVariant === "boxed" && value && "ring-2",
          disabled
            ? "opacity-50 cursor-not-allowed hover:ring-0"
            : "cursor-pointer",
          className,
        )}
        htmlFor={checkboxId}
      >
        <div className="flex w-full flex-row gap-2">
          {checkbox}
          <div className="flex flex-col gap-0.5">
            <div className="text-sm font-medium">{label}</div>
            {description && (
              <p
                className="text-xs opacity-75"
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
