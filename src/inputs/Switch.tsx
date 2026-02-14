"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { Switch as SwitchPrimitive } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { cn } from "../lib/utils";

/**
 * Additional props specific to Switch
 */
export interface SwitchProps extends Omit<
  InputProps<boolean>,
  "onChange" | "placeholder"
> {
  /**
   * Change handler - receives boolean checked state
   */
  onChange: (checked: boolean) => void;

  /**
   * Label text for the switch
   */
  label?: React.ReactNode;

  /**
   * Optional description text below the label
   */
  description?: React.ReactNode;

  /**
   * Size variant
   * @default "default"
   */
  size?: "sm" | "default";

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * Switch - High-performance toggle input component (ShadCN-based)
 *
 * Built on ShadCN Switch with form-specific behavior:
 * - Error state handling
 * - Label and description support
 * - Form integration (onChange, onBlur)
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { notifications: false } });
 *
 * <Switch
 *   {...form.getFieldProps('notifications')}
 *   label="Enable notifications"
 *   description="Receive email notifications for important updates"
 *   error={!!form.errors.notifications}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/switch
 */
export function Switch({
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  className = "",
  label,
  description,
  size = "default",
  ...props
}: SwitchProps) {
  const switchId = props.id || `switch-${name}`;

  const handleCheckedChange = (checked: boolean) => {
    onChange(checked);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const switchElement = (
    <SwitchPrimitive
      id={switchId}
      checked={value}
      onCheckedChange={handleCheckedChange}
      onBlur={handleBlur}
      disabled={disabled}
      size={size}
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={
        description ? `${switchId}-description` : props["aria-describedby"]
      }
      aria-required={required || props["aria-required"]}
      {...props}
    />
  );

  // Without label, return just the switch
  if (!label) {
    return <div className={className}>{switchElement}</div>;
  }

  // With label, wrap in label element
  return (
    <label
      htmlFor={switchId}
      className={cn(
        "flex items-center gap-3 cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
    >
      {switchElement}
      <div className="flex flex-col gap-1">
        <Label
          htmlFor={switchId}
          className="cursor-pointer font-medium leading-none"
        >
          {label}
        </Label>
        {description && (
          <p
            id={`${switchId}-description`}
            className="text-sm opacity-70 leading-snug"
          >
            {description}
          </p>
        )}
      </div>
    </label>
  );
}

Switch.displayName = "Switch";
