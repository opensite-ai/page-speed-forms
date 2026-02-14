"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

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
export interface RadioProps extends Omit<
  InputProps<string>,
  "onChange" | "placeholder"
> {
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
  layout?: "stacked" | "grid" | "inline";

  /**
   * Group-level label
   */
  label?: React.ReactNode;

  /**
   * Group-level description
   */
  description?: React.ReactNode;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * Radio - High-performance single selection component (ShadCN-based)
 *
 * Built on ShadCN RadioGroup with form-specific behavior:
 * - Error state handling
 * - Choice Card variant (automatic when any option has description)
 * - Keyboard navigation (built into RadioGroup)
 * - Grid/stacked layouts
 * - Form integration (onChange, onBlur)
 * - Full accessibility support
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
  description,
  options,
  ...props
}: RadioProps) {
  const handleValueChange = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  // Automatically use Choice Card if any option has description
  const useChoiceCard = React.useMemo(() => {
    return options.some((option) => option.description);
  }, [options]);

  const groupDescriptionId = description ? `${name}-description` : undefined;

  return (
    <div className={cn("w-full", className)}>
      {/* Group-level label and description */}
      {(label || description) && (
        <div className="mb-3">
          {label && (
            <Label className="text-base font-medium block mb-1">{label}</Label>
          )}
          {description && (
            <p
              id={groupDescriptionId}
              className="text-sm opacity-70"
            >
              {description}
            </p>
          )}
        </div>
      )}

      <RadioGroup
        name={name}
        value={value}
        onValueChange={handleValueChange}
        onBlur={handleBlur}
        disabled={disabled}
        required={required}
        className={cn(
          "gap-3",
          layout === "grid" && "grid grid-cols-1 md:grid-cols-2",
          layout === "inline" && "flex flex-wrap",
        )}
        aria-invalid={error || props["aria-invalid"]}
        aria-describedby={groupDescriptionId || props["aria-describedby"]}
        aria-required={required || props["aria-required"]}
      >
        {options.map((option) => {
          const isSelected = value === option.value;
          const isDisabled = disabled || option.disabled;
          const radioId = `${name}-${option.value}`;
          const hasDescription = !!option.description;

          return (
            <label
              key={option.value}
              htmlFor={radioId}
              className={cn(
                "flex gap-3 p-3 duration-200",
                useChoiceCard &&
                  "border rounded-lg hover:ring-2 hover:ring-ring/50",
                useChoiceCard && isSelected && "ring-2 ring-ring",
                useChoiceCard && error && "border-destructive",
                isDisabled
                  ? "opacity-50 cursor-not-allowed"
                  : "cursor-pointer",
              )}
            >
              <div
                className={cn(
                  "flex w-full gap-3",
                  useChoiceCard ? "items-start" : "items-center",
                )}
              >
                <RadioGroupItem
                  value={option.value}
                  id={radioId}
                  disabled={isDisabled}
                  className="mt-0.5"
                  aria-describedby={
                    hasDescription
                      ? `${radioId}-description`
                      : undefined
                  }
                />
                <div className="flex flex-col gap-1 flex-1">
                  <Label
                    htmlFor={radioId}
                    className="cursor-pointer font-medium leading-none"
                  >
                    {option.label}
                  </Label>
                  {option.description && (
                    <p
                      id={`${radioId}-description`}
                      className="text-sm opacity-70 leading-snug"
                    >
                      {option.description}
                    </p>
                  )}
                </div>
              </div>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}

Radio.displayName = "Radio";
