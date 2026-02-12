"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { cn, INPUT_AUTOFILL_RESET_CLASSES } from "../utils";

/**
 * TextInput - High-performance text input component
 *
 * A lightweight, accessible text input with error state support.
 * Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Full accessibility support
 * - Error state styling
 * - Controlled input behavior
 * - All native input attributes supported
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { email: '' } });
 *
 * <TextInput
 *   {...form.getFieldProps('email')}
 *   type="email"
 *   placeholder="Enter your email"
 *   error={!!form.errors.email}
 *   aria-invalid={!!form.errors.email}
 *   aria-describedby={form.errors.email ? 'email-error' : undefined}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/text-input
 */
export function TextInput({
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  error = false,
  className = "",
  type = "text",
  id = "text",
  ...props
}: InputProps<string> & {
  type?: "text" | "email" | "password" | "url" | "tel" | "search";
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const hasValue = String(value ?? "").trim().length > 0;
  const combinedClassName = cn(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",
    "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
    "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
    INPUT_AUTOFILL_RESET_CLASSES,
    !error && hasValue && "ring-2 ring-ring",
    error && "border-destructive ring-1 ring-destructive",
    className,
  );

  return (
    <input
      type={type}
      id={id}
      name={name}
      value={value ?? ""}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={combinedClassName}
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={required || props["aria-required"]}
      {...props}
    />
  );
}

TextInput.displayName = "TextInput";
