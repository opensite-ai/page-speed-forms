"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

/**
 * CheckboxGroup option type
 */
export interface CheckboxGroupOption {
  /**
   * The value for this checkbox option
   */
  value: string;

  /**
   * Display label for the option
   */
  label: React.ReactNode;

  /**
   * Optional description text below the label
   */
  description?: React.ReactNode;

  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
}

/**
 * Additional props specific to CheckboxGroup
 */
export interface CheckboxGroupProps
  extends Omit<InputProps<string[]>, "onChange" | "placeholder"> {
  /**
   * Change handler - receives array of selected values
   */
  onChange: (values: string[]) => void;

  /**
   * Array of checkbox options
   */
  options: CheckboxGroupOption[];

  /**
   * Layout direction
   * @default "stacked"
   */
  layout?: "inline" | "stacked" | "grid";

  /**
   * Group-level label
   */
  label?: React.ReactNode;

  /**
   * Group-level description
   */
  description?: React.ReactNode;

  /**
   * Show "select all" checkbox
   * @default false
   */
  showSelectAll?: boolean;

  /**
   * Label for the select all checkbox
   * @default "Select all"
   */
  selectAllLabel?: string;

  /**
   * Minimum number of selections required
   */
  minSelections?: number;

  /**
   * Maximum number of selections allowed
   */
  maxSelections?: number;

  /**
   * Custom render function for options
   */
  renderOption?: (option: CheckboxGroupOption) => React.ReactNode;

  /**
   * Grid columns (only applies when layout="grid")
   * @default 2
   */
  gridColumns?: number;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * CheckboxGroup - High-performance multiple selection component
 *
 * A lightweight, accessible checkbox group with error state support.
 * Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Full accessibility support (ARIA attributes, role="group")
 * - Error state styling
 * - Controlled input behavior
 * - Multiple layout options (inline, stacked, grid)
 * - Optional "select all" checkbox
 * - Individual option disabled state
 * - Minimum/maximum selection validation
 * - Custom option rendering
 * - Optional descriptions for each option
 * - All native checkbox attributes supported
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { interests: [] } });
 *
 * <CheckboxGroup
 *   {...form.getFieldProps('interests')}
 *   label="Select your interests"
 *   options={[
 *     { value: 'sports', label: 'Sports', description: 'Football, Basketball, etc.' },
 *     { value: 'music', label: 'Music', description: 'All genres' },
 *     { value: 'reading', label: 'Reading', description: 'Books and articles' }
 *   ]}
 *   showSelectAll
 *   error={!!form.errors.interests}
 *   aria-describedby={form.errors.interests ? 'interests-error' : undefined}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // Grid layout with min/max selections
 * <CheckboxGroup
 *   name="features"
 *   value={features}
 *   onChange={handleFeaturesChange}
 *   layout="grid"
 *   gridColumns={3}
 *   minSelections={1}
 *   maxSelections={3}
 *   label="Select 1-3 features"
 *   options={[
 *     { value: 'ssl', label: 'SSL Certificate' },
 *     { value: 'cdn', label: 'CDN' },
 *     { value: 'backup', label: 'Daily Backups' },
 *     { value: 'support', label: '24/7 Support' }
 *   ]}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/checkbox-group
 */
export function CheckboxGroup({
  name,
  value = [],
  onChange,
  onBlur,
  disabled = false,
  required = false,
  error = false,
  className = "",
  layout = "stacked",
  label,
  description,
  options,
  showSelectAll = false,
  selectAllLabel = "Select all",
  minSelections,
  maxSelections,
  renderOption,
  gridColumns = 2,
  ...props
}: CheckboxGroupProps) {
  // Calculate select all state
  const enabledOptions = options.filter((opt) => !opt.disabled);
  const enabledValues = enabledOptions.map((opt) => opt.value);
  const selectedEnabledCount = value.filter((v) =>
    enabledValues.includes(v)
  ).length;
  const allSelected = selectedEnabledCount === enabledOptions.length;
  const someSelected = selectedEnabledCount > 0 && !allSelected;

  // Handle individual checkbox change
  const handleChange = (optionValue: string, checked: boolean) => {
    const newValues = checked
      ? [...value, optionValue]
      : value.filter((v) => v !== optionValue);

    // Enforce max selections
    if (maxSelections && checked && newValues.length > maxSelections) {
      return;
    }

    onChange(newValues);
  };

  // Handle select all change
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Select all enabled options
      const allValues = enabledOptions.map((opt) => opt.value);
      onChange(allValues);
    } else {
      // Deselect all
      onChange([]);
    }
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const layoutClass =
    layout === "inline"
      ? "flex flex-row flex-wrap gap-4"
      : layout === "grid"
      ? `grid gap-3`
      : "flex flex-col gap-3";

  const containerClass = `w-full ${layoutClass} ${className}`.trim();

  // Determine if max selections reached
  const maxReached = Boolean(maxSelections && value.length >= maxSelections);

  return (
    <div
      className={containerClass}
      role="group"
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={props["aria-describedby"]}
      aria-required={required || props["aria-required"]}
      aria-label={typeof label === "string" ? label : props["aria-label"]}
      style={
        layout === "grid"
          ? {
              gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            }
          : undefined
      }
    >
      {label && <div className="text-sm font-medium">{label}</div>}
      {description && (
        <div className="text-muted-foreground text-sm">{description}</div>
      )}

      {/* Select All Checkbox */}
      {showSelectAll && enabledOptions.length > 0 && (
        <label
          className={`flex w-fit gap-2 items-center ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        >
          <div className="flex w-full flex-row items-center gap-2">
            <div className="relative inline-flex">
              <input
                type="checkbox"
                checked={allSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = someSelected;
                  }
                }}
                onChange={(e) => handleSelectAll(e.target.checked)}
                onBlur={handleBlur}
                disabled={disabled}
                className="peer relative flex size-4 shrink-0 appearance-none items-center justify-center rounded-lg border border-input bg-transparent outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={selectAllLabel}
              />
              {allSelected && (
                <span className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-primary-foreground">
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
              )}
              {someSelected && !allSelected && (
                <span className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-primary">
                  <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </span>
              )}
            </div>
            <span className="text-sm font-medium">{selectAllLabel}</span>
          </div>
        </label>
      )}

      {/* Individual Checkboxes */}
      {options.map((option) => {
        const isChecked = value.includes(option.value);
        const isDisabled =
          disabled || option.disabled || (maxReached && !isChecked);
        const checkboxId = `${name}-${option.value}`;

        return (
          <label
            key={option.value}
            className={`flex w-fit gap-2 items-center ${isDisabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            htmlFor={checkboxId}
          >
            <div className="flex w-full flex-row items-center gap-2">
              <div className="relative inline-flex">
                <input
                  type="checkbox"
                  id={checkboxId}
                  name={name}
                  value={option.value}
                  checked={isChecked}
                  onChange={(e) => handleChange(option.value, e.target.checked)}
                  onBlur={handleBlur}
                  disabled={isDisabled}
                  required={required && minSelections ? value.length < minSelections : false}
                  className={`peer relative flex size-4 shrink-0 appearance-none items-center justify-center rounded-lg border border-input bg-transparent outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 ${error ? "border-destructive ring-3 ring-destructive/20" : ""} ${isChecked ? "bg-primary border-primary" : ""}`}
                  aria-describedby={
                    option.description
                      ? `${checkboxId}-description`
                      : props["aria-describedby"]
                  }
                />
                {isChecked && (
                  <span className="pointer-events-none absolute top-1/2 left-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center text-primary-foreground">
                    <svg className="size-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col gap-0.5">
                {renderOption ? (
                  renderOption(option)
                ) : (
                  <>
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {option.label}
                    </div>
                    {option.description && (
                      <p
                        className="text-muted-foreground text-sm"
                        id={`${checkboxId}-description`}
                      >
                        {option.description}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </label>
        );
      })}

      {/* Selection count feedback */}
      {(minSelections || maxSelections) && (
        <div className="text-sm text-muted-foreground mt-2" aria-live="polite">
          {minSelections && value.length < minSelections && (
            <span className="text-destructive">
              Select at least {minSelections} option{minSelections !== 1 ? "s" : ""}
            </span>
          )}
          {maxSelections && (
            <span>
              {value.length}/{maxSelections} selected
            </span>
          )}
        </div>
      )}
    </div>
  );
}

CheckboxGroup.displayName = "CheckboxGroup";
