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
 * - Optional start/end icon support with automatic padding
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
  suppressValueRing = false,
  iconStart,
  iconEnd,
  ...props
}: InputProps<string> & {
  type?: "text" | "email" | "password" | "url" | "tel" | "search";
  /**
   * When true, suppresses the `ring-2 ring-primary` applied when a value is
   * present. Use this when the component is embedded inside a wrapper (e.g.
   * ButtonGroupForm) that renders its own unified ring.
   */
  suppressValueRing?: boolean;
  /**
   * Optional icon rendered at the start (left) of the input.
   * Automatically adjusts input padding when provided.
   */
  iconStart?: React.ReactNode;
  /**
   * Optional icon rendered at the end (right) of the input.
   * Automatically adjusts input padding when provided.
   */
  iconEnd?: React.ReactNode;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const hasValue = String(value ?? "").trim().length > 0;
  const hasIconStart = Boolean(iconStart);
  const hasIconEnd = Boolean(iconEnd);

  if (hasIconStart || hasIconEnd) {
    return (
      <div className="relative">
        {hasIconStart && (
          <span
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2",
              "pointer-events-none flex items-center justify-center",
              "pointer-events-none",
            )}
            aria-hidden="true"
          >
            {iconStart}
          </span>
        )}
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
            !suppressValueRing && !error && hasValue && "ring-2 ring-primary",
            hasIconStart && "pl-10",
            hasIconEnd && "pr-10",
            className,
          )}
          aria-invalid={error || props["aria-invalid"]}
          aria-describedby={props["aria-describedby"]}
          aria-required={required || props["aria-required"]}
          {...props}
        />
        {hasIconEnd && (
          <span
            className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            {iconEnd}
          </span>
        )}
      </div>
    );
  }

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
        // Valid value indicator - ring-2 when has value, no error, and not suppressed
        !suppressValueRing && !error && hasValue && "ring-2 ring-primary",
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
