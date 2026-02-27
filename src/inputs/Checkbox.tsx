"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { Checkbox as CheckboxPrimitive } from "../components/ui/checkbox";
import { FieldDescription, FieldLabel } from "../components/ui/field";
import { cn } from "../lib/utils";

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
   * Label text for the checkbox (primary text)
   */
  label?: React.ReactNode;

  /**
   * Optional description text below the label (secondary text)
   */
  description?: React.ReactNode;

  /**
   * Layout variant - automatically enabled if description exists
   * @default false
   */
  useChoiceCard?: boolean;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * Checkbox - High-performance boolean input component (ShadCN-based)
 *
 * Built on ShadCN Checkbox with form-specific behavior:
 * - Error state handling
 * - Choice Card variant (automatic when description exists)
 * - Label and description support
 * - Form integration (onChange, onBlur)
 * - Full accessibility support
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
  label,
  description,
  useChoiceCard = false,
  ...props
}: CheckboxProps) {
  const checkboxId = props.id || `checkbox-${name}`;

  const handleCheckedChange = (checked: boolean) => {
    onChange(checked);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  // Automatically use Choice Card if description exists
  const showChoiceCard = useChoiceCard || !!description;

  const checkbox = (
    <>
      {/* Hidden input for form submission */}
      <input
        type="checkbox"
        name={name}
        checked={value}
        onChange={() => {}} // Controlled by CheckboxPrimitive
        disabled={disabled}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          padding: 0,
          margin: "-1px",
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />
      <CheckboxPrimitive
        id={checkboxId}
        checked={value}
        onCheckedChange={handleCheckedChange}
        onBlur={handleBlur}
        disabled={disabled}
        aria-invalid={error || props["aria-invalid"]}
        aria-describedby={
          description ? `${checkboxId}-description` : props["aria-describedby"]
        }
        aria-required={required || props["aria-required"]}
        {...props}
      />
    </>
  );

  // Without label, return just the checkbox
  if (!label) {
    return <div className={className}>{checkbox}</div>;
  }

  // With label, wrap in FieldLabel for semantic association and click behavior
  return (
    <div className="space-y-0" data-invalid={error || undefined}>
      <FieldLabel
        htmlFor={checkboxId}
        className={cn(
          "flex gap-3 p-3 duration-200 select-auto font-normal leading-normal",
          showChoiceCard && "border rounded-lg hover:ring-2 hover:ring-primary",
          showChoiceCard && value && "ring-2 ring-primary",
          showChoiceCard && error && "ring-2 ring-destructive",
          disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
          className,
        )}
      >
        <div
          className={cn(
            "flex w-full gap-3",
            showChoiceCard ? "items-start" : "items-center",
          )}
        >
          {checkbox}
          <div className="flex-1 space-y-1">
            <span className="text-sm font-medium leading-none">{label}</span>
            {description && (
              <FieldDescription
                id={`${checkboxId}-description`}
                className="leading-snug"
              >
                {description}
              </FieldDescription>
            )}
          </div>
        </div>
      </FieldLabel>
    </div>
  );
}

Checkbox.displayName = "Checkbox";
