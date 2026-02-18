"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { ButtonGroup } from "../components/ui/button-group";
import { FieldLabel } from "../components/ui/field";
import { TextInput } from "../inputs/TextInput";
import type { InputProps } from "./types";

export type ButtonGroupFormSize = "xs" | "sm" | "default" | "lg";

export type ButtonGroupFormProps = {
  /**
   * Field name
   */
  name: string;
  /**
   * Optional label above the input
   */
  label?: React.ReactNode;
  /**
   * Placeholder text for the input
   */
  placeholder?: string;
  /**
   * Input props from form field
   */
  inputProps: InputProps<string> & {
    type?: "text" | "email" | "password" | "url" | "tel" | "search";
  };
  /**
   * Submit button label
   */
  submitLabel?: React.ReactNode;
  /**
   * Submit button size
   */
  size?: ButtonGroupFormSize;
  /**
   * Submit button variant
   */
  submitVariant?:
    | "link"
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | null
    | undefined;
  /**
   * Whether form is submitting
   */
  isSubmitting?: boolean;
  /**
   * Additional className for the container
   */
  className?: string;
  /**
   * Additional className for the label
   */
  labelClassName?: string;
};

/**
 * ButtonGroupForm - Inline form layout with input and submit button grouped together
 *
 * Commonly used for newsletter signups and other simple single-field forms.
 * The input and button automatically adjust sizing together.
 *
 * Size mappings:
 * - xs: h-8 text-xs
 * - sm: h-9 text-sm
 * - default: h-10 text-sm
 * - lg: h-12 text-base
 *
 * @example
 * ```tsx
 * <ButtonGroupForm
 *   name="email"
 *   placeholder="Enter your email"
 *   inputProps={form.getFieldProps('email')}
 *   submitLabel="Subscribe"
 *   size="default"
 * />
 * ```
 */
export function ButtonGroupForm({
  name,
  label,
  inputProps,
  submitLabel = "Submit",
  submitVariant = "default",
  size = "default",
  isSubmitting = false,
  className,
  labelClassName,
}: ButtonGroupFormProps) {
  const inputId = `button-group-input-${name}`;

  // Size-specific classes for input to match button heights
  const inputSizeClasses = {
    xs: "h-8 text-xs px-3",
    sm: "h-9 text-sm px-3",
    default: "h-10 text-sm px-4",
    lg: "h-12 text-base px-6",
  };

  // Map button group sizes to button sizes
  const buttonSizes: Record<ButtonGroupFormSize, "xs" | "sm" | "default" | "lg"> = {
    xs: "xs",
    sm: "sm",
    default: "default",
    lg: "lg",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <FieldLabel htmlFor={inputId} className={labelClassName}>
          {label}
        </FieldLabel>
      )}
      <ButtonGroup>
        <TextInput
          {...inputProps}
          id={inputId}
          className={cn(
            inputSizeClasses[size],
            "border-r-0 rounded-r-none focus-visible:z-10",
            inputProps.className,
          )}
        />
        <Button
          size={buttonSizes[size]}
          type="submit"
          variant={submitVariant}
          disabled={isSubmitting}
          className="rounded-l-none"
        >
          {submitLabel}
        </Button>
      </ButtonGroup>
    </div>
  );
}

ButtonGroupForm.displayName = "ButtonGroupForm";
