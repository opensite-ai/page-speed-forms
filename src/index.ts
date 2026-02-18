/**
 * @page-speed/forms
 *
 * Ultra-high-performance React form library with field-level reactivity.
 * Built on @legendapp/state for optimal performance and tree-shakable architecture.
 *
 * Bundle Sizes (gzipped):
 * - Core module: ~7KB (useForm, Form, Field, useField)
 * - Text input: ~0.5KB
 * - Valibot adapter: ~0.6KB
 *
 * Performance:
 * - ~1 re-render per field change (vs ~10 for traditional hooks)
 * - Field-level reactivity via observable state
 * - Tree-shakable imports - only bundle what you use
 *
 * @example
 * ```tsx
 * import { useForm, Form, Field } from '@page-speed/forms';
 * import { TextInput } from '@page-speed/forms/inputs';
 *
 * function LoginForm() {
 *   const form = useForm({
 *     initialValues: { email: '', password: '' },
 *     onSubmit: async (values) => {
 *       await login(values);
 *     },
 *   });
 *
 *   return (
 *     <Form form={form}>
 *       <Field name="email" label="Email">
 *         {({ field }) => <TextInput {...field} type="email" />}
 *       </Field>
 *       <Field name="password" label="Password">
 *         {({ field }) => <TextInput {...field} type="password" />}
 *       </Field>
 *       <button type="submit">Login</button>
 *     </Form>
 *   );
 * }
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms
 * @see https://github.com/opensite-ai/page-speed-forms
 */

// Core exports (main entry point)
export {
  useForm,
  useField,
  Form,
  Field,
  FormFeedback,
  FormContext,
} from "./core";

export type {
  FormValues,
  FormErrors,
  TouchedFields,
  FieldValidator,
  ValidationSchema,
  ValidationMode,
  SubmissionStatus,
  FormSubmissionBehavior,
  NewFormSubmissionActionConfig,
  FormSubmissionConfig,
  FormNotificationConfig,
  FormStyleConfig,
  FormRenderConfig,
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
  FormFeedbackProps,
} from "./core";

// Field layout components (ShadCN-based)
export {
  Field as FieldWrapper,
  FieldGroup,
  FieldLabel as FormFieldLabel,
  FieldDescription,
  FieldError,
} from "./components/ui/field";
