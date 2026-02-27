"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { Checkbox } from "./Checkbox";
import { FieldDescription } from "../components/ui/field";
import { LabelGroup } from "../core/label-group";
import { cn } from "../lib/utils";

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
export interface CheckboxGroupProps extends Omit<
  InputProps<string[]>,
  "onChange" | "placeholder"
> {
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
  layout?: "stacked" | "grid" | "inline";

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
 * - Multiple layout options (stacked, grid)
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
    enabledValues.includes(v),
  ).length;
  const allSelected = selectedEnabledCount === enabledOptions.length;
  const someSelected = selectedEnabledCount > 0 && !allSelected;

  const useChoiceCard: boolean = React.useMemo(() => {
    if (!options) return false;

    return options?.some((opt) => opt.description);
  }, [options]);

  const countableValue: number = React.useMemo(() => {
    if (value?.length > 0) {
      return value.length;
    }
    return 0;
  }, [value]);

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

  // Determine if max selections reached
  const maxReached = Boolean(maxSelections && countableValue >= maxSelections);

  const containerClass = React.useMemo(() => {
    return cn(
      "w-full grid grid-cols-1 border-0 m-0 p-0 min-w-0",
      layout === "grid" && "grid grid-cols-1 md:grid-cols-2 ",
      layout === "inline" && "flex flex-wrap",
      useChoiceCard ? "gap-x-6 space-y-4" : "gap-0",
      className,
    );
  }, [layout, className, useChoiceCard]);

  const groupDescriptionId = description ? `${name}-description` : undefined;
  const groupAriaDescribedBy =
    [props["aria-describedby"], groupDescriptionId].filter(Boolean).join(" ") ||
    undefined;

  return (
    <fieldset
      className={containerClass}
      role="group"
      aria-invalid={error || props["aria-invalid"]}
      aria-describedby={groupAriaDescribedBy}
      aria-required={required || props["aria-required"]}
      aria-label={typeof label === "string" ? label : props["aria-label"]}
    >
      <LabelGroup
        labelHtmlFor={name}
        required={required}
        variant="legend"
        secondaryId={groupDescriptionId}
        secondary={description}
        primary={label}
      />

      {/* Select All Checkbox */}
      {showSelectAll && enabledOptions.length > 0 && (
        <Checkbox
          name={`${name}-select-all`}
          id={`${name}-select-all`}
          value={allSelected}
          onChange={handleSelectAll}
          onBlur={handleBlur}
          indeterminate={someSelected}
          label={selectAllLabel}
          useChoiceCard={useChoiceCard}
          disabled={disabled}
          aria-label={selectAllLabel}
        />
      )}

      {/* Individual Checkboxes */}
      {options.map((option) => {
        const isChecked = value.includes(option.value);
        const isDisabled =
          disabled || option.disabled || (maxReached && !isChecked);

        return (
          <Checkbox
            key={option.value}
            name={name}
            id={`${name}-${option.value}`}
            value={isChecked}
            onChange={(checked) => handleChange(option.value, checked)}
            onBlur={handleBlur}
            disabled={isDisabled}
            required={
              required && minSelections ? value.length < minSelections : false
            }
            error={error}
            label={renderOption ? renderOption(option) : option.label}
            description={renderOption ? undefined : option.description}
            useChoiceCard={useChoiceCard}
          />
        );
      })}

      {/* Selection count feedback */}
      {(minSelections || maxSelections) && (
        <FieldDescription
          className={cn(
            "p-2 rounded-lg border font-semibold mt-2 leading-snug",
            minSelections && countableValue < minSelections
              ? "border-destructive bg-destructive/80 text-destructive-foreground"
              : "border-border bg-card text-card-foreground",
          )}
          aria-live="polite"
        >
          {minSelections && countableValue < minSelections && (
            <span>
              Select at least {minSelections} option
              {minSelections !== 1 ? "s" : ""}
            </span>
          )}
          {maxSelections && (
            <span>
              {countableValue}/{maxSelections} selected
            </span>
          )}
        </FieldDescription>
      )}
    </fieldset>
  );
}

CheckboxGroup.displayName = "CheckboxGroup";
