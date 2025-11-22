"use client";

import { useCallback, useRef } from "react";
import { useObservable, useSelector } from "@legendapp/state/react";
import type {
  FormValues,
  FormErrors,
  TouchedFields,
  UseFormOptions,
  UseFormReturn,
  SubmissionStatus,
  FieldInputProps,
  FieldMeta,
  FormHelpers,
} from "./types";

/**
 * useForm - High-performance form state management with field-level reactivity
 *
 * Built on @legendapp/state for optimal performance:
 * - Field-level reactivity: Only re-render the specific field that changed
 * - Observable-based state: ~1 re-render per change vs ~10 for traditional hooks
 * - Tree-shakable: Only bundle what you use
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   initialValues: { email: '', password: '' },
 *   onSubmit: async (values) => {
 *     await login(values);
 *   },
 *   validationSchema: {
 *     email: (value) => !value ? 'Required' : undefined,
 *     password: (value) => value.length < 8 ? 'Too short' : undefined,
 *   },
 * });
 *
 * return (
 *   <form onSubmit={form.handleSubmit}>
 *     <input {...form.getFieldProps('email')} />
 *     {form.errors.email && <span>{form.errors.email}</span>}
 *   </form>
 * );
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/use-form
 */
export function useForm<T extends FormValues = FormValues>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validationSchema,
    validateOn = "onBlur",
    revalidateOn = "onChange",
    onSubmit,
    onError,
    debug = false,
  } = options;

  // Create observable form state for field-level reactivity
  // Note: Type assertion needed for @legendapp/state beta compatibility
  // The beta version's TypeScript types don't properly expose nested Observable properties
  // This will be removed once stable v3.0.0 is released with proper type definitions
  const state$ = useObservable({
    values: initialValues,
    errors: {} as FormErrors<T>,
    touched: {} as TouchedFields<T>,
    isSubmitting: false,
    status: "idle" as SubmissionStatus,
    initialValues: { ...initialValues }, // Create a copy to prevent reference sharing
    hasValidated: {} as Record<string, boolean>,
  }) as any;

  // Track validation in progress to prevent race conditions
  const validationInProgress = useRef<Set<string>>(new Set());

  /**
   * Validate a single field
   */
  const validateField = useCallback(
    async <K extends keyof T>(field: K): Promise<string | undefined> => {
      const validators = validationSchema?.[field];
      if (!validators) return undefined;

      const fieldKey = String(field);
      validationInProgress.current.add(fieldKey);

      try {
        const value = state$.values[field].get();
        const allValues = state$.values.get();

        const validatorArray = Array.isArray(validators)
          ? validators
          : [validators];

        for (const validator of validatorArray) {
          const error = await validator(value, allValues);
          if (error) {
            state$.errors[field].set(error);
            validationInProgress.current.delete(fieldKey);
            return error;
          }
        }

        // Clear error if validation passed
        state$.errors[field].set(undefined);
        validationInProgress.current.delete(fieldKey);
        return undefined;
      } catch (error) {
        validationInProgress.current.delete(fieldKey);
        const errorMessage =
          error instanceof Error ? error.message : "Validation error";
        state$.errors[field].set(errorMessage);
        return errorMessage;
      }
    },
    [validationSchema, state$]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback(async (): Promise<FormErrors<T>> => {
    if (!validationSchema) return {};

    const fields = Object.keys(validationSchema) as Array<keyof T>;
    const errors: FormErrors<T> = {};

    await Promise.all(
      fields.map(async (field) => {
        const error = await validateField(field);
        if (error) {
          errors[field] = error;
        }
      })
    );

    state$.errors.set(errors);
    return errors;
  }, [validationSchema, validateField, state$]);

  /**
   * Set field value with optional validation
   */
  const setFieldValue = useCallback(
    <K extends keyof T>(field: K, value: T[K]) => {
      state$.values[field].set(value);

      // Revalidate if field has been validated before
      const shouldRevalidate =
        revalidateOn === "onChange" &&
        state$.hasValidated[String(field)].get();

      if (shouldRevalidate && validationSchema?.[field]) {
        validateField(field);
      }

      if (debug) {
        console.log("[useForm] setFieldValue:", { field, value });
      }
    },
    [state$, revalidateOn, validationSchema, validateField, debug]
  );

  /**
   * Set field as touched with optional validation
   */
  const setFieldTouched = useCallback(
    <K extends keyof T>(field: K, touched: boolean) => {
      state$.touched[field].set(touched);

      // Validate on blur if configured
      if (touched && validateOn === "onBlur" && validationSchema?.[field]) {
        state$.hasValidated[String(field)].set(true);
        validateField(field);
      }

      if (debug) {
        console.log("[useForm] setFieldTouched:", { field, touched });
      }
    },
    [state$, validateOn, validationSchema, validateField, debug]
  );

  /**
   * Reset form to initial values
   */
  const resetForm = useCallback(() => {
    state$.values.set(state$.initialValues.get());
    state$.errors.set({});
    state$.touched.set({});
    state$.isSubmitting.set(false);
    state$.status.set("idle");
    state$.hasValidated.set({});

    if (debug) {
      console.log("[useForm] Form reset");
    }
  }, [state$, debug]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault();

      if (debug) {
        console.log("[useForm] handleSubmit started");
      }

      state$.isSubmitting.set(true);
      state$.status.set("submitting");

      try {
        // Validate form
        const errors = await validateForm();
        const hasErrors = Object.keys(errors).length > 0;

        if (hasErrors) {
          state$.status.set("error");
          onError?.(errors);

          if (debug) {
            console.log("[useForm] Validation errors:", errors);
          }

          return;
        }

        // Create form helpers
        const helpers: FormHelpers<T> = {
          setValues: (values) => {
            if (typeof values === "function") {
              state$.values.set(values(state$.values.get()));
            } else {
              state$.values.set(values);
            }
          },
          setFieldValue,
          setErrors: (errors) => state$.errors.set(errors),
          setFieldError: (field, error) => state$.errors[field].set(error),
          setTouched: (touched) => state$.touched.set(touched),
          setFieldTouched,
          setSubmitting: (submitting) => state$.isSubmitting.set(submitting),
          resetForm,
        };

        // Call submission handler
        await onSubmit(state$.values.get(), helpers);

        state$.status.set("success");

        if (debug) {
          console.log("[useForm] Submit successful");
        }
      } catch (error) {
        state$.status.set("error");

        if (debug) {
          console.error("[useForm] Submit error:", error);
        }

        throw error;
      } finally {
        state$.isSubmitting.set(false);
      }
    },
    [
      state$,
      validateForm,
      onSubmit,
      onError,
      setFieldValue,
      setFieldTouched,
      resetForm,
      debug,
    ]
  );

  /**
   * Get field props for binding to inputs
   */
  const getFieldProps = useCallback(
    <K extends keyof T>(field: K): FieldInputProps<T[K]> => {
      return {
        name: String(field),
        value: state$.values[field].get(),
        onChange: (value: T[K]) => setFieldValue(field, value),
        onBlur: () => setFieldTouched(field, true),
      };
    },
    [state$, setFieldValue, setFieldTouched]
  );

  /**
   * Get field meta information
   */
  const getFieldMeta = useCallback(
    <K extends keyof T>(field: K): FieldMeta => {
      const fieldKey = String(field);
      return {
        error: state$.errors[field].get(),
        touched: state$.touched[field].get() ?? false,
        isDirty:
          state$.values[field].get() !== state$.initialValues[field].get(),
        isValidating: validationInProgress.current.has(fieldKey),
      };
    },
    [state$]
  );

  // Use selectors for reactive properties
  const values = useSelector(() => state$.values.get());
  const errors = useSelector(() => state$.errors.get());
  const touched = useSelector(() => state$.touched.get());
  const isSubmitting = useSelector(() => state$.isSubmitting.get());
  const status = useSelector(() => state$.status.get());

  // Use selectors for derived state to ensure reactivity
  const isValid = useSelector(() => Object.keys(state$.errors.get()).length === 0);
  const isDirty = useSelector(() => {
    const currentValues = state$.values.get();
    const initialValues = state$.initialValues.get();
    return Object.keys(currentValues).some(
      (key) => currentValues[key] !== initialValues[key]
    );
  });

  return {
    // State
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    isDirty,
    status,

    // Actions
    handleSubmit,
    setValues: (values) => {
      if (typeof values === "function") {
        state$.values.set(values(state$.values.get()));
      } else {
        state$.values.set(values);
      }
    },
    setFieldValue,
    setErrors: (errors) => state$.errors.set(errors),
    setFieldError: (field, error) => state$.errors[field].set(error),
    setTouched: (touched) => state$.touched.set(touched),
    setFieldTouched,
    validateForm,
    validateField,
    resetForm,
    getFieldProps,
    getFieldMeta,
  };
}
