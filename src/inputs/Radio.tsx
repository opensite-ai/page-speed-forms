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
   * Display label for the option (primary text)
   */
  label: React.ReactNode;

  /**
   * Optional description text below the label (secondary text)
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
 * - Optional descriptions for each option (with nil guard)
 * - Individual option disabled state
 * - Card-based styling with proper visual hierarchy
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
    e: React.KeyboardEvent<HTMLLabelElement>,
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

  const layoutClass = layout === "inline" ? "flex flex-row flex-wrap gap-4" : "grid w-full gap-2";
  const containerClass = `${layoutClass} ${className}`.trim();

  return (
    <div
      className={containerClass}
      role="radiogroup"
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={required || props["aria-required"]}
      aria-label={typeof label === "string" ? label : props["aria-label"]}
    >
      {label && <div className="text-sm font-medium mb-2">{label}</div>}
      {options.map((option, index) => {
        const isChecked = value === option.value;
        const isDisabled = disabled || option.disabled;
        const radioId = `${name}-${option.value}`;

        return (
          <label
            key={option.value}
            className={`flex w-fit gap-2 items-center ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            htmlFor={radioId}
            onKeyDown={(e) => handleKeyDown(e, index)}
            tabIndex={isDisabled ? -1 : 0}
          >
            <div className="flex w-full flex-row items-center gap-2">
              <div className="flex flex-1 flex-col gap-0.5">
                {option.description ? (
                  <>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {option.label}
                    </div>
                    <p
                      className="text-muted-foreground text-sm"
                      id={`${radioId}-description`}
                    >
                      {option.description}
                    </p>
                  </>
                ) : (
                  <span className="text-sm font-medium">{option.label}</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="radio"
                  id={radioId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  onChange={(e) => handleChange(e.target.value)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  required={required}
                  className={`peer relative flex aspect-square size-4 shrink-0 appearance-none rounded-full border border-input outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-destructive" : ""} ${isChecked ? "border-primary bg-primary" : "bg-transparent"}`}
                  aria-describedby={
                    option.description
                      ? `${radioId}-description`
                      : props["aria-describedby"]
                  }
                />
                {isChecked && (
                  <span className="pointer-events-none absolute top-1/2 left-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center text-primary-foreground">
                    <svg className="size-2 fill-current" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                    </svg>
                  </span>
                )}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}

Radio.displayName = "Radio";
