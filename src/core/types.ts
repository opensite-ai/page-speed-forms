/**
 * Core TypeScript types for @page-speed/forms
 *
 * Provides type-safe form state management, validation, and submission handling
 */

import type { ReactNode } from "react";

/**
 * Generic form values type
 * Represents the structure of form data
 */
export type FormValues = Record<string, any>;

/**
 * Form errors type
 * Maps field names to error messages
 */
export type FormErrors<T extends FormValues = FormValues> = {
  [K in keyof T]?: string | string[];
};

/**
 * Touched fields type
 * Tracks which fields have been interacted with
 */
export type TouchedFields<T extends FormValues = FormValues> = {
  [K in keyof T]?: boolean;
};

/**
 * Field validation function
 * Validates a single field value
 */
export type FieldValidator<T = any> = (
  value: T,
  allValues: FormValues
) => string | undefined | Promise<string | undefined>;

/**
 * Form validation schema
 * Defines validation rules for form fields
 */
export type ValidationSchema<T extends FormValues = FormValues> = {
  [K in keyof T]?: FieldValidator<T[K]> | FieldValidator<T[K]>[];
};

/**
 * Validation mode configuration
 */
export type ValidationMode = "onChange" | "onBlur" | "onSubmit";

/**
 * Form submission status
 */
export type SubmissionStatus = "idle" | "submitting" | "success" | "error";

/**
 * Form helpers provided to submission handler
 */
export interface FormHelpers<T extends FormValues = FormValues> {
  /**
   * Set form values
   */
  setValues: (values: T | ((prev: T) => T)) => void;

  /**
   * Set a single field value
   */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;

  /**
   * Set form errors
   */
  setErrors: (errors: FormErrors<T>) => void;

  /**
   * Set a single field error
   */
  setFieldError: <K extends keyof T>(field: K, error: string | undefined) => void;

  /**
   * Set touched fields
   */
  setTouched: (touched: TouchedFields<T>) => void;

  /**
   * Set a single field as touched
   */
  setFieldTouched: <K extends keyof T>(field: K, touched: boolean) => void;

  /**
   * Mark submission as complete
   */
  setSubmitting: (submitting: boolean) => void;

  /**
   * Reset form to initial values
   */
  resetForm: () => void;
}

/**
 * Form submission handler
 */
export type SubmitHandler<T extends FormValues = FormValues> = (
  values: T,
  helpers: FormHelpers<T>
) => void | Promise<void>;

/**
 * Form error handler
 */
export type ErrorHandler<T extends FormValues = FormValues> = (
  errors: FormErrors<T>
) => void;

/**
 * useForm hook options
 */
export interface UseFormOptions<T extends FormValues = FormValues> {
  /**
   * Initial form values
   */
  initialValues: T;

  /**
   * Validation schema
   */
  validationSchema?: ValidationSchema<T>;

  /**
   * When to validate fields
   * @default "onBlur"
   */
  validateOn?: ValidationMode;

  /**
   * When to revalidate fields after initial validation
   * @default "onChange"
   */
  revalidateOn?: ValidationMode;

  /**
   * Form submission handler
   */
  onSubmit: SubmitHandler<T>;

  /**
   * Form error handler
   */
  onError?: ErrorHandler<T>;

  /**
   * Enable debug mode
   * @default false
   */
  debug?: boolean;
}

/**
 * Form state returned by useForm
 */
export interface FormState<T extends FormValues = FormValues> {
  /**
   * Current form values
   */
  values: T;

  /**
   * Current form errors
   */
  errors: FormErrors<T>;

  /**
   * Touched fields
   */
  touched: TouchedFields<T>;

  /**
   * Is form currently submitting
   */
  isSubmitting: boolean;

  /**
   * Is form valid (no errors)
   */
  isValid: boolean;

  /**
   * Has form been touched
   */
  isDirty: boolean;

  /**
   * Submission status
   */
  status: SubmissionStatus;
}

/**
 * Form actions returned by useForm
 */
export interface FormActions<T extends FormValues = FormValues> {
  /**
   * Handle form submission
   */
  handleSubmit: (e?: React.FormEvent) => Promise<void>;

  /**
   * Set form values
   */
  setValues: (values: T | ((prev: T) => T)) => void;

  /**
   * Set a single field value
   */
  setFieldValue: <K extends keyof T>(field: K, value: T[K]) => void;

  /**
   * Set form errors
   */
  setErrors: (errors: FormErrors<T>) => void;

  /**
   * Set a single field error
   */
  setFieldError: <K extends keyof T>(field: K, error: string | undefined) => void;

  /**
   * Set touched fields
   */
  setTouched: (touched: TouchedFields<T>) => void;

  /**
   * Set a single field as touched
   */
  setFieldTouched: <K extends keyof T>(field: K, touched: boolean) => void;

  /**
   * Validate entire form
   */
  validateForm: () => Promise<FormErrors<T>>;

  /**
   * Validate a single field
   */
  validateField: <K extends keyof T>(field: K) => Promise<string | undefined>;

  /**
   * Reset form to initial values
   */
  resetForm: () => void;

  /**
   * Get field props for binding to inputs
   */
  getFieldProps: <K extends keyof T>(field: K) => FieldInputProps<T[K]>;

  /**
   * Get field meta information
   */
  getFieldMeta: <K extends keyof T>(field: K) => FieldMeta;
}

/**
 * Complete form API returned by useForm
 */
export type UseFormReturn<T extends FormValues = FormValues> = FormState<T> &
  FormActions<T>;

/**
 * Field input props for binding to form inputs
 */
export interface FieldInputProps<T = any> {
  name: string;
  value: T;
  onChange: (value: T) => void;
  onBlur: () => void;
}

/**
 * Field meta information
 * Enhanced with @opensite/hooks metadata tracking
 */
export interface FieldMeta {
  error?: string | string[];
  touched: boolean;
  isDirty: boolean;
  isValidating: boolean;
  // Additional metadata from @opensite/hooks useMap
  validationCount?: number;
  lastValidated?: number;
}

/**
 * useField hook options
 */
export interface UseFieldOptions<T = any> {
  /**
   * Field name
   */
  name: string;

  /**
   * Field validator
   */
  validate?: FieldValidator<T>;

  /**
   * Transform value before setting
   */
  transform?: (value: any) => T;
}

/**
 * Field state returned by useField
 */
export interface UseFieldReturn<T = any> {
  /**
   * Input props for binding to form controls
   */
  field: FieldInputProps<T>;

  /**
   * Field meta information
   */
  meta: FieldMeta;

  /**
   * Field helpers
   */
  helpers: {
    setValue: (value: T) => void;
    setTouched: (touched: boolean) => void;
    setError: (error: string | undefined) => void;
  };
}

/**
 * Form component props
 */
export interface FormProps<T extends FormValues = FormValues> {
  /**
   * Form instance from useForm
   */
  form: UseFormReturn<T>;

  /**
   * Form children
   */
  children: ReactNode;

  /**
   * Additional className
   */
  className?: string;

  /**
   * Form action URL (for progressive enhancement)
   */
  action?: string;

  /**
   * Form method (for progressive enhancement)
   */
  method?: "get" | "post";

  /**
   * Disable browser validation
   * @default true
   */
  noValidate?: boolean;
}

/**
 * Field component props
 */
export interface FieldProps {
  /**
   * Field name
   */
  name: string;

  /**
   * Field label
   */
  label?: ReactNode;

  /**
   * Field description
   */
  description?: ReactNode;

  /**
   * Field children (render prop or component)
   */
  children: ReactNode | ((field: UseFieldReturn) => ReactNode);

  /**
   * Show error immediately
   * @default false
   */
  showError?: boolean;

  /**
   * Additional className
   */
  className?: string;

  /**
   * Field validator
   */
  validate?: FieldValidator;
}

/**
 * Input component base props
 */
export interface InputProps<T = string> {
  /**
   * Input name
   */
  name: string;

  /**
   * Input value
   */
  value: T;

  /**
   * Change handler
   */
  onChange: (value: T) => void;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Placeholder text
   */
  placeholder?: string;

  /**
   * Is input disabled
   */
  disabled?: boolean;

  /**
   * Is input required
   */
  required?: boolean;

  /**
   * Has error
   */
  error?: boolean;

  /**
   * Additional className
   */
  className?: string;

  /**
   * ARIA attributes
   */
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
  "aria-required"?: boolean;
}
