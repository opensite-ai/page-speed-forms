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
import { DEFAULT_ICON_API_BASE_URL, Icon } from "@page-speed/icon";

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

function DatePickerDayButton({
  day,
  modifiers,
  className,
  children,
  ...props
}: DayButtonProps) {
  return (
    <button
      type="button"
      className={cn(
        "flex items-center justify-center h-8 w-8 rounded-md border-none bg-transparent cursor-pointer text-sm transition-colors",
        "hover:bg-accent",
        modifiers.selected &&
          "bg-primary text-primary-foreground font-semibold",
        !modifiers.selected && modifiers.today && "border border-primary",
        modifiers.disabled &&
          "cursor-not-allowed opacity-50 pointer-events-none",
        className,
      )}
      {...props}
    >
      {children ?? day.date.getDate()}
    </button>
  );
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
  placeholder = "Select date",
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
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<Date>(
    value || new Date(),
  );
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Sync selected month with controlled value prop
  React.useEffect(() => {
    if (value) {
      setSelectedMonth(value);
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
    (date: Date | undefined) => {
      if (!date) return;

      onChange(date);
      setSelectedMonth(date);
      setIsOpen(false);
      onBlur?.();
    },
    [onBlur, onChange],
  );

  // Handle clear button
  const handleClear = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setIsOpen(false);
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

  const hasValue = Boolean(value);
  const displayValue = formatDate(value, format);

  const combinedClassName = cn("relative", className);

  return (
    <div className={combinedClassName}>
      {/* Hidden native date input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value ? value.toISOString() : ""}
      />

      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        {/* Custom date input */}
        <div className="relative">
          {showIcon && (
            <span
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2",
                "pointer-events-none flex items-center justify-center",
                "pointer-events-none",
              )}
              aria-hidden="true"
            >
              <Icon
                name="material-symbols/edit-calendar-outline"
                apiKey={DEFAULT_ICON_API_BASE_URL}
                size={18}
              />
            </span>
          )}
          <PopoverTrigger asChild>
            <input
              ref={inputRef}
              id={props.id}
              type="text"
              className={cn(
                "flex h-9 w-full rounded-md border",
                "border-input bg-transparent py-1 text-base",
                "shadow-sm transition-colors",
                "focus-visible:outline-none focus-visible:ring-1",
                "focus-visible:ring-ring",
                "disabled:cursor-not-allowed",
                "disabled:opacity-50 md:text-sm",
                INPUT_AUTOFILL_RESET_CLASSES,
                showIcon ? "pl-10" : "pl-3",
                clearable && value ? "pr-10" : "pr-3",
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
              mode="single"
              selected={value ?? undefined}
              onSelect={handleDateSelect}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              disabled={disabledMatchers}
              showOutsideDays
              labels={{
                labelGrid: () => "Calendar",
                labelDayButton: (date) => formatDate(date, format),
                labelPrevious: () => "Previous month",
                labelNext: () => "Next month",
              }}
              components={{
                DayButton: DatePickerDayButton,
              }}
              classNames={{
                today: "ring-2 ring-primary rounded-md bg-transparent",
              }}
            />
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

DatePicker.displayName = "DatePicker";
