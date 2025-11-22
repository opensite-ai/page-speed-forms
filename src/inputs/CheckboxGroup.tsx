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

  const baseClassName = "checkbox-group";
  const errorClassName = error ? "checkbox-group--error" : "";
  const layoutClassName = `checkbox-group--${layout}`;
  const combinedClassName =
    `${baseClassName} ${errorClassName} ${layoutClassName} ${className}`.trim();

  // Determine if max selections reached
  const maxReached = maxSelections && value.length >= maxSelections;

  return (
    <div
      className={combinedClassName}
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
      {label && <div className="checkbox-group-label">{label}</div>}
      {description && (
        <div className="checkbox-group-description">{description}</div>
      )}

      <div className="checkbox-options">
        {/* Select All Checkbox */}
        {showSelectAll && enabledOptions.length > 0 && (
          <label className="checkbox-option checkbox-option--select-all">
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
              className="checkbox-input"
              aria-label={selectAllLabel}
            />
            <div className="checkbox-content">
              <span className="checkbox-label">{selectAllLabel}</span>
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
              className={`checkbox-option ${isDisabled ? "checkbox-option--disabled" : ""}`}
              htmlFor={checkboxId}
            >
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
                className="checkbox-input"
                aria-describedby={
                  option.description
                    ? `${checkboxId}-description`
                    : props["aria-describedby"]
                }
              />
              <div className="checkbox-content">
                {renderOption ? (
                  renderOption(option)
                ) : (
                  <>
                    <span className="checkbox-label">{option.label}</span>
                    {option.description && (
                      <span
                        className="checkbox-description"
                        id={`${checkboxId}-description`}
                      >
                        {option.description}
                      </span>
                    )}
                  </>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {/* Selection count feedback */}
      {(minSelections || maxSelections) && (
        <div className="checkbox-group-feedback" aria-live="polite">
          {minSelections && value.length < minSelections && (
            <span className="checkbox-group-feedback-min">
              Select at least {minSelections} option{minSelections !== 1 ? "s" : ""}
            </span>
          )}
          {maxSelections && (
            <span className="checkbox-group-feedback-max">
              {value.length}/{maxSelections} selected
            </span>
          )}
        </div>
      )}
    </div>
  );
}

CheckboxGroup.displayName = "CheckboxGroup";
