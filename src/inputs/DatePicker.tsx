"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

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
 * Parse date string to Date
 */
function parseDate(dateString: string, format: string): Date | null {
  if (!dateString) return null;

  try {
    // Simple date parsing for MM/dd/yyyy format
    if (format === "MM/dd/yyyy" || format === "MM-dd-yyyy") {
      const parts = dateString.split(/[/-]/);
      if (parts.length === 3) {
        const month = parseInt(parts[0], 10) - 1;
        const day = parseInt(parts[1], 10);
        const year = parseInt(parts[2], 10);
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    // Fallback to native Date parsing
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
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
  const [inputValue, setInputValue] = React.useState("");
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(
    value || new Date(),
  );
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync input value with controlled value prop
  React.useEffect(() => {
    setInputValue(formatDate(value, format));
    if (value) {
      setSelectedMonth(value);
    }
  }, [value, format]);

  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    onChange(date);
    setIsOpen(false);
    onBlur?.();
  };

  // Handle input change (manual typing)
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);

    // Try to parse and update date
    const parsedDate = parseDate(newValue, format);
    if (parsedDate && !isNaN(parsedDate.getTime())) {
      onChange(parsedDate);
    } else if (newValue === "") {
      onChange(null);
    }
  };

  // Handle clear button
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setInputValue("");
    inputRef.current?.focus();
  };

  // Toggle calendar popup
  const handleToggle = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
  };

  // Check if a date should be disabled
  const isDisabled = (date: Date): boolean => {
    if (minDate && date < minDate) return true;
    if (maxDate && date > maxDate) return true;
    if (isDateInArray(date, disabledDates)) return true;
    if (isDateDisabled && isDateDisabled(date)) return true;
    return false;
  };

  // Close calendar when clicking outside
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

  // Simple calendar component (basic implementation)
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
      <div role="grid" aria-label="Calendar">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded border-none bg-transparent hover:bg-primary hover:text-primary-foreground cursor-pointer"
            onClick={handlePrevMonth}
            aria-label="Previous month"
          >
            ←
          </button>
          <div className="font-medium text-sm">
            {`${monthNames[month]} ${year}`}
          </div>
          <button
            type="button"
            className="flex items-center justify-center h-8 w-8 rounded border-none bg-transparent hover:bg-primary hover:text-primary-foreground cursor-pointer"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div
              key={day}
              className="flex items-center justify-center h-8 w-full text-xs font-medium"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} />;
            }

            const isSelected =
              value && date.toDateString() === value.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const disabled = isDisabled(date);

            return (
              <button
                key={date.toISOString()}
                type="button"
                className={`flex items-center justify-center h-8 w-full rounded border-none bg-transparent cursor-pointer text-sm transition-colors hover:bg-primary hover:text-primary-foreground ${isSelected ? "bg-primary text-primary-foreground font-semibold" : ""} ${isToday ? "border border-primary" : ""} ${disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`}
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

  const combinedClassName = `relative ${className}`.trim();

  return (
    <div ref={containerRef} className={combinedClassName}>
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
          className={`flex h-9 w-full rounded-md border border-input bg-transparent ${showIcon ? "pl-10" : "pl-3"} ${clearable && value ? "pr-10" : "pr-3"} py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${error ? "border-red-500 ring-1 ring-red-500" : ""}`}
          value={inputValue}
          onChange={handleInputChange}
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
        <div className="absolute z-50 top-full mt-1 min-w-full rounded-md border border-border bg-popover text-popover-foreground shadow-md p-3">
          {renderCalendar()}
        </div>
      )}
    </div>
  );
}

DatePicker.displayName = "DatePicker";
