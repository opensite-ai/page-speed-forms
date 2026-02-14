"use client";

import * as React from "react";
import { FieldMeta } from "./types";
import { FieldError } from "../components/ui/field";

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
    <FieldError id={errorId} className={errorClassName}>
      {errorText}
    </FieldError>
  );
};

export { FieldFeedback };
