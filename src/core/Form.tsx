"use client";

import * as React from "react";
import { FormContext } from "./FormContext";
import type { FormProps, FormValues } from "./types";
import { FormFeedback } from "./form-feedback";
import { cn } from "../utils";

/**
 * Form - Progressive enhancement form component
 *
 * Provides form context to child components and handles form submission.
 * Supports progressive enhancement with server-side fallback.
 *
 * Features:
 * - Provides FormContext for useField hook
 * - Handles form submission with validation
 * - Progressive enhancement support (works without JavaScript)
 * - Accessible form semantics
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   initialValues: { email: '' },
 *   onSubmit: async (values) => {
 *     await submitForm(values);
 *   },
 * });
 *
 * return (
 *   <Form form={form} action="/api/submit" method="post">
 *     <input {...form.getFieldProps('email')} />
 *     <button type="submit">Submit</button>
 *   </Form>
 * );
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/form
 */
export function Form<T extends FormValues = FormValues>({
  form,
  children,
  className,
  action,
  method = "post",
  noValidate = true,
  submissionConfig,
  successMessage,
  submissionError,
  successMessageClassName,
  errorMessageClassName,
  onNewSubmission,
  ...props
}: FormProps<T> & React.FormHTMLAttributes<HTMLFormElement>) {
  // Wrap handleSubmit to catch any unhandled rejections
  const handleFormSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      try {
        await form.handleSubmit(e);
      } catch {
        // Error is already handled by useForm, just prevent unhandled rejection
        // The form status and errors are already set by useForm's error handling
      }
    },
    [form]
  );

  const behavior = submissionConfig?.behavior || "showConfirmation";

  const shouldManageSubmissionUi =
    submissionConfig !== undefined ||
    successMessage !== undefined ||
    successMessageClassName !== undefined ||
    errorMessageClassName !== undefined ||
    submissionError != null ||
    onNewSubmission !== undefined;

  const hasSubmissionError = Boolean(submissionError);

  const isSubmissionSuccessful =
    shouldManageSubmissionUi && form.status === "success" && !hasSubmissionError;

  const defaultSuccessMessage =
    behavior === "redirect"
      ? "Form submitted successfully. Redirecting..."
      : "Thank you. Your form has been submitted successfully.";

  const resolvedSuccessMessage = successMessage ?? defaultSuccessMessage;

  const shouldRenderCustomComponent =
    isSubmissionSuccessful &&
    behavior === "renderCustomComponent" &&
    Boolean(submissionConfig?.customComponent);

  const newSubmissionAction = submissionConfig?.newFormSubmissionAction;

  const showNewSubmissionAction =
    isSubmissionSuccessful &&
    (typeof newSubmissionAction?.enable === "boolean"
      ? newSubmissionAction.enable
      : Boolean(newSubmissionAction?.label));

  const newSubmissionLabel =
    newSubmissionAction?.label ?? "Submit another response";

  const handleNewSubmission = React.useCallback(() => {
    form.resetForm();
    onNewSubmission?.();
  }, [form, onNewSubmission]);

  return (
    <FormContext.Provider value={form}>
      <form
        onSubmit={handleFormSubmit}
        action={action}
        method={method}
        noValidate={noValidate}
        className={className}
        {...props}
      >
        {isSubmissionSuccessful ? (
          <div className="space-y-4">
            {shouldRenderCustomComponent ? (
              submissionConfig?.customComponent
            ) : (
              <FormFeedback
                successMessage={resolvedSuccessMessage}
                successMessageClassName={successMessageClassName}
              />
            )}

            {showNewSubmissionAction ? (
              <button
                type="button"
                onClick={handleNewSubmission}
                className={cn(
                  "inline-flex items-center justify-center whitespace-nowrap rounded-md border border-input bg-transparent px-4 py-2 text-sm font-medium shadow-sm transition-colors",
                  "hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                )}
              >
                {newSubmissionLabel}
              </button>
            ) : null}
          </div>
        ) : (
          <>
            {children}
            {submissionError ? (
              <div className="mt-4">
                <FormFeedback
                  submissionError={submissionError}
                  errorMessageClassName={errorMessageClassName}
                />
              </div>
            ) : null}
          </>
        )}
      </form>
    </FormContext.Provider>
  );
}

Form.displayName = "Form";
