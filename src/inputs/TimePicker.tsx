"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

/**
 * Time value format
 */
export interface TimeValue {
  hour: number; // 1-12
  minute: number; // 0-59
  period: "AM" | "PM";
}

/**
 * TimePicker props interface
 */
export interface TimePickerProps extends Omit<InputProps<string>, "onChange"> {
  /**
   * Change handler - receives time string in format "HH:mm AM/PM"
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

/**
 * Parse time string to TimeValue
 */
function parseTimeString(timeStr: string, use24Hour: boolean): TimeValue | null {
  if (!timeStr) return null;

  try {
    if (use24Hour) {
      // Parse 24-hour format (HH:mm)
      const [hourStr, minuteStr] = timeStr.split(":");
      const hour24 = parseInt(hourStr, 10);
      const minute = parseInt(minuteStr, 10);

      if (isNaN(hour24) || isNaN(minute)) return null;
      if (hour24 < 0 || hour24 > 23) return null;
      if (minute < 0 || minute > 59) return null;

      // Convert to 12-hour format with period
      const period = hour24 >= 12 ? "PM" : "AM";
      const hour = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;

      return { hour, minute, period };
    } else {
      // Parse 12-hour format (HH:mm AM/PM)
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
      if (!match) return null;

      const hour = parseInt(match[1], 10);
      const minute = parseInt(match[2], 10);
      const period = match[3].toUpperCase() as "AM" | "PM";

      if (hour < 1 || hour > 12) return null;
      if (minute < 0 || minute > 59) return null;

      return { hour, minute, period };
    }
  } catch {
    return null;
  }
}

/**
 * Format TimeValue to string
 */
function formatTimeValue(time: TimeValue | null, use24Hour: boolean): string {
  if (!time) return "";

  if (use24Hour) {
    // Convert to 24-hour format
    let hour24 = time.hour;
    if (time.period === "PM" && time.hour !== 12) {
      hour24 = time.hour + 12;
    } else if (time.period === "AM" && time.hour === 12) {
      hour24 = 0;
    }
    return `${String(hour24).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
  } else {
    // 12-hour format with AM/PM
    return `${time.hour}:${String(time.minute).padStart(2, "0")} ${time.period}`;
  }
}

/**
 * TimePicker - Accessible time selection component with AM/PM support
 *
 * A lightweight time picker with dropdown selection for hours, minutes, and AM/PM period.
 * Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Dropdown selection with hour/minute spinners
 * - 12-hour or 24-hour format support
 * - AM/PM period selector
 * - Configurable minute step intervals
 * - Full accessibility support (ARIA attributes, keyboard navigation)
 * - Error state styling
 * - Controlled input behavior
 * - Clearable selection
 * - Icon display toggle
 * - Click outside to close
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { appointment: '' } });
 *
 * <TimePicker
 *   {...form.getFieldProps('appointment')}
 *   placeholder="Select time"
 *   minuteStep={15}
 *   clearable
 *   showIcon
 *   error={!!form.errors.appointment}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With 24-hour format
 * <TimePicker
 *   name="startTime"
 *   value={startTime}
 *   onChange={setStartTime}
 *   use24Hour
 *   minuteStep={30}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/time-picker
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
  const [isOpen, setIsOpen] = React.useState(false);
  const [timeValue, setTimeValue] = React.useState<TimeValue | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync time value with controlled value prop
  React.useEffect(() => {
    const parsed = parseTimeString(value, use24Hour);
    setTimeValue(parsed);
  }, [value, use24Hour]);

  // Handle hour change
  const handleHourChange = (hour: number) => {
    const newTime: TimeValue = {
      hour,
      minute: timeValue?.minute || 0,
      period: timeValue?.period || "AM",
    };
    setTimeValue(newTime);
    onChange(formatTimeValue(newTime, use24Hour));
  };

  // Handle minute change
  const handleMinuteChange = (minute: number) => {
    const newTime: TimeValue = {
      hour: timeValue?.hour || 12,
      minute,
      period: timeValue?.period || "AM",
    };
    setTimeValue(newTime);
    onChange(formatTimeValue(newTime, use24Hour));
  };

  // Handle period change
  const handlePeriodChange = (period: "AM" | "PM") => {
    const newTime: TimeValue = {
      hour: timeValue?.hour || 12,
      minute: timeValue?.minute || 0,
      period,
    };
    setTimeValue(newTime);
    onChange(formatTimeValue(newTime, use24Hour));
  };

  // Handle clear button
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setTimeValue(null);
    inputRef.current?.focus();
  };

  // Toggle time picker popup
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Close picker when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        onBlur?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onBlur]);

  // Generate hour options (1-12 for 12-hour, 0-23 for 24-hour)
  const hours = React.useMemo(() => {
    if (use24Hour) {
      return Array.from({ length: 24 }, (_, i) => i);
    } else {
      return Array.from({ length: 12 }, (_, i) => i + 1);
    }
  }, [use24Hour]);

  // Generate minute options based on step
  const minutes = React.useMemo(() => {
    const mins: number[] = [];
    for (let i = 0; i < 60; i += minuteStep) {
      mins.push(i);
    }
    return mins;
  }, [minuteStep]);

  const baseClassName = "timepicker";
  const errorClassName = error ? "timepicker--error" : "";
  const disabledClassName = disabled ? "timepicker--disabled" : "";
  const openClassName = isOpen ? "timepicker--open" : "";
  const combinedClassName =
    `${baseClassName} ${errorClassName} ${disabledClassName} ${openClassName} ${className}`.trim();

  const displayValue = formatTimeValue(timeValue, use24Hour);

  return (
    <div ref={containerRef} className={combinedClassName}>
      {/* Hidden native input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value}
      />

      {/* Custom time input */}
      <div className="timepicker-input-wrapper">
        {showIcon && (
          <span className="timepicker-icon" aria-hidden="true">
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
        <input
          ref={inputRef}
          type="text"
          className="timepicker-input"
          value={displayValue}
          onClick={handleToggle}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          aria-invalid={error || props["aria-invalid"] ? "true" : "false"}
          aria-describedby={props["aria-describedby"]}
          aria-required={required || props["aria-required"]}
          readOnly
        />
        {clearable && value && !disabled && (
          <button
            type="button"
            className="timepicker-clear"
            onClick={handleClear}
            aria-label="Clear time"
            tabIndex={-1}
          >
            ✕
          </button>
        )}
      </div>

      {/* Time picker popup */}
      {isOpen && !disabled && (
        <div className="timepicker-dropdown">
          <div className="timepicker-selectors">
            {/* Hour selector */}
            <div className="timepicker-column">
              <div className="timepicker-column-label">
                {use24Hour ? "Hour" : "Hour"}
              </div>
              <div className="timepicker-column-options">
                {hours.map((hour) => {
                  const displayHour = use24Hour ? hour : hour;
                  const isSelected = use24Hour
                    ? timeValue?.hour === (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour) &&
                      timeValue?.period === (hour >= 12 ? "PM" : "AM")
                    : timeValue?.hour === hour;

                  return (
                    <button
                      key={hour}
                      type="button"
                      className={`timepicker-option ${isSelected ? "timepicker-option--selected" : ""}`}
                      onClick={() => {
                        if (use24Hour) {
                          const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
                          const period = hour >= 12 ? "PM" : "AM";
                          const newTime: TimeValue = {
                            hour: hour12,
                            minute: timeValue?.minute || 0,
                            period,
                          };
                          setTimeValue(newTime);
                          onChange(formatTimeValue(newTime, use24Hour));
                        } else {
                          handleHourChange(hour);
                        }
                      }}
                      aria-label={`${String(displayHour).padStart(2, "0")} hours`}
                    >
                      {String(displayHour).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Minute selector */}
            <div className="timepicker-column">
              <div className="timepicker-column-label">Minute</div>
              <div className="timepicker-column-options">
                {minutes.map((minute) => {
                  const isSelected = timeValue?.minute === minute;

                  return (
                    <button
                      key={minute}
                      type="button"
                      className={`timepicker-option ${isSelected ? "timepicker-option--selected" : ""}`}
                      onClick={() => handleMinuteChange(minute)}
                      aria-label={`${String(minute).padStart(2, "0")} minutes`}
                    >
                      {String(minute).padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Period selector (AM/PM) - only for 12-hour format */}
            {!use24Hour && (
              <div className="timepicker-column timepicker-column--period">
                <div className="timepicker-column-label">Period</div>
                <div className="timepicker-column-options">
                  <button
                    type="button"
                    className={`timepicker-option ${timeValue?.period === "AM" ? "timepicker-option--selected" : ""}`}
                    onClick={() => handlePeriodChange("AM")}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    className={`timepicker-option ${timeValue?.period === "PM" ? "timepicker-option--selected" : ""}`}
                    onClick={() => handlePeriodChange("PM")}
                  >
                    PM
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

TimePicker.displayName = "TimePicker";
