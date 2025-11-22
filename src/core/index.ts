/**
 * @page-speed/forms - Core Module
 *
 * High-performance form state management with field-level reactivity.
 * Built on @legendapp/state for optimal performance.
 *
 * Features:
 * - Field-level reactivity (~1 re-render per change)
 * - Observable-based state management
 * - Tree-shakable architecture
 * - Full TypeScript support
 * - Progressive enhancement
 * - Accessibility built-in
 *
 * @see https://opensite.ai/developers/page-speed/forms/core
 */

// Hooks
export { useForm } from "./useForm";
export { useField } from "./useField";

// Components
export { Form } from "./Form";
export { Field } from "./Field";

// Context
export { FormContext } from "./FormContext";

// Types
export type {
  FormValues,
  FormErrors,
  TouchedFields,
  FieldValidator,
  ValidationSchema,
  ValidationMode,
  SubmissionStatus,
  FormHelpers,
  SubmitHandler,
  ErrorHandler,
  UseFormOptions,
  FormState,
  FormActions,
  UseFormReturn,
  FieldInputProps,
  FieldMeta,
  UseFieldOptions,
  UseFieldReturn,
  FormProps,
  FieldProps,
  InputProps,
} from "./types";
