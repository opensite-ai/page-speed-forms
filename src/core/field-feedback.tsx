"use client";

import * as React from "react";
import { FieldMeta } from "./types";
import { cn } from "../utils";

type Props = {
  errorId?: string;
  errorClassName?: string;
  shouldRenderError?: boolean;
  error?: FieldMeta["error"];
};
const FieldFeedback = ({
  errorId,
  errorClassName,
  error,
  shouldRenderError,
}: Props) => {
  const errorText = Array.isArray(error) ? error.join(", ") : error;
  if (!errorText || !shouldRenderError) return null;

  return (
    <div
      id={errorId}
      className={cn(
        "text-xs px-3 py-2 font-medium",
        "rounded-md shadow-md mt-2",
        "text-destructive-foreground bg-destructive",
        "border border-destructive",
        errorClassName,
      )}
      role="alert"
      aria-live="polite"
    >
      {errorText}
    </div>
  );
};

export { FieldFeedback };
