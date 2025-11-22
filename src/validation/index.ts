/**
 * @page-speed/forms - Validation Module
 *
 * Tree-shakable validation utilities and adapters.
 * Import only what you need to keep bundle size minimal.
 *
 * @see https://opensite.ai/developers/page-speed/forms/validation
 */

// Note: Valibot adapter is in a separate entry point
// Import it via: import { createValibotSchema } from '@page-speed/forms/validation/valibot'

// Re-export validation types from core
export type {
  FieldValidator,
  ValidationSchema,
  ValidationMode,
} from "../core/types";

// Export validation rules
export {
  required,
  email,
  url,
  phone,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  matches,
  oneOf,
  creditCard,
  postalCode,
  alpha,
  alphanumeric,
  numeric,
  integer,
  compose,
} from "./rules";

export type {
  ErrorMessageFn,
  ValidationRuleOptions,
} from "./rules";

// Export validation utilities
export {
  debounce,
  asyncValidator,
  crossFieldValidator,
  when,
  withRaceConditionPrevention,
  setErrorMessages,
  getErrorMessage,
  resetErrorMessages,
  defaultMessages,
  messageRegistry,
} from "./utils";

export type {
  DebounceOptions,
  ErrorMessages,
  MessageTemplate,
} from "./utils";
