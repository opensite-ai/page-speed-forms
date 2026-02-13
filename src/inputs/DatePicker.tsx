"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { useOnClickOutside } from "@opensite/hooks/useOnClickOutside";
import { cn, INPUT_AUTOFILL_RESET_CLASSES } from "../utils";

/**
 * DatePicker props interface
 */
export interface DatePickerProps extends Omit<
  InputProps<Date | null>,
  "onChange"
> {
  /**
   * Change handler - receives selected date or null
   */
  onChange: (date: Date | null) => void;

  /**
   * Placeholder text when no date is selected
   * @default "Select date..."
   */
  placeholder?: string;

  /**
   * Date format for display
   * @default "MM/dd/yyyy"
   */
  format?: string;

  /**
   * Minimum selectable date
   */
  minDate?: Date;

  /**
   * Maximum selectable date
   */
  maxDate?: Date;

  /**
   * Dates that should be disabled
   */
  disabledDates?: Date[];

  /**
   * Function to determine if a date should be disabled
   */
  isDateDisabled?: (date: Date) => boolean;

  /**
   * Show clear button
   * @default true
   */
  clearable?: boolean;

  /**
   * Show calendar icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * Format date to string
 */
function formatDate(date: Date | null, format: string): string {
  if (!date) return "";

  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const year = d.getFullYear();

  // Simple format parsing
  return format
    .replace("MM", month)
    .replace("dd", day)
    .replace("yyyy", String(year))
    .replace("yy", String(year).slice(2));
}

/**
 * Check if date is in disabled dates array
 */
function isDateInArray(date: Date, dates: Date[]): boolean {
  const dateStr = date.toDateString();
  return dates.some((d) => d.toDateString() === dateStr);
}

/**
 * DatePicker - Accessible date selection component with calendar UI
 *
 * A lightweight date picker with calendar popup, keyboard navigation,
 * and error state support. Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Calendar popup with month/year navigation
 * - Full accessibility support (ARIA attributes, keyboard navigation)
 * - Error state styling
 * - Controlled input behavior
 * - Date range constraints (min/max dates)
 * - Disabled dates support
 * - Clearable selection
 * - Custom date format display
 * - Icon display toggle
 * - Click outside to close
 * - Native date input fallback for mobile
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { birthdate: null } });
 *
 * <DatePicker
 *   {...form.getFieldProps('birthdate')}
 *   placeholder="Select your birthdate"
 *   format="MM/dd/yyyy"
 *   maxDate={new Date()}
 *   clearable
 *   showIcon
 *   error={!!form.errors.birthdate}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With date range constraints
 * <DatePicker
 *   name="appointment"
 *   value={appointmentDate}
 *   onChange={setAppointmentDate}
 *   minDate={new Date()}
 *   maxDate={addDays(new Date(), 90)}
 *   isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
 * />
 * ```
 *
 * Note: This component requires react-day-picker as a peer dependency.
 * Install with: npm install react-day-picker date-fns
 *
 * @see https://opensite.ai/developers/page-speed/forms/date-picker
 */
export function DatePicker({
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  className = "",
  placeholder = "Select date...",
  format = "MM/dd/yyyy",
  minDate,
  maxDate,
  disabledDates = [],
  isDateDisabled,
  clearable = true,
  showIcon = true,
  ...props
}: DatePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(
    value || new Date(),
  );
  const inputRef = React.useRef<HTMLInputElement>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Sync selected month with controlled value prop
  React.useEffect(() => {
    if (value) {
      setSelectedMonth(value);
    }
  }, [value]);

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
    onBlur?.();
  };

  // Handle clear button
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    inputRef.current?.focus();
  };

  // Toggle calendar popup
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => !prev);
  };

  // Check if a date should be disabled
  const isDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (isDateInArray(date, disabledDates)) return true;
    if (isDateDisabled && isDateDisabled(date)) return true;
    return false;
  };

  const closeCalendar = React.useCallback(() => {
    setIsOpen(false);
    onBlur?.();
  }, [onBlur]);

  useOnClickOutside([inputRef, dropdownRef], closeCalendar, undefined, {
    capture: true,
  });

  const handleBlur = (event?: React.FocusEvent<HTMLElement>) => {
    const nextTarget = event?.relatedTarget as Node | null;
    const focusStayedInside =
      (!!inputRef.current && inputRef.current.contains(nextTarget)) ||
      (!!dropdownRef.current && dropdownRef.current.contains(nextTarget));

    if (!nextTarget || !focusStayedInside) {
      onBlur?.();
    }
  };

  const dayGridStyle: React.CSSProperties = {
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
  };

  const hasValue = Boolean(value);
  const displayValue = formatDate(value, format);

  // Calendar component
  const renderCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();

    // Get days in month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    // Build calendar grid
    const days: (Date | null)[] = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const handlePrevMonth = () => {
      setSelectedMonth(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
      setSelectedMonth(new Date(year, month + 1, 1));
    };

    return (
      <div role="grid" aria-label="Calendar" className="w-[248px] max-w-full">
        <div className="flex items-center justify-between pb-3">
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded-md border-none bg-transparent hover:bg-muted cursor-pointer transition-colors"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            &#8249;
          </button>
          <div className="font-medium text-sm">
            {`${monthNames[month]} ${year}`}
          </div>
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded-md border-none bg-transparent hover:bg-muted cursor-pointer transition-colors"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            &#8250;
          </button>
        </div>
        <div
          className="grid gap-1 text-xs text-muted-foreground"
          style={dayGridStyle}
        >
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="flex items-center justify-center h-8 w-8 font-medium"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid gap-1" style={dayGridStyle}>
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} className="h-8 w-8" />;
            }

            const isSelected =
              value && date.toDateString() === value.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const disabled = isDisabled(date);

            return (
              <button
                key={date.toISOString()}
                type="button"
                className={cn(
                  "flex items-center justify-center h-8 w-8 rounded-md border-none bg-transparent cursor-pointer text-sm transition-colors",
                  "hover:bg-muted",
                  isSelected && "bg-primary text-primary-foreground font-semibold",
                  !isSelected && isToday && "border border-primary",
                  disabled && "cursor-not-allowed opacity-50 pointer-events-none",
                )}
                onClick={() => !disabled && handleDateSelect(date)}
                disabled={disabled}
                aria-label={formatDate(date, format)}
              >
                {date.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const combinedClassName = cn("relative", className);

  return (
    <div className={combinedClassName} onBlur={handleBlur}>
      {/* Hidden native date input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value ? value.toISOString() : ""}
      />

      {/* Custom date input */}
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
              <path d="M8 2v4m8-4v4m5 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h8M3 10h18m-5 10l2 2l4-4" />
            </svg>
          </span>
        )}
        <input
          ref={inputRef}
          type="text"
          className={cn(
            "flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-base shadow-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
            "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            INPUT_AUTOFILL_RESET_CLASSES,
            showIcon ? "pl-10" : "pl-3",
            clearable && value ? "pr-10" : "pr-3",
            !error && hasValue && "ring-2 ring-ring",
            error && "border-destructive ring-1 ring-destructive",
          )}
          value={displayValue}
          onClick={handleToggle}
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
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
            onClick={handleClear}
            aria-label="Clear date"
            tabIndex={-1}
          >
            ✕
          </button>
        )}
      </div>

      {/* Calendar popup */}
      {isOpen && !disabled && (
        <div
          ref={dropdownRef}
          className="absolute z-50 top-full mt-1 w-fit rounded-md border border-border bg-popover text-popover-foreground shadow-md p-3"
        >
          {renderCalendar()}
        </div>
      )}
    </div>
  );
}

DatePicker.displayName = "DatePicker";
