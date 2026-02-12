"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { cn } from "../utils";

export type LabelGroupProps = {
  variant?: "legend" | "label" | "text";
  secondary?: ReactNode;
  secondaryId?: string;
  primary?: ReactNode;
  labelHtmlFor?: string;
  required?: boolean;
  primaryClassName?: string;
  secondaryClassName?: string;
};

const LabelGroup = ({
  labelHtmlFor,
  required = false,
  variant = "label",
  secondaryId,
  secondary,
  primary,
  primaryClassName,
  secondaryClassName,
}: LabelGroupProps) => {
  const primaryClasses = cn(
    "text-sm font-medium leading-snug",
    variant === "legend" ? "mb-1.5" : "mb-1 block",
    primaryClassName,
  );

  const requiredIndicator = required ? (
    <span className="text-destructive pl-0.5" aria-label="required">
      *
    </span>
  ) : null;

  let primaryElement: ReactNode = null;
  if (primary) {
    if (variant === "label") {
      primaryElement = (
        <label
          htmlFor={labelHtmlFor}
          data-slot="field-label"
          className={primaryClasses}
        >
          {primary}
          {requiredIndicator}
        </label>
      );
    } else if (variant === "legend") {
      primaryElement = (
        <legend data-slot="field-legend" className={primaryClasses}>
          {primary}
          {requiredIndicator}
        </legend>
      );
    } else {
      primaryElement = (
        <div data-slot="field-label" className={primaryClasses}>
          {primary}
          {requiredIndicator}
        </div>
      );
    }
  }

  const secondaryElement = secondary ? (
    <p
      data-slot="field-description"
      id={secondaryId}
      className={cn("text-sm leading-normal font-normal", secondaryClassName)}
    >
      {secondary}
    </p>
  ) : null;

  if (!primaryElement && !secondaryElement) return null;

  return (
    <>
      {primaryElement}
      {secondaryElement}
    </>
  );
};

export { LabelGroup };
