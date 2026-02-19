"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { ButtonGroup } from "../components/ui/button-group";
import { FieldLabel } from "../components/ui/field";
import { TextInput } from "../inputs/TextInput";
import type { InputProps } from "./types";
import { Icon } from "@page-speed/icon";

const DEFAULT_ICON_API_KEY = "au382bi7fsh96w9h9xlrnat2jglx";

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
   * Icon name for icon based submit buttons
   */
  submitIconName?: string;
  /**
   * Icon component for icon based submit buttons
   */
  submitIconComponent?: React.ReactNode;
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
  submitIconName,
  submitIconComponent,
  className,
  labelClassName,
}: ButtonGroupFormProps) {
  const inputId = `button-group-input-${name}`;

  const hasValue = String(inputProps.value ?? "").trim().length > 0;
  const hasError = !!inputProps.error;

  const buttonSize:
    | "xs"
    | "sm"
    | "default"
    | "lg"
    | "icon"
    | "icon-xs"
    | "icon-sm"
    | "icon-lg" = React.useMemo(() => {
    if (submitIconName || submitIconComponent) {
      return size === "default" ? "icon" : (`icon-${size}` as const);
    }
    return size;
  }, [submitIconName, size, submitIconComponent]);

  const labelElement = React.useMemo(() => {
    if (submitIconName) {
      return <Icon name={submitIconName} apiKey={DEFAULT_ICON_API_KEY} />;
    } else if (submitIconComponent) {
      return submitIconComponent;
    } else if (submitLabel) {
      return submitLabel;
    } else {
      return "Submit";
    }
  }, [submitIconComponent, submitIconName, submitLabel]);

  // Size-specific classes for input to match button heights
  const inputSizeClasses = {
    xs: "text-xs px-3",
    sm: "text-sm px-3",
    default: "text-base px-4",
    lg: "text-md px-6",
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
          size={buttonSize}
          type="submit"
          variant={submitVariant}
          disabled={isSubmitting}
          className={cn(
            "rounded-l-none",
            !hasError && hasValue && "ring-2 ring-ring",
          )}
        >
          {labelElement}
        </Button>
      </ButtonGroup>
    </div>
  );
}

ButtonGroupForm.displayName = "ButtonGroupForm";
