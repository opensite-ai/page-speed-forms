/**
 * @page-speed/forms - Validation Rules
 *
 * Common validation rules for form fields.
 * Tree-shakable - import only the rules you need.
 *
 * @example
 * ```tsx
 * import { required, email, minLength } from '@page-speed/forms/validation/rules';
 *
 * const form = useForm({
 *   validationSchema: {
 *     email: [required(), email()],
 *     password: [required(), minLength(8)],
 *   }
 * });
 * ```
 */

import type { FieldValidator } from "../core/types";

/**
 * Error message template function
 * Allows customization of error messages
 */
export type ErrorMessageFn = (params?: Record<string, any>) => string;

/**
 * Validation rule options
 */
export interface ValidationRuleOptions {
  /**
   * Custom error message
   */
  message?: string | ErrorMessageFn;
}

/**
 * Required field validator
 * Ensures field has a truthy value
 */
export function required(
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = "This field is required";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  return (value) => {
    if (value === undefined || value === null || value === "") {
      return message;
    }

    // Check for empty arrays
    if (Array.isArray(value) && value.length === 0) {
      return message;
    }

    // Check for empty objects
    if (
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.keys(value).length === 0
    ) {
      return message;
    }

    return undefined;
  };
}

/**
 * Email validator
 * Validates email format using RFC 5322 compatible regex
 */
export function email(options: ValidationRuleOptions = {}): FieldValidator {
  const defaultMessage = "Please enter a valid email address";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  // RFC 5322 simplified email regex
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  return (value) => {
    if (!value) return undefined; // Use with required() if needed
    if (typeof value !== "string") return message;
    if (!emailRegex.test(value)) return message;
    return undefined;
  };
}

/**
 * URL validator
 * Validates URL format
 */
export function url(options: ValidationRuleOptions = {}): FieldValidator {
  const defaultMessage = "Please enter a valid URL";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  return (value) => {
    if (!value) return undefined; // Use with required() if needed
    if (typeof value !== "string") return message;

    try {
      new URL(value);
      return undefined;
    } catch {
      return message;
    }
  };
}

/**
 * Phone number validator
 * Validates US phone numbers (flexible formats)
 */
export function phone(options: ValidationRuleOptions = {}): FieldValidator {
  const defaultMessage = "Please enter a valid phone number";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  // Matches: (123) 456-7890, 123-456-7890, 1234567890, +1 123 456 7890
  const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;

  return (value) => {
    if (!value) return undefined;
    if (typeof value !== "string") return message;

    // Remove all non-numeric characters except +
    const cleaned = value.replace(/[^\d+]/g, "");

    if (!phoneRegex.test(cleaned)) return message;
    return undefined;
  };
}

/**
 * Minimum length validator
 */
export function minLength(
  min: number,
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = (p: { min: number }) =>
    `Must be at least ${p.min} characters`;
  const message =
    typeof options.message === "function"
      ? options.message({ min })
      : options.message || defaultMessage({ min });

  return (value) => {
    if (!value) return undefined;

    const length = Array.isArray(value)
      ? value.length
      : typeof value === "string"
        ? value.length
        : 0;

    if (length < min) return message;
    return undefined;
  };
}

/**
 * Maximum length validator
 */
export function maxLength(
  max: number,
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = (p: { max: number }) =>
    `Must be no more than ${p.max} characters`;
  const message =
    typeof options.message === "function"
      ? options.message({ max })
      : options.message || defaultMessage({ max });

  return (value) => {
    if (!value) return undefined;

    const length = Array.isArray(value)
      ? value.length
      : typeof value === "string"
        ? value.length
        : 0;

    if (length > max) return message;
    return undefined;
  };
}

/**
 * Minimum value validator (for numbers)
 */
export function min(
  minValue: number,
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = (p: { min: number }) =>
    `Must be at least ${p.min}`;
  const message =
    typeof options.message === "function"
      ? options.message({ min: minValue })
      : options.message || defaultMessage({ min: minValue });

  return (value) => {
    if (value === undefined || value === null) return undefined;

    const numValue = typeof value === "number" ? value : parseFloat(value);

    if (isNaN(numValue) || numValue < minValue) return message;
    return undefined;
  };
}

/**
 * Maximum value validator (for numbers)
 */
export function max(
  maxValue: number,
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = (p: { max: number }) =>
    `Must be no more than ${p.max}`;
  const message =
    typeof options.message === "function"
      ? options.message({ max: maxValue })
      : options.message || defaultMessage({ max: maxValue });

  return (value) => {
    if (value === undefined || value === null) return undefined;

    const numValue = typeof value === "number" ? value : parseFloat(value);

    if (isNaN(numValue) || numValue > maxValue) return message;
    return undefined;
  };
}

/**
 * Pattern validator
 * Validates against a regular expression
 */
export function pattern(
  regex: RegExp,
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = "Invalid format";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  return (value) => {
    if (!value) return undefined;
    if (typeof value !== "string") return message;
    if (!regex.test(value)) return message;
    return undefined;
  };
}

/**
 * Match validator
 * Ensures field matches another field (e.g., password confirmation)
 */
export function matches(
  fieldName: string,
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = (p: { field: string }) =>
    `Must match ${p.field}`;
  const message =
    typeof options.message === "function"
      ? options.message({ field: fieldName })
      : options.message || defaultMessage({ field: fieldName });

  return (value, allValues) => {
    const otherValue = allValues[fieldName];
    if (value !== otherValue) return message;
    return undefined;
  };
}

/**
 * One of validator
 * Ensures value is one of the allowed values
 */
export function oneOf<T = any>(
  allowedValues: T[],
  options: ValidationRuleOptions = {}
): FieldValidator<T> {
  const defaultMessage = "Invalid value";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  return (value) => {
    if (!value) return undefined;
    if (!allowedValues.includes(value)) return message;
    return undefined;
  };
}

/**
 * Credit card validator
 * Validates credit card numbers using Luhn algorithm
 */
export function creditCard(
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = "Please enter a valid credit card number";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  const luhnCheck = (num: string): boolean => {
    let sum = 0;
    let isEven = false;

    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  };

  return (value) => {
    if (!value) return undefined;
    if (typeof value !== "string") return message;

    // Remove spaces and dashes
    const cleaned = value.replace(/[\s-]/g, "");

    // Check if only digits
    if (!/^\d+$/.test(cleaned)) return message;

    // Check length (13-19 digits for most cards)
    if (cleaned.length < 13 || cleaned.length > 19) return message;

    // Luhn algorithm check
    if (!luhnCheck(cleaned)) return message;

    return undefined;
  };
}

/**
 * Postal code validator (US ZIP codes)
 */
export function postalCode(
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = "Please enter a valid ZIP code";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  // Matches: 12345 or 12345-6789
  const zipRegex = /^\d{5}(-\d{4})?$/;

  return (value) => {
    if (!value) return undefined;
    if (typeof value !== "string") return message;
    if (!zipRegex.test(value)) return message;
    return undefined;
  };
}

/**
 * Alpha validator
 * Ensures value contains only alphabetic characters
 */
export function alpha(options: ValidationRuleOptions = {}): FieldValidator {
  const defaultMessage = "Must contain only letters";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  const alphaRegex = /^[a-zA-Z]+$/;

  return (value) => {
    if (!value) return undefined;
    if (typeof value !== "string") return message;
    if (!alphaRegex.test(value)) return message;
    return undefined;
  };
}

/**
 * Alphanumeric validator
 * Ensures value contains only letters and numbers
 */
export function alphanumeric(
  options: ValidationRuleOptions = {}
): FieldValidator {
  const defaultMessage = "Must contain only letters and numbers";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  const alphanumericRegex = /^[a-zA-Z0-9]+$/;

  return (value) => {
    if (!value) return undefined;
    if (typeof value !== "string") return message;
    if (!alphanumericRegex.test(value)) return message;
    return undefined;
  };
}

/**
 * Numeric validator
 * Ensures value is a valid number
 */
export function numeric(options: ValidationRuleOptions = {}): FieldValidator {
  const defaultMessage = "Must be a valid number";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  return (value) => {
    if (value === undefined || value === null || value === "") return undefined;

    const numValue = typeof value === "number" ? value : parseFloat(value);

    if (isNaN(numValue)) return message;
    return undefined;
  };
}

/**
 * Integer validator
 * Ensures value is a valid integer
 */
export function integer(options: ValidationRuleOptions = {}): FieldValidator {
  const defaultMessage = "Must be a whole number";
  const message =
    typeof options.message === "function"
      ? options.message()
      : options.message || defaultMessage;

  return (value) => {
    if (value === undefined || value === null || value === "") return undefined;

    const numValue = typeof value === "number" ? value : parseFloat(value);

    if (isNaN(numValue) || !Number.isInteger(numValue)) return message;
    return undefined;
  };
}

/**
 * Compose multiple validators
 * Runs validators in sequence and returns first error
 */
export function compose(
  ...validators: FieldValidator[]
): FieldValidator {
  return async (value, allValues) => {
    for (const validator of validators) {
      const error = await validator(value, allValues);
      if (error) return error;
    }
    return undefined;
  };
}
