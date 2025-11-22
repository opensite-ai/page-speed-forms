"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

/**
 * Radio option type
 */
export interface RadioOption {
  /**
   * The value for this radio option
   */
  value: string;

  /**
   * Display label for the option
   */
  label: React.ReactNode;

  /**
   * Optional description text below the label
   */
  description?: React.ReactNode;

  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
}

/**
 * Additional props specific to Radio
 */
export interface RadioProps
  extends Omit<InputProps<string>, "onChange" | "placeholder"> {
  /**
   * Change handler - receives selected value
   */
  onChange: (value: string) => void;

  /**
   * Array of radio options
   */
  options: RadioOption[];

  /**
   * Layout direction
   * @default "stacked"
   */
  layout?: "inline" | "stacked";

  /**
   * Group-level label
   */
  label?: React.ReactNode;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * Radio - High-performance single selection component
 *
 * A lightweight, accessible radio group with error state support.
 * Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Full accessibility support (ARIA attributes, role="radiogroup")
 * - Error state styling
 * - Controlled input behavior
 * - Keyboard navigation (arrow keys)
 * - Inline or stacked layout
 * - Optional descriptions for each option
 * - Individual option disabled state
 * - All native radio attributes supported
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { plan: 'basic' } });
 *
 * <Radio
 *   {...form.getFieldProps('plan')}
 *   label="Select your plan"
 *   options={[
 *     { value: 'basic', label: 'Basic', description: '$9/month' },
 *     { value: 'pro', label: 'Pro', description: '$29/month' },
 *     { value: 'enterprise', label: 'Enterprise', description: '$99/month' }
 *   ]}
 *   error={!!form.errors.plan}
 *   aria-describedby={form.errors.plan ? 'plan-error' : undefined}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Inline layout
 * <Radio
 *   name="size"
 *   value={size}
 *   onChange={handleSizeChange}
 *   layout="inline"
 *   options={[
 *     { value: 'sm', label: 'Small' },
 *     { value: 'md', label: 'Medium' },
 *     { value: 'lg', label: 'Large' }
 *   ]}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/radio
 */
export function Radio({
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  className = "",
  layout = "stacked",
  label,
  options,
  ...props
}: RadioProps) {
  const handleChange = (optionValue: string) => {
    onChange(optionValue);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLDivElement>,
    currentIndex: number
  ) => {
    if (e.key === "ArrowDown" || e.key === "ArrowRight") {
      e.preventDefault();
      // Find next non-disabled option
      let nextIndex = (currentIndex + 1) % options.length;
      let attempts = 0;
      while (
        options[nextIndex].disabled &&
        attempts < options.length &&
        !disabled
      ) {
        nextIndex = (nextIndex + 1) % options.length;
        attempts++;
      }
      if (!options[nextIndex].disabled) {
        handleChange(options[nextIndex].value);
      }
    } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
      e.preventDefault();
      // Find previous non-disabled option
      let prevIndex = (currentIndex - 1 + options.length) % options.length;
      let attempts = 0;
      while (
        options[prevIndex].disabled &&
        attempts < options.length &&
        !disabled
      ) {
        prevIndex = (prevIndex - 1 + options.length) % options.length;
        attempts++;
      }
      if (!options[prevIndex].disabled) {
        handleChange(options[prevIndex].value);
      }
    }
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const baseClassName = "radio-group";
  const errorClassName = error ? "radio-group--error" : "";
  const layoutClassName = `radio-group--${layout}`;
  const combinedClassName =
    `${baseClassName} ${errorClassName} ${layoutClassName} ${className}`.trim();

  return (
    <div
      className={combinedClassName}
      role="radiogroup"
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={required || props["aria-required"]}
      aria-label={typeof label === "string" ? label : props["aria-label"]}
    >
      {label && <div className="radio-group-label">{label}</div>}
      <div className="radio-options">
        {options.map((option, index) => {
          const isChecked = value === option.value;
          const isDisabled = disabled || option.disabled;
          const radioId = `${name}-${option.value}`;

          return (
            <label
              key={option.value}
              className={`radio-option ${isDisabled ? "radio-option--disabled" : ""}`}
              htmlFor={radioId}
            >
              <input
                type="radio"
                id={radioId}
                name={name}
                value={option.value}
                checked={isChecked}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
                onKeyDown={(e) => handleKeyDown(e, index)}
                disabled={isDisabled}
                required={required}
                className="radio-input"
                aria-describedby={
                  option.description
                    ? `${radioId}-description`
                    : props["aria-describedby"]
                }
              />
              <div className="radio-content">
                <span className="radio-label">{option.label}</span>
                {option.description && (
                  <span
                    className="radio-description"
                    id={`${radioId}-description`}
                  >
                    {option.description}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}

Radio.displayName = "Radio";
