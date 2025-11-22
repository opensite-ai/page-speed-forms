/**
 * @page-speed/forms - Valibot Validation Adapter
 *
 * Integrates Valibot schema validation with @page-speed/forms.
 * Provides tree-shakable validation with excellent performance.
 *
 * Valibot Benefits:
 * - 95% smaller than Zod (0.6KB vs 13.4KB base)
 * - 2-3x faster validation performance
 * - Modular, tree-shakable API
 * - Full TypeScript inference
 *
 * @see https://opensite.ai/developers/page-speed/forms/validation
 * @see https://valibot.dev
 */

import type { FormValues, ValidationSchema, FieldValidator } from "../core/types";

/**
 * Valibot schema type (generic to avoid direct import)
 * Users will pass their own Valibot schemas
 */
export type ValibotSchema<T = any> = {
  _types?: {
    input: T;
    output: T;
  };
  _parse(input: unknown): { output: T; issues?: any[] };
};

/**
 * Create a validation schema from a Valibot schema
 *
 * Converts a Valibot object schema into @page-speed/forms ValidationSchema format.
 * Supports both synchronous and asynchronous validation.
 *
 * @example
 * ```tsx
 * import * as v from 'valibot';
 * import { useForm } from '@page-speed/forms/core';
 * import { createValibotSchema } from '@page-speed/forms/validation/valibot';
 *
 * const LoginSchema = v.object({
 *   email: v.pipe(v.string(), v.email('Invalid email')),
 *   password: v.pipe(v.string(), v.minLength(8, 'Too short')),
 * });
 *
 * const form = useForm({
 *   initialValues: { email: '', password: '' },
 *   validationSchema: createValibotSchema(LoginSchema),
 *   onSubmit: async (values) => {
 *     await login(values);
 *   },
 * });
 * ```
 */
export function createValibotSchema<T extends FormValues>(
  schema: ValibotSchema<T>
): ValidationSchema<T> {
  // Check if safeParse exists (Valibot v0.31+)
  const hasSafeParse = "safeParse" in schema && typeof schema.safeParse === "function";

  const validationSchema: ValidationSchema<T> = {} as ValidationSchema<T>;

  // Create a validator function that will be called per-field
  const createFieldValidator = <K extends keyof T>(
    fieldName: K
  ): FieldValidator<T[K]> => {
    return async (_value: T[K], allValues: FormValues): Promise<string | undefined> => {
      try {
        // Validate the entire object to get field-specific errors
        const result = hasSafeParse
          ? (schema as any).safeParse(allValues)
          : (() => {
              try {
                const parsed = schema._parse(allValues);
                return { success: !parsed.issues || parsed.issues.length === 0, output: parsed.output, issues: parsed.issues };
              } catch (error: any) {
                return { success: false, issues: error.issues || [{ path: [], message: error.message }] };
              }
            })();

        if (!result.success && result.issues) {
          // Find error for this specific field
          for (const issue of result.issues) {
            const path = issue.path || [];

            // Check if this issue is for the current field
            if (path.length > 0) {
              const key = path[0].key || path[0];
              if (key === fieldName) {
                return issue.message || "Validation error";
              }
            } else if (path.length === 0 && Object.keys(allValues).length === 1) {
              // Single field validation
              return issue.message || "Validation error";
            }
          }
        }

        return undefined;
      } catch (error: any) {
        // Handle parsing errors
        if (error.issues && Array.isArray(error.issues)) {
          for (const issue of error.issues) {
            const path = issue.path || [];
            if (path.length > 0) {
              const key = path[0].key || path[0];
              if (key === fieldName) {
                return issue.message || "Validation error";
              }
            }
          }
        }

        return error.message || "Validation error";
      }
    };
  };

  // We can't introspect Valibot schema keys directly in a type-safe way,
  // so we'll return a proxy that creates validators on-demand
  return new Proxy(validationSchema, {
    get(_target, prop: string | symbol) {
      if (typeof prop === "string") {
        return createFieldValidator(prop as keyof T);
      }
      return undefined;
    },
    ownKeys() {
      // Return empty array - validators are created on-demand
      return [];
    },
    getOwnPropertyDescriptor() {
      return {
        enumerable: true,
        configurable: true,
      };
    },
  }) as ValidationSchema<T>;
}

/**
 * Create a field validator from a Valibot schema
 *
 * For single-field validation without a full form schema.
 *
 * @example
 * ```tsx
 * import * as v from 'valibot';
 * import { Field } from '@page-speed/forms/core';
 * import { createFieldValidator } from '@page-speed/forms/validation/valibot';
 *
 * const emailSchema = v.pipe(v.string(), v.email('Invalid email'));
 *
 * <Field
 *   name="email"
 *   validate={createFieldValidator(emailSchema)}
 * >
 *   {({ field, meta }) => <input {...field} />}
 * </Field>
 * ```
 */
export function createFieldValidator<T = any>(
  schema: ValibotSchema<T>
): FieldValidator<T> {
  const hasSafeParse = "safeParse" in schema && typeof schema.safeParse === "function";

  return async (value: T): Promise<string | undefined> => {
    try {
      const result = hasSafeParse
        ? (schema as any).safeParse(value)
        : (() => {
            try {
              const parsed = schema._parse(value);
              return { success: !parsed.issues || parsed.issues.length === 0, output: parsed.output, issues: parsed.issues };
            } catch (error: any) {
              return { success: false, issues: error.issues || [{ message: error.message }] };
            }
          })();

      if (!result.success && result.issues && result.issues.length > 0) {
        return result.issues[0].message || "Validation error";
      }

      return undefined;
    } catch (error: any) {
      if (error.issues && error.issues.length > 0) {
        return error.issues[0].message || "Validation error";
      }
      return error.message || "Validation error";
    }
  };
}

/**
 * Helper to infer form values type from Valibot schema
 */
export type InferValibotInput<T extends ValibotSchema> = T extends ValibotSchema<
  infer U
>
  ? U
  : never;

/**
 * Helper to infer form values type from Valibot schema output
 */
export type InferValibotOutput<T extends ValibotSchema> = T extends ValibotSchema<
  infer U
>
  ? U
  : never;
