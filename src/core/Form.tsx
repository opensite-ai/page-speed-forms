"use client";

import * as React from "react";
import { FormContext } from "./FormContext";
import type { FormProps, FormValues } from "./types";

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
  ...props
}: FormProps<T> & React.FormHTMLAttributes<HTMLFormElement>) {
  // Wrap handleSubmit to catch any unhandled rejections
  const handleFormSubmit = React.useCallback(
    async (e: React.FormEvent) => {
      try {
        await form.handleSubmit(e);
      } catch (error) {
        // Error is already handled by useForm, just prevent unhandled rejection
        // The form status and errors are already set by useForm's error handling
      }
    },
    [form]
  );

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
        {children}
      </form>
    </FormContext.Provider>
  );
}

Form.displayName = "Form";
