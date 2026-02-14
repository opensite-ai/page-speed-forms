import * as React from "react";
import { Label } from "./label";
import { cn } from "../../lib/utils";

type FieldOrientation = "vertical" | "horizontal";

interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: FieldOrientation;
  invalid?: boolean;
}

/**
 * Field - Container component for form inputs with validation display
 *
 * Provides consistent layout and spacing for form fields with labels,
 * inputs, descriptions, and error messages.
 */
const Field = React.forwardRef<HTMLDivElement, FieldProps>(
({ className, orientation = "vertical", invalid = false, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="field"
      data-orientation={orientation}
      data-invalid={invalid || undefined}
      className={cn(
        "flex",
        orientation === "horizontal"
          ? "items-center gap-2"
          : "flex-col gap-1.5",
        className,
      )}
      {...props}
    />
  );
});
Field.displayName = "Field";

/**
 * FieldGroup - Container for multiple related fields
 *
 * Used to group fields together (e.g., first name + last name in a row)
 */
const FieldGroup = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-slot="field-group"
      className={cn("flex flex-col gap-4", className)}
      {...props}
    />
  );
});
FieldGroup.displayName = "FieldGroup";

/**
 * FieldLabel - Label component for form fields
 *
 * Wrapper around ShadCN Label with consistent styling
 */
const FieldLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement> & {
    required?: boolean;
  }
>(({ className, required, children, ...props }, ref) => {
  return (
    <Label
      ref={ref}
      data-slot="field-label"
      className={cn(
        "text-sm font-medium leading-none select-none",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </Label>
  );
});
FieldLabel.displayName = "FieldLabel";

/**
 * FieldDescription - Helper text for form fields
 *
 * Displays additional information or instructions for the field
 */
const FieldDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      data-slot="field-description"
      className={cn("text-sm opacity-70", className)}
      {...props}
    />
  );
});
FieldDescription.displayName = "FieldDescription";

/**
 * FieldError - Error message display for form fields
 *
 * Shows validation errors with proper styling and accessibility
 */
const FieldError = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  return (
    <p
      ref={ref}
      data-slot="field-error"
      role="alert"
      aria-live="polite"
      className={cn("text-sm text-destructive", className)}
      {...props}
    />
  );
});
FieldError.displayName = "FieldError";

export { Field, FieldGroup, FieldLabel, FieldDescription, FieldError };
