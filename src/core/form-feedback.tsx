"use client";

import * as React from "react";
import { cn } from "../utils";

export interface FormFeedbackProps {
  successMessage?: React.ReactNode;
  submissionError?: React.ReactNode;
  successMessageClassName?: string;
  errorMessageClassName?: string;
}

function renderMessage(
  message: React.ReactNode,
  fallbackClassName: string,
  className?: string,
) {
  if (typeof message === "string") {
    return (
      <p className={cn("text-sm font-medium text-center text-balance", className)}>
        {message}
      </p>
    );
  }

  return (
    <div className={cn(fallbackClassName, className)}>
      {message}
    </div>
  );
}

export function FormFeedback({
  successMessage,
  submissionError,
  successMessageClassName,
  errorMessageClassName,
}: FormFeedbackProps) {
  if (!successMessage && !submissionError) {
    return null;
  }

  return (
    <>
      {successMessage ? (
        <div
          className={cn(
            "rounded-md border border-primary bg-primary px-4 py-3 shadow-sm",
            successMessageClassName,
          )}
          role="status"
          aria-live="polite"
        >
          {renderMessage(successMessage, "text-primary-foreground", "text-primary-foreground")}
        </div>
      ) : null}

      {submissionError ? (
        <div
          className={cn(
            "rounded-md border border-destructive bg-destructive px-4 py-3 shadow-sm",
            errorMessageClassName,
          )}
          role="alert"
          aria-live="assertive"
        >
          {renderMessage(
            submissionError,
            "text-destructive-foreground",
            "text-destructive-foreground",
          )}
        </div>
      ) : null}
    </>
  );
}

FormFeedback.displayName = "FormFeedback";
