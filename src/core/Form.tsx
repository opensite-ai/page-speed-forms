"use client";

import * as React from "react";
import { FormContext } from "./FormContext";
import type { FormProps, FormValues } from "./types";
import { FormFeedback } from "./form-feedback";
import { Button } from "../components/ui/button";

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
  method,
  noValidate = true,
  submissionConfig,
  successMessage,
  submissionError,
  successMessageClassName,
  errorMessageClassName,
  onNewSubmission,
  notificationConfig,
  styleConfig,
  formConfig,
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
    [form],
  );

  const resolvedClassName = className ?? styleConfig?.formClassName;
  const resolvedAction = action ?? formConfig?.endpoint;
  const resolvedMethod = method ?? formConfig?.method ?? "post";
  const resolvedSubmissionConfig = submissionConfig ?? formConfig?.submissionConfig;
  const resolvedSuccessMessage =
    successMessage ?? notificationConfig?.successMessage;
  const resolvedSubmissionError =
    submissionError ?? notificationConfig?.submissionError;
  const resolvedSuccessMessageClassName =
    successMessageClassName ?? styleConfig?.successMessageClassName;
  const resolvedErrorMessageClassName =
    errorMessageClassName ?? styleConfig?.errorMessageClassName;

  const behavior = resolvedSubmissionConfig?.behavior || "showConfirmation";

  const shouldManageSubmissionUi =
    resolvedSubmissionConfig !== undefined ||
    resolvedSuccessMessage !== undefined ||
    resolvedSuccessMessageClassName !== undefined ||
    resolvedErrorMessageClassName !== undefined ||
    resolvedSubmissionError != null ||
    onNewSubmission !== undefined;

  const hasSubmissionError = Boolean(resolvedSubmissionError);

  const isSubmissionSuccessful =
    shouldManageSubmissionUi &&
    form.status === "success" &&
    !hasSubmissionError;

  const defaultSuccessMessage =
    behavior === "redirect"
      ? "Form submitted successfully. Redirecting..."
      : "Thank you. Your form has been submitted successfully.";

  const finalSuccessMessage = resolvedSuccessMessage ?? defaultSuccessMessage;

  const shouldRenderCustomComponent =
    isSubmissionSuccessful &&
    behavior === "renderCustomComponent" &&
    Boolean(resolvedSubmissionConfig?.customComponent);

  const newSubmissionAction = resolvedSubmissionConfig?.newFormSubmissionAction;

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
        action={resolvedAction}
        method={resolvedMethod}
        noValidate={noValidate}
        className={resolvedClassName}
        {...props}
      >
        {isSubmissionSuccessful ? (
          <div className="space-y-4">
            {shouldRenderCustomComponent ? (
              resolvedSubmissionConfig?.customComponent
            ) : (
              <FormFeedback
                successMessage={finalSuccessMessage}
                successMessageClassName={resolvedSuccessMessageClassName}
              />
            )}

            {showNewSubmissionAction ? (
              <Button
                type="button"
                variant="outline"
                onClick={handleNewSubmission}
              >
                {newSubmissionLabel}
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            {children}
            {resolvedSubmissionError ? (
              <div className="mt-4">
                <FormFeedback
                  submissionError={resolvedSubmissionError}
                  errorMessageClassName={resolvedErrorMessageClassName}
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
