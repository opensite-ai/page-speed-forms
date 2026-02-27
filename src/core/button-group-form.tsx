"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "../components/ui/button";
import { ButtonGroup } from "../components/ui/button-group";
import { FieldLabel, FieldDescription } from "../components/ui/field";
import { FieldFeedback } from "./field-feedback";
import { TextInput } from "../inputs/TextInput";
import type { InputProps } from "./types";
import { Icon } from "@page-speed/icon";

const DEFAULT_ICON_API_KEY = "au382bi7fsh96w9h9xlrnat2jglx";
export type ButtonGroupFormSize = "xs" | "sm" | "default" | "lg";

// Size-specific classes for input — height overrides ensure the input matches
// the button height for every size variant.
const INPUT_SIZE_CLASSES: Record<ButtonGroupFormSize, string> = {
  xs: "h-6 text-xs px-3", // button: h-6  → match
  sm: "text-sm px-3", // button: h-8 overridden to h-9 below → match
  default: "text-base px-4", // button: h-9 (no override needed)
  lg: "h-10 text-md px-6", // button: h-10 → match
};

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
   * Optional description below the input
   */
  description?: React.ReactNode;
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
   * Error message text to display below the input group.
   * Should be the raw error string(s) from the form field meta.
   * The ring styling is driven by `inputProps.error` (boolean); this controls the visible message.
   */
  errorText?: string | string[];
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
 * Size mappings (input height / button height — always equal):
 * - xs:      h-6  / h-6
 * - sm:      h-9  / h-9
 * - default: h-9  / h-9
 * - lg:      h-10 / h-10
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
  description,
  inputProps,
  submitLabel = "Submit",
  submitVariant = "default",
  size = "default",
  isSubmitting = false,
  submitIconName,
  submitIconComponent,
  errorText,
  className,
  labelClassName,
}: ButtonGroupFormProps) {
  const inputId = React.useMemo(() => {
    return `button-group-input-${name}`;
  }, [name]);

  const errorId = `${inputId}-error`;

  const hasValue = React.useMemo(() => {
    return String(inputProps.value ?? "").trim().length > 0;
  }, [inputProps.value]);

  const hasError = React.useMemo(() => {
    return !!inputProps.error;
  }, [inputProps.error]);

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
      // 'sm' maps to 'icon' (size-9) rather than 'icon-sm' (size-8) so the
      // icon button stays the same height as the h-9 input.
      return size === "default" || size === "sm"
        ? "icon"
        : (`icon-${size}` as const);
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

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <FieldLabel htmlFor={inputId} className={labelClassName}>
          {label}
        </FieldLabel>
      )}
      <ButtonGroup
        className={cn(
          "rounded-md",
          !hasError && hasValue && "ring-2 ring-primary",
          hasError && "ring-2 ring-destructive",
        )}
      >
        <TextInput
          {...inputProps}
          id={inputId}
          suppressValueRing
          aria-describedby={hasError ? errorId : undefined}
          style={{
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            boxShadow: "none",
          }}
          className={cn(
            INPUT_SIZE_CLASSES[size],
            "focus-visible:z-10",
            inputProps.className,
          )}
        />
        <Button
          size={buttonSize}
          type="submit"
          variant={submitVariant}
          disabled={isSubmitting}
          style={{
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            boxShadow: "none",
          }}
          className={cn(
            "relative ring-0",
            // 'sm' button variant is h-8; override to h-9 to align with input
            size === "sm" && "h-9",
          )}
        >
          {isSubmitting ? (
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <Icon
                name="line-md/loading-twotone-loop"
                apiKey={DEFAULT_ICON_API_KEY}
              />
            </span>
          ) : null}
          <span
            className={cn(
              "transition-opacity duration-200 flex items-center justify-center",
              isSubmitting ? "opacity-0" : "opacity-100",
            )}
          >
            {labelElement}
          </span>
        </Button>
      </ButtonGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      <FieldFeedback
        error={errorText}
        shouldRenderError={hasError}
        errorId={errorId}
      />
    </div>
  );
}

ButtonGroupForm.displayName = "ButtonGroupForm";
