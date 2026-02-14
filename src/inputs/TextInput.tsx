"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { Input } from "../components/ui/input";
import { cn } from "../lib/utils";

/**
 * TextInput - High-performance text input component (ShadCN-based)
 *
 * Built on ShadCN Input component with form-specific behavior:
 * - Error state handling
 * - Valid value indicator (ring-2)
 * - Form integration (onChange, onBlur)
 * - Full accessibility support
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

  return (
    <Input
      type={type}
      id={id}
      name={name}
      value={value ?? ""}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
      className={cn(
        // Valid value indicator - ring-2 when has value and no error
        !error && hasValue && "ring-2 ring-ring",
        // Error state - handled by Input component via aria-invalid
        className,
      )}
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={required || props["aria-required"]}
      {...props}
    />
  );
}

TextInput.displayName = "TextInput";
