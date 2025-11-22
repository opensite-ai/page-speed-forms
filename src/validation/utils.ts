/**
 * @page-speed/forms - Validation Utilities
 *
 * Utilities for advanced validation scenarios
 */

import type { FieldValidator, FormValues } from "../core/types";

/**
 * Debounce options for async validators
 */
export interface DebounceOptions {
  /**
   * Debounce delay in milliseconds
   * @default 300
   */
  delay?: number;

  /**
   * Leading edge - call immediately on first invocation
   * @default false
   */
  leading?: boolean;

  /**
   * Trailing edge - call after delay
   * @default true
   */
  trailing?: boolean;
}

/**
 * Debounce an async validator
 * Prevents rapid validation calls (e.g., for username availability checks)
 *
 * @example
 * ```tsx
 * const checkUsername = debounce(
 *   async (value) => {
 *     const available = await api.checkUsername(value);
 *     return available ? undefined : 'Username is taken';
 *   },
 *   { delay: 500 }
 * );
 * ```
 */
export function debounce<T = any>(
  validator: FieldValidator<T>,
  options: DebounceOptions = {}
): FieldValidator<T> {
  const { delay = 300, leading = false, trailing = true } = options;

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastCallTime = 0;
  let lastResult: string | undefined;

  return async (value: T, allValues: FormValues) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCallTime;

    // Clear existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    // Leading edge call
    if (leading && timeSinceLastCall >= delay) {
      lastCallTime = now;
      lastResult = await validator(value, allValues);
      return lastResult;
    }

    // Trailing edge call
    if (trailing) {
      return new Promise((resolve) => {
        timeoutId = setTimeout(async () => {
          lastCallTime = Date.now();
          lastResult = await validator(value, allValues);
          resolve(lastResult);
        }, delay);
      });
    }

    return lastResult;
  };
}

/**
 * Error message template function
 */
export type MessageTemplate = (params?: any) => string;

/**
 * Error message templates for internationalization
 */
export interface ErrorMessages {
  [key: string]: string | MessageTemplate;
}

/**
 * Default error messages (English)
 */
export const defaultMessages: ErrorMessages = {
  required: "This field is required",
  email: "Please enter a valid email address",
  url: "Please enter a valid URL",
  phone: "Please enter a valid phone number",
  minLength: ({ min }: { min: number }) =>
    `Must be at least ${min} characters`,
  maxLength: ({ max }: { max: number }) =>
    `Must be no more than ${max} characters`,
  min: ({ min }: { min: number }) => `Must be at least ${min}`,
  max: ({ max }: { max: number }) => `Must be no more than ${max}`,
  pattern: "Invalid format",
  matches: ({ field }: { field: string }) => `Must match ${field}`,
  oneOf: "Invalid value",
  creditCard: "Please enter a valid credit card number",
  postalCode: "Please enter a valid ZIP code",
  alpha: "Must contain only letters",
  alphanumeric: "Must contain only letters and numbers",
  numeric: "Must be a valid number",
  integer: "Must be a whole number",
};

/**
 * Error message registry for i18n support
 */
class MessageRegistry {
  private messages: ErrorMessages = { ...defaultMessages };

  /**
   * Set custom messages (for i18n or customization)
   */
  setMessages(messages: ErrorMessages): void {
    this.messages = { ...this.messages, ...messages };
  }

  /**
   * Get message by key
   */
  getMessage(key: string, params?: Record<string, any>): string {
    const message = this.messages[key];

    if (!message) {
      return `Validation error: ${key}`;
    }

    if (typeof message === "function") {
      return message(params || {});
    }

    return message;
  }

  /**
   * Reset to default messages
   */
  reset(): void {
    this.messages = { ...defaultMessages };
  }
}

/**
 * Global message registry instance
 */
export const messageRegistry = new MessageRegistry();

/**
 * Set custom error messages globally
 * Useful for internationalization
 *
 * @example
 * ```tsx
 * setErrorMessages({
 *   required: 'Este campo es obligatorio',
 *   email: 'Por favor ingrese un email válido',
 * });
 * ```
 */
export function setErrorMessages(messages: ErrorMessages): void {
  messageRegistry.setMessages(messages);
}

/**
 * Get error message by key
 */
export function getErrorMessage(
  key: string,
  params?: Record<string, any>
): string {
  return messageRegistry.getMessage(key, params);
}

/**
 * Reset error messages to defaults
 */
export function resetErrorMessages(): void {
  messageRegistry.reset();
}

/**
 * Cross-field validator helper
 * Creates a validator that depends on multiple fields
 *
 * @example
 * ```tsx
 * const passwordMatch = crossFieldValidator(
 *   ['password', 'confirmPassword'],
 *   (values) => {
 *     if (values.password !== values.confirmPassword) {
 *       return 'Passwords must match';
 *     }
 *     return undefined;
 *   }
 * );
 * ```
 */
export function crossFieldValidator<T extends FormValues = FormValues>(
  fields: (keyof T)[],
  validate: (values: Pick<T, keyof T>) => string | undefined | Promise<string | undefined>
): FieldValidator {
  return (_value, allValues) => {
    const fieldValues = fields.reduce(
      (acc, field) => {
        acc[field] = allValues[field as string];
        return acc;
      },
      {} as Record<keyof T, any>
    );

    return validate(fieldValues as Pick<T, keyof T>);
  };
}

/**
 * Conditional validator
 * Only validates when condition is met
 *
 * @example
 * ```tsx
 * const conditionalRequired = when(
 *   (values) => values.country === 'US',
 *   required()
 * );
 * ```
 */
export function when<T = any>(
  condition: (allValues: FormValues) => boolean,
  validator: FieldValidator<T>
): FieldValidator<T> {
  return (value, allValues) => {
    if (condition(allValues)) {
      return validator(value, allValues);
    }
    return undefined;
  };
}

/**
 * Async validator with race condition prevention
 * Ensures only the latest validation call resolves
 *
 * @example
 * ```tsx
 * const checkUsername = withRaceConditionPrevention(
 *   async (value) => {
 *     const available = await api.checkUsername(value);
 *     return available ? undefined : 'Username is taken';
 *   }
 * );
 * ```
 */
export function withRaceConditionPrevention<T = any>(
  validator: FieldValidator<T>
): FieldValidator<T> {
  let latestCallId = 0;

  return async (value: T, allValues: FormValues) => {
    const callId = ++latestCallId;

    const result = await validator(value, allValues);

    // Only return result if this is still the latest call
    if (callId === latestCallId) {
      return result;
    }

    // Ignore stale results
    return undefined;
  };
}

/**
 * Combine debounce with race condition prevention
 * Best practice for async validators
 *
 * @example
 * ```tsx
 * const checkUsername = asyncValidator(
 *   async (value) => {
 *     const available = await api.checkUsername(value);
 *     return available ? undefined : 'Username is taken';
 *   },
 *   { delay: 500 }
 * );
 * ```
 */
export function asyncValidator<T = any>(
  validator: FieldValidator<T>,
  options: DebounceOptions = {}
): FieldValidator<T> {
  return debounce(withRaceConditionPrevention(validator), options);
}
