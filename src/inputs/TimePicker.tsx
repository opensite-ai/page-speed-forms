"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { cn, INPUT_AUTOFILL_RESET_CLASSES } from "../lib/utils";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

/**
 * Legacy time value shape retained for backward-compatible type exports.
 */
export interface TimeValue {
  hour: number;
  minute: number;
  period: "AM" | "PM";
}

/**
 * TimePicker props interface
 */
export interface TimePickerProps extends Omit<InputProps<string>, "onChange"> {
  /**
   * Change handler - receives time string in format "HH:mm" (24-hour)
   * or "h:mm AM/PM" (12-hour)
   */
  onChange: (time: string) => void;

  /**
   * Placeholder text when no time is selected
   * @default "Select time..."
   */
  placeholder?: string;

  /**
   * Use 24-hour format instead of 12-hour with AM/PM
   * @default false
   */
  use24Hour?: boolean;

  /**
   * Minute step interval (e.g., 15 for 15-minute increments)
   * @default 1
   */
  minuteStep?: number;

  /**
   * Show clear button
   * @default true
   */
  clearable?: boolean;

  /**
   * Show clock icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

function normalizeToNativeTime(value: string): string {
  if (!value) return "";

  // 12-hour format: h:mm AM/PM or hh:mm:ss AM/PM
  const twelveHourMatch = value.match(
    /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i,
  );
  if (twelveHourMatch) {
    const rawHour = parseInt(twelveHourMatch[1], 10);
    const minute = parseInt(twelveHourMatch[2], 10);
    const period = twelveHourMatch[4].toUpperCase();

    if (
      Number.isNaN(rawHour) ||
      Number.isNaN(minute) ||
      rawHour < 1 ||
      rawHour > 12 ||
      minute < 0 ||
      minute > 59
    ) {
      return "";
    }

    const normalizedHour =
      period === "PM"
        ? rawHour === 12
          ? 12
          : rawHour + 12
        : rawHour === 12
          ? 0
          : rawHour;

    return `${String(normalizedHour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  // 24-hour format: HH:mm or HH:mm:ss
  const twentyFourHourMatch = value.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (twentyFourHourMatch) {
    const hour = parseInt(twentyFourHourMatch[1], 10);
    const minute = parseInt(twentyFourHourMatch[2], 10);

    if (
      Number.isNaN(hour) ||
      Number.isNaN(minute) ||
      hour < 0 ||
      hour > 23 ||
      minute < 0 ||
      minute > 59
    ) {
      return "";
    }

    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  return "";
}

function formatFromNativeTime(nativeValue: string, use24Hour: boolean): string {
  if (!nativeValue) return "";

  const [hourValue, minuteValue] = nativeValue.split(":");
  const hour = parseInt(hourValue, 10);
  const minute = parseInt(minuteValue, 10);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return "";
  }

  if (use24Hour) {
    return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  }

  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${String(minute).padStart(2, "0")} ${period}`;
}

/**
 * TimePicker - Accessible time input component using native time picker UX.
 *
 * Uses a native `type="time"` input for a streamlined UX while preserving
 * formatting compatibility for 12-hour and 24-hour output formats.
 */
export function TimePicker({
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  className = "",
  placeholder = "Select time...",
  use24Hour = false,
  minuteStep = 1,
  clearable = true,
  showIcon = true,
  ...props
}: TimePickerProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [nativeValue, setNativeValue] = React.useState<string>(
    normalizeToNativeTime(value),
  );

  React.useEffect(() => {
    setNativeValue(normalizeToNativeTime(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextNativeValue = e.target.value;
    setNativeValue(nextNativeValue);
    onChange(formatFromNativeTime(nextNativeValue, use24Hour));
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNativeValue("");
    onChange("");
    inputRef.current?.focus();
  };

  const hasValue = Boolean(value);
  const stepInSeconds = Math.max(1, minuteStep * 60);

  return (
    <div className={cn("relative", className)}>
      {/* Hidden input preserves external value format for form submission */}
      <input type="hidden" name={name} value={value} />

      <div className="relative">
        {showIcon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v6l4 2" />
            </svg>
          </span>
        )}
        <Input
          ref={inputRef}
          type="time"
          className={cn(
            "appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none",
            INPUT_AUTOFILL_RESET_CLASSES,
            showIcon ? "pl-10" : "pl-3",
            clearable && value ? "pr-10" : "pr-3",
            !error && hasValue && "ring-2 ring-primary",
            error && "ring-2 ring-destructive",
          )}
          value={nativeValue}
          onChange={handleChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          step={stepInSeconds}
          placeholder={placeholder}
          aria-invalid={error || props["aria-invalid"] ? "true" : "false"}
          aria-describedby={props["aria-describedby"]}
          aria-required={required || props["aria-required"]}
          {...props}
        />
        {clearable && value && !disabled && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={handleClear}
            aria-label="Clear time"
            tabIndex={-1}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </Button>
        )}
      </div>
    </div>
  );
}

TimePicker.displayName = "TimePicker";
