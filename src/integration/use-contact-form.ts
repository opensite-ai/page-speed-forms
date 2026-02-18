"use client";

import { useCallback, useMemo, useState } from "react";
import { useForm as usePageSpeedForm } from "../core/useForm";
import type { UseFormReturn } from "../core/types";
import type { FormFieldConfig } from "./form-field-types";
import {
  generateInitialValues,
  generateValidationSchema,
} from "./form-field-types";
import {
  PageSpeedFormSubmissionError,
  submitPageSpeedForm,
  type PageSpeedFormConfig,
} from "./form-submit";

export interface UseContactFormOptions {
  /**
   * Form field configurations.
   */
  formFields: FormFieldConfig[];
  /**
   * Form submission configuration.
   */
  formConfig?: PageSpeedFormConfig;
  /**
   * Optional custom submit handler.
   */
  onSubmit?: (values: Record<string, any>) => void | Promise<void>;
  /**
   * Optional success callback.
   */
  onSuccess?: (data: unknown) => void;
  /**
   * Optional error callback.
   */
  onError?: (error: Error) => void;
  /**
   * Reset form values after successful submission.
   * @default true
   */
  resetOnSuccess?: boolean;
  /**
   * File upload tokens merged into payload.
   */
  uploadTokens?: string[];
  /**
   * Optional app-level navigation handler for internal redirects.
   * Return `false` to force fallback browser navigation.
   */
  navigate?: (href: string) => boolean | void;
}

export interface UseContactFormReturn {
  form: UseFormReturn<Record<string, any>>;
  isSubmitted: boolean;
  submissionError: string | null;
  formMethod: "get" | "post";
  resetSubmissionState: () => void;
}

interface RedirectResolution {
  destination: string;
  internalHref?: string;
}

function resolveRedirect(redirectUrl: string): RedirectResolution {
  const trimmed = redirectUrl.trim();
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return { destination: trimmed, internalHref: trimmed };
  }

  if (typeof window === "undefined") {
    return { destination: trimmed };
  }

  try {
    const url = new URL(trimmed, window.location.href);
    if (url.origin === window.location.origin) {
      return {
        destination: url.toString(),
        internalHref: `${url.pathname}${url.search}${url.hash}`,
      };
    }

    return { destination: url.toString() };
  } catch {
    return { destination: trimmed };
  }
}

/**
 * Form orchestration helper for dynamic contact forms.
 */
export function useContactForm(
  options: UseContactFormOptions,
): UseContactFormReturn {
  const {
    formFields,
    formConfig,
    onSubmit,
    onSuccess,
    onError,
    resetOnSuccess = true,
    uploadTokens = [],
    navigate,
  } = options;

  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const submissionConfig = formConfig?.submissionConfig;
  const redirectUrl = submissionConfig?.redirectUrl;

  const resetSubmissionState = useCallback(() => {
    setSubmissionError(null);
  }, []);

  const performRedirect = useCallback(() => {
    if (!redirectUrl || typeof window === "undefined") {
      return;
    }

    const { destination, internalHref } = resolveRedirect(redirectUrl);

    const attemptInternalNavigation = () => {
      if (!internalHref) return false;

      if (navigate) {
        return navigate(internalHref) !== false;
      }

      const handler = (window as any).__opensiteNavigationHandler;
      if (typeof handler === "function") {
        try {
          return handler(internalHref, undefined) !== false;
        } catch {
          return false;
        }
      }

      return false;
    };

    window.setTimeout(() => {
      if (attemptInternalNavigation()) return;
      window.location.assign(destination);
    }, 150);
  }, [navigate, redirectUrl]);

  const form = usePageSpeedForm<Record<string, any>>({
    initialValues: useMemo(
      () => generateInitialValues(formFields),
      [formFields],
    ),
    validationSchema: useMemo(
      () => generateValidationSchema(formFields),
      [formFields],
    ),
    onSubmit: async (values, helpers) => {
      resetSubmissionState();
      const shouldAutoSubmit = Boolean(formConfig?.endpoint);

      if (!shouldAutoSubmit && !onSubmit) {
        return;
      }

      try {
        let result: unknown;

        const submissionValues = {
          ...values,
          ...(uploadTokens.length > 0 && {
            contact_form_upload_tokens: uploadTokens,
          }),
        };

        if (shouldAutoSubmit) {
          result = await submitPageSpeedForm(submissionValues, formConfig);
        }

        if (onSubmit) {
          await onSubmit(submissionValues);
        }

        if (shouldAutoSubmit || onSubmit) {
          try {
            await submissionConfig?.handleFormSubmission?.({
              formData: submissionValues,
              responseData: result,
            });
          } catch {
            // Callback errors should not fail the submission lifecycle.
          }

          if (resetOnSuccess) {
            helpers.resetForm();
          }

          onSuccess?.(result);

          if (
            submissionConfig?.behavior === "redirect" &&
            submissionConfig.redirectUrl
          ) {
            performRedirect();
          }
        }
      } catch (error) {
        if (error instanceof PageSpeedFormSubmissionError && error.formErrors) {
          helpers.setErrors(error.formErrors);
        }

        const errorMessage =
          error instanceof Error ? error.message : "Form submission failed";
        setSubmissionError(errorMessage);
        onError?.(error as Error);
      }
    },
  });

  const formMethod =
    formConfig?.method?.toLowerCase() === "get" ? "get" : "post";

  return {
    form,
    isSubmitted: form.status === "success",
    submissionError,
    formMethod,
    resetSubmissionState,
  };
}
