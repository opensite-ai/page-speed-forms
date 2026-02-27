"use client";

import * as React from "react";
import type { DayButtonProps, Matcher } from "react-day-picker";
import type { InputProps } from "../core/types";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn, INPUT_AUTOFILL_RESET_CLASSES } from "../lib/utils";

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
export interface DateRangePickerProps extends Omit<
  InputProps<DateRange>,
  "onChange"
> {
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

function toDayTimestamp(date: Date): number {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  ).getTime();
}

function isSameDay(date: Date, target: Date | null): boolean {
  if (!target) return false;
  return toDayTimestamp(date) === toDayTimestamp(target);
}

function isDateInRange(
  date: Date,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start || !end) return false;

  const value = toDayTimestamp(date);
  const startTs = toDayTimestamp(start);
  const endTs = toDayTimestamp(end);

  return value >= Math.min(startTs, endTs) && value <= Math.max(startTs, endTs);
}

/**
 * DateRangePicker - Accessible date range selection component
 *
 * Uses ShadCN Calendar + Popover primitives while preserving the existing
 * public API and interaction semantics.
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
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(
    value.start || new Date(),
  );
  const [rangeStart, setRangeStart] = React.useState<Date | null>(value.start);
  const [rangeEnd, setRangeEnd] = React.useState<Date | null>(value.end);
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync range with controlled value prop
  React.useEffect(() => {
    setRangeStart(value.start);
    setRangeEnd(value.end);

    if (value.start) {
      setSelectedMonth(value.start);
    }
  }, [value]);

  const disabledMatchers = React.useMemo<Matcher[]>(() => {
    const matchers: Matcher[] = [];

    if (minDate) {
      matchers.push({ before: minDate });
    }

    if (maxDate) {
      matchers.push({ after: maxDate });
    }

    if (disabledDates.length > 0) {
      matchers.push(disabledDates);
    }

    if (isDateDisabled) {
      matchers.push(isDateDisabled);
    }

    return matchers;
  }, [disabledDates, isDateDisabled, maxDate, minDate]);

  const handleDateSelect = React.useCallback(
    (date: Date) => {
      if (!rangeStart || rangeEnd) {
        setRangeStart(date);
        setRangeEnd(null);
        setHoverDate(null);
        setSelectedMonth(date);
        onChange({ start: date, end: null });
        onBlur?.();
        return;
      }

      if (toDayTimestamp(date) < toDayTimestamp(rangeStart)) {
        setRangeStart(date);
        setRangeEnd(rangeStart);
        setHoverDate(null);
        setSelectedMonth(date);
        onChange({ start: date, end: rangeStart });
        setIsOpen(false);
        onBlur?.();
        return;
      }

      setRangeEnd(date);
      setHoverDate(null);
      setSelectedMonth(date);
      onChange({ start: rangeStart, end: date });
      setIsOpen(false);
      onBlur?.();
    },
    [onBlur, onChange, rangeEnd, rangeStart],
  );

  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setRangeStart(null);
      setRangeEnd(null);
      setHoverDate(null);
      setIsOpen(false);
      onChange({ start: null, end: null });
      inputRef.current?.focus();
    },
    [onChange],
  );

  const handleOpenChange = React.useCallback(
    (nextOpen: boolean) => {
      if (disabled) {
        setIsOpen(false);
        return;
      }

      if (nextOpen) {
        if (!hasInteracted) {
          setHasInteracted(true);
        }
        setIsOpen(true);
        return;
      }

      if (isOpen && hasInteracted) {
        onBlur?.();
      }

      setHoverDate(null);
      setIsOpen(false);
    },
    [disabled, hasInteracted, isOpen, onBlur],
  );

  const handleInputBlur = React.useCallback(() => {
    if (!isOpen) {
      onBlur?.();
    }
  }, [isOpen, onBlur]);

  const handleInputClick = React.useCallback(() => {
    if (!hasInteracted) {
      setHasInteracted(true);
    }
  }, [hasInteracted]);

  const RangeDayButton = React.useCallback(
    ({
      day,
      modifiers,
      className: dayClassName,
      children,
      onClick,
      onMouseEnter,
      onMouseLeave,
      ...rest
    }: DayButtonProps) => {
      const date = day.date;
      const isStart = isSameDay(date, rangeStart);
      const isEnd = isSameDay(date, rangeEnd);
      const isRangeEndpoint = isStart || isEnd;
      const isInCommittedRange = isDateInRange(date, rangeStart, rangeEnd);
      const isInHoverRange =
        !!rangeStart &&
        !rangeEnd &&
        !!hoverDate &&
        isDateInRange(date, rangeStart, hoverDate);
      const isRangeHighlight =
        (isInCommittedRange || isInHoverRange) && !isRangeEndpoint;
      const isToday = isSameDay(date, new Date());

      return (
        <button
          type="button"
          {...rest}
          className={cn(
            "flex items-center justify-center h-8 w-8 rounded-md border-none bg-transparent cursor-pointer text-sm transition-colors",
            "hover:bg-accent",
            isRangeEndpoint &&
              "bg-primary text-primary-foreground font-semibold",
            isRangeHighlight && "bg-accent",
            !isRangeEndpoint &&
              !isRangeHighlight &&
              isToday &&
              "border border-primary",
            modifiers.disabled &&
              "cursor-not-allowed opacity-50 pointer-events-none",
            dayClassName,
          )}
          onClick={(event) => {
            onClick?.(event);
            if (modifiers.disabled) return;
            handleDateSelect(date);
          }}
          onMouseEnter={(event) => {
            onMouseEnter?.(event);
            if (modifiers.disabled) {
              setHoverDate(null);
              return;
            }
            setHoverDate(date);
          }}
          onMouseLeave={(event) => {
            onMouseLeave?.(event);
            setHoverDate(null);
          }}
        >
          {children ?? date.getDate()}
        </button>
      );
    },
    [handleDateSelect, hoverDate, rangeEnd, rangeStart],
  );

  const hasValue = Boolean(rangeStart || rangeEnd);
  const selectedRange =
    rangeStart || rangeEnd
      ? {
          from: rangeStart ?? undefined,
          to: rangeEnd ?? undefined,
        }
      : undefined;

  const displayValue =
    rangeStart && rangeEnd
      ? `${formatDate(rangeStart, format)}${separator}${formatDate(rangeEnd, format)}`
      : rangeStart
        ? formatDate(rangeStart, format)
        : "";

  const combinedClassName = cn("relative", className);

  return (
    <div className={combinedClassName}>
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

      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        {/* Custom date range input */}
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
          <PopoverTrigger asChild>
            <input
              ref={inputRef}
              id={props.id}
              type="text"
              className={cn(
                "flex h-9 w-full rounded-md border border-input bg-transparent py-1 text-base shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                INPUT_AUTOFILL_RESET_CLASSES,
                showIcon ? "pl-10" : "pl-3",
                clearable && (rangeStart || rangeEnd) ? "pr-10" : "pr-3",
                !error && hasValue && "ring-2 ring-primary",
                error && "ring-2 ring-destructive",
              )}
              value={displayValue}
              onClick={handleInputClick}
              onBlur={handleInputBlur}
              disabled={disabled}
              required={required}
              placeholder={placeholder}
              aria-invalid={error || props["aria-invalid"] ? "true" : "false"}
              aria-describedby={props["aria-describedby"]}
              aria-required={required || props["aria-required"]}
              readOnly
            />
          </PopoverTrigger>
          {clearable && (rangeStart || rangeEnd) && !disabled && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
              onClick={handleClear}
              aria-label="Clear date range"
              tabIndex={-1}
            >
              ✕
            </button>
          )}
        </div>

        {!disabled && (
          <PopoverContent
            align="start"
            sideOffset={4}
            className="w-auto p-0"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
            }}
          >
            <Calendar
              mode="range"
              selected={selectedRange}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              disabled={disabledMatchers}
              labels={{
                labelGrid: () => "Calendar",
                labelDayButton: (date) => formatDate(date, format),
                labelPrevious: () => "Previous month",
                labelNext: () => "Next month",
              }}
              components={{
                DayButton: RangeDayButton,
              }}
              classNames={{
                today: "border border-primary rounded-md bg-transparent",
              }}
              showOutsideDays
            />

            {rangeStart && !rangeEnd && (
              <div className="border-t border-input px-3 py-2 text-center text-xs opacity-70">
                Select end date
              </div>
            )}
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

DateRangePicker.displayName = "DateRangePicker";
