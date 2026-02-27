"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { Textarea } from "../components/ui/textarea";
import { cn } from "../lib/utils";

/**
 * Additional props specific to TextArea
 */
export interface TextAreaProps extends Omit<InputProps<string>, "onChange"> {
  /**
   * Number of visible text rows
   * @default 3
   */
  rows?: number;

  /**
   * Number of visible text columns (characters)
   */
  cols?: number;

  /**
   * Maximum character length
   */
  maxLength?: number;

  /**
   * Minimum character length
   */
  minLength?: number;

  /**
   * Text wrapping behavior
   * - soft: text wraps but newlines not submitted (default)
   * - hard: text wraps and newlines submitted (requires cols)
   * - off: no wrapping
   */
  wrap?: "soft" | "hard" | "off";

  /**
   * Change handler
   */
  onChange: (value: string) => void;

  /**
   * Additional native textarea attributes
   */
  [key: string]: any;
}

/**
 * TextArea - High-performance multi-line text input component (ShadCN-based)
 *
 * Built on ShadCN Textarea component with form-specific behavior:
 * - Error state handling
 * - Valid value indicator (ring-2)
 * - Form integration (onChange, onBlur)
 * - Full accessibility support
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { bio: '' } });
 *
 * <TextArea
 *   {...form.getFieldProps('bio')}
 *   rows={5}
 *   placeholder="Tell us about yourself"
 *   error={!!form.errors.bio}
 *   aria-invalid={!!form.errors.bio}
 *   aria-describedby={form.errors.bio ? 'bio-error' : undefined}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/textarea
 */
export function TextArea({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  className = "",
  rows = 3,
  cols,
  maxLength,
  minLength,
  wrap = "soft",
  ...props
}: TextAreaProps) {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const hasValue = String(value ?? "").trim().length > 0;

  return (
    <Textarea
      name={name}
      value={value ?? ""}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={cn(
        // Valid value indicator - ring-2 when has value and no error
        !error && hasValue && "ring-2 ring-primary",
        // Error state - handled by Textarea component via aria-invalid
        className,
      )}
      rows={rows}
      cols={cols}
      maxLength={maxLength}
      minLength={minLength}
      wrap={wrap}
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={required || props["aria-required"]}
      {...props}
    />
  );
}

TextArea.displayName = "TextArea";
