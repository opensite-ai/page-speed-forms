/**
 * Dynamic form field schema types and helpers.
 *
 * These utilities are intentionally exposed from the integration layer so
 * block/rendering libraries can share one field schema contract.
 */

import { humanizeFieldName } from "../lib/utils";

export type FormFieldType =
  | "text"
  | "email"
  | "search"
  | "password"
  | "tel"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "checkbox-group"
  | "number"
  | "url"
  | "date"
  | "date-picker"
  | "date-range"
  | "time"
  | "file"
  | "multi-select";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface FormFieldConfig {
  /**
   * Optionally displays label for the field
   */
  label?: string;
  /**
   * Unique field name (used as the key in form values)
   */
  name: string;
  /**
   * Field type
   */
  type: FormFieldType;

  /**
   * Placeholder text
   */
  placeholder?: string;
  /**
   * Whether the field is required
   * @default false
   */
  required?: boolean;
  /**
   * Column span in grid layout (1-12)
   * @default 12 (full width)
   */
  columnSpan?: number;
  /**
   * Options for select/radio/checkbox-group fields
   */
  options?: SelectOption[];
  /**
   * Number of rows for textarea
   * @default 4
   */
  rows?: number;
  /**
   * Custom validation function
   * Return undefined for valid, or an error message string for invalid
   */
  validator?: (
    value: any,
    allValues: Record<string, any>,
  ) => string | undefined;
  /**
   * Additional CSS classes for the field wrapper
   */
  className?: string;
  /**
   * Whether the field is disabled
   * @default false
   */
  disabled?: boolean;
  /**
   * Accepted file types for file inputs (MIME types or extensions)
   * @example ".pdf,.doc,.docx"
   * @example "image/*,application/pdf"
   */
  accept?: string;
  /**
   * Maximum file size in bytes for file inputs
   * @default 5MB (5 * 1024 * 1024)
   */
  maxSize?: number;
  /**
   * Maximum number of files for file inputs
   * @default 1
   */
  maxFiles?: number;
  /**
   * Allow multiple file selection
   * @default false
   */
  multiple?: boolean;
  /**
   * Description/help text displayed with the field
   */
  description?: string;
  /**
   * Layout for radio/checkbox groups
   * @default "stacked"
   */
  layout?: "grid" | "stacked";
}

/**
 * Generate initial values object from form field configs.
 */
export function generateInitialValues(
  fields: FormFieldConfig[],
): Record<string, any> {
  return fields.reduce(
    (acc, field) => {
      if (field.type === "checkbox") {
        acc[field.name] = false;
      } else if (
        field.type === "checkbox-group" ||
        field.type === "multi-select"
      ) {
        acc[field.name] = [];
      } else if (field.type === "file") {
        acc[field.name] = [];
      } else if (field.type === "date-range") {
        acc[field.name] = { start: null, end: null };
      } else {
        acc[field.name] = "";
      }
      return acc;
    },
    {} as Record<string, any>,
  );
}

/**
 * Generate validation schema from form field configs.
 */
export function generateValidationSchema(
  fields: FormFieldConfig[],
): Record<
  string,
  (value: any, allValues: Record<string, any>) => string | undefined
> {
  return fields.reduce(
    (acc, field) => {
      acc[field.name] = (value: any, allValues: Record<string, any>) => {
        if (field.required) {
          if (!value || (typeof value === "string" && !value.trim())) {
            const displayName = field.label || humanizeFieldName(field.name);
            return `${displayName} is required`;
          }
        }

        if (field.type === "email" && value) {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            return "Please enter a valid email address";
          }
        }

        if (field.type === "url" && value) {
          try {
            new URL(value);
          } catch {
            return "Please enter a valid URL";
          }
        }

        if (field.validator) {
          return field.validator(value, allValues);
        }

        return undefined;
      };
      return acc;
    },
    {} as Record<
      string,
      (value: any, allValues: Record<string, any>) => string | undefined
    >,
  );
}

/**
 * Static mapping of column span values to Tailwind classes.
 *
 * IMPORTANT: These must remain complete, literal class strings so Tailwind's
 * scanner can detect and generate them.
 */
const columnSpanClasses: Record<number, string> = {
  1: "col-span-12 md:col-span-1",
  2: "col-span-12 md:col-span-2",
  3: "col-span-12 md:col-span-3",
  4: "col-span-12 md:col-span-4",
  5: "col-span-12 md:col-span-5",
  6: "col-span-12 md:col-span-6",
  7: "col-span-12 md:col-span-7",
  8: "col-span-12 md:col-span-8",
  9: "col-span-12 md:col-span-9",
  10: "col-span-12 md:col-span-10",
  11: "col-span-12 md:col-span-11",
  12: "col-span-12",
};

/**
 * Get grid column span class for Tailwind.
 *
 * On small screens the field is always full-width, then from `md` and up the
 * configured span is applied.
 */
export function getColumnSpanClass(span?: number): string {
  if (!span || span === 12) return "col-span-12";
  const clamped = Math.max(1, Math.min(span, 12));
  return columnSpanClasses[clamped] || "col-span-12";
}

/**
 * Self-contained CSS that makes the 12-column form grid work even when
 * the consuming app's Tailwind build does not generate the col-span-*
 * and grid-cols-12 utility classes from this library's dist output.
 *
 * Uses data-attribute selectors so there is no collision with Tailwind.
 * When Tailwind IS present the rules are harmless duplicates.
 */
export const FORM_GRID_FALLBACK_CSS = `[data-psf-grid]{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:1.5rem}@media(min-width:768px){[data-psf-grid]{gap:2.5rem}}[data-psf-col]{grid-column:span 12/span 12;min-width:0}@media(min-width:768px){[data-psf-col="1"]{grid-column:span 1/span 1}[data-psf-col="2"]{grid-column:span 2/span 2}[data-psf-col="3"]{grid-column:span 3/span 3}[data-psf-col="4"]{grid-column:span 4/span 4}[data-psf-col="5"]{grid-column:span 5/span 5}[data-psf-col="6"]{grid-column:span 6/span 6}[data-psf-col="7"]{grid-column:span 7/span 7}[data-psf-col="8"]{grid-column:span 8/span 8}[data-psf-col="9"]{grid-column:span 9/span 9}[data-psf-col="10"]{grid-column:span 10/span 10}[data-psf-col="11"]{grid-column:span 11/span 11}[data-psf-col="12"]{grid-column:span 12/span 12}}`;
