"use client";

import * as React from "react";
import { FieldMeta } from "./types";
import { FieldError } from "../components/ui/field";
import { cn } from "../lib/utils";

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
  const showError = Boolean(errorText && shouldRenderError);

  return (
    <FieldError
      id={errorId}
      className={cn(errorClassName, !showError && "invisible")}
      aria-hidden={!showError || undefined}
    >
      {showError ? errorText : "\u00A0"}
    </FieldError>
  );
};

export { FieldFeedback };
