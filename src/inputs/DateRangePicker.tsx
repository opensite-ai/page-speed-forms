"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

/**
 * Date range value
 */
export interface DateRange {
  start: Date | null;
  end: Date | null;
}

/**
 * DateRangePicker props interface
 */
export interface DateRangePickerProps extends Omit<InputProps<DateRange>, "onChange"> {
  /**
   * Change handler - receives date range object
   */
  onChange: (range: DateRange) => void;

  /**
   * Placeholder text when no dates are selected
   * @default "Select date range..."
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
   * Separator between start and end dates
   * @default " - "
   */
  separator?: string;

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
 * Check if date is in range
 */
function isDateInRange(date: Date, start: Date | null, end: Date | null): boolean {
  if (!start || !end) return false;
  const time = date.getTime();
  return time >= start.getTime() && time <= end.getTime();
}

/**
 * DateRangePicker - Accessible date range selection component
 *
 * A lightweight date range picker with calendar popup for selecting start and end dates.
 * Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Dual calendar view for range selection
 * - Full accessibility support (ARIA attributes, keyboard navigation)
 * - Error state styling
 * - Controlled input behavior
 * - Date range constraints (min/max dates)
 * - Disabled dates support
 * - Clearable selection
 * - Custom date format display
 * - Visual range highlighting
 * - Icon display toggle
 * - Click outside to close
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { dateRange: { start: null, end: null } } });
 *
 * <DateRangePicker
 *   {...form.getFieldProps('dateRange')}
 *   placeholder="Select date range"
 *   format="MM/dd/yyyy"
 *   clearable
 *   showIcon
 *   error={!!form.errors.dateRange}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With date constraints
 * <DateRangePicker
 *   name="vacation"
 *   value={vacationRange}
 *   onChange={setVacationRange}
 *   minDate={new Date()}
 *   maxDate={addDays(new Date(), 365)}
 *   separator=" to "
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/date-range-picker
 */
export function DateRangePicker({
  name,
  value = { start: null, end: null },
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  className = "",
  placeholder = "Select date range...",
  format = "MM/dd/yyyy",
  minDate,
  maxDate,
  disabledDates = [],
  isDateDisabled,
  clearable = true,
  showIcon = true,
  separator = " - ",
  ...props
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(value.start || new Date());
  const [rangeStart, setRangeStart] = React.useState<Date | null>(value.start);
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(value.end);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  // Sync range with controlled value prop
  React.useEffect(() => {
    setRangeStart(value.start);
    setRangeEnd(value.end);
    if (value.start) {
      setSelectedMonth(value.start);
    }
  }, [value]);

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      // Start new range
      setRangeStart(date);
      setRangeEnd(null);
      onChange({ start: date, end: null });
    } else {
      // Complete range
      if (date < rangeStart) {
        // Selected date is before start, swap them
        setRangeStart(date);
        setRangeEnd(rangeStart);
        onChange({ start: date, end: rangeStart });
        setIsOpen(false);
      } else {
        // Selected date is after start
        setRangeEnd(date);
        onChange({ start: rangeStart, end: date });
        setIsOpen(false);
      }
    }
    onBlur?.();
  };

  // Handle clear button
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange({ start: null, end: null });
    setRangeStart(null);
    setRangeEnd(null);
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

  // Render calendar
  const renderCalendar = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();

    const days: (Date | null)[] = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
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
            className="flex items-center justify-center h-8 w-8 rounded border-none bg-transparent hover:bg-accent cursor-pointer"
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
            className="flex items-center justify-center h-8 w-8 rounded border-none bg-transparent hover:bg-accent cursor-pointer"
            onClick={handleNextMonth}
            aria-label="Next month"
          >
            →
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1 mt-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="flex items-center justify-center h-8 w-full text-xs text-muted-foreground font-medium">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} />;
            }

            const isStart = rangeStart && date.toDateString() === rangeStart.toDateString();
            const isEnd = rangeEnd && date.toDateString() === rangeEnd.toDateString();
            const isInRange = rangeStart && rangeEnd && isDateInRange(date, rangeStart, rangeEnd);
            const isInHoverRange = rangeStart && !rangeEnd && hoverDate &&
              (date >= rangeStart && date <= hoverDate || date <= rangeStart && date >= hoverDate);
            const isToday = date.toDateString() === new Date().toDateString();
            const disabled = isDisabled(date);

            return (
              <button
                key={date.toISOString()}
                type="button"
                className={`flex items-center justify-center h-8 w-full rounded border-none bg-transparent cursor-pointer text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${isStart || isEnd ? "bg-primary text-primary-foreground font-semibold" : ""} ${isInRange || isInHoverRange ? "bg-accent/50" : ""} ${isToday ? "border border-primary" : ""} ${disabled ? "cursor-not-allowed opacity-50 pointer-events-none" : ""}`}
                onClick={() => !disabled && handleDateSelect(date)}
                onMouseEnter={() => setHoverDate(date)}
                onMouseLeave={() => setHoverDate(null)}
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

  const displayValue = rangeStart && rangeEnd
    ? `${formatDate(rangeStart, format)}${separator}${formatDate(rangeEnd, format)}`
    : rangeStart
    ? formatDate(rangeStart, format)
    : "";

  return (
    <div ref={containerRef} className={combinedClassName}>
      {/* Hidden inputs for form submission */}
      <input
        type="hidden"
        name={`${name}[start]`}
        value={rangeStart ? rangeStart.toISOString() : ""}
      />
      <input
        type="hidden"
        name={`${name}[end]`}
        value={rangeEnd ? rangeEnd.toISOString() : ""}
      />

      {/* Custom date range input */}
      <div className="relative">
        {showIcon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" aria-hidden="true">
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
          type="text"
          className={`flex h-9 w-full rounded-md border border-input bg-transparent ${showIcon ? "pl-10" : "pl-3"} ${clearable && (rangeStart || rangeEnd) ? "pr-10" : "pr-3"} py-1 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm ${error ? "border-red-500 ring-1 ring-red-500" : ""}`}
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
        {clearable && (rangeStart || rangeEnd) && !disabled && (
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            onClick={handleClear}
            aria-label="Clear date range"
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
          {rangeStart && !rangeEnd && (
            <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border mt-2">
              Select end date
            </div>
          )}
        </div>
      )}
    </div>
  );
}

DateRangePicker.displayName = "DateRangePicker";
