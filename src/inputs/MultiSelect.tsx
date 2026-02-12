"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import { useOnClickOutside } from "@opensite/hooks/useOnClickOutside";
import { cn, INPUT_AUTOFILL_RESET_CLASSES } from "../utils";

/**
 * Multi-select option type
 */
export interface MultiSelectOption {
  /**
   * The value for this option
   */
  value: string;

  /**
   * Display label for the option
   */
  label: React.ReactNode;

  /**
   * Whether this option is disabled
   */
  disabled?: boolean;
}

/**
 * Multi-select option group type for organizing options
 */
export interface MultiSelectOptionGroup {
  /**
   * Group label
   */
  label: string;

  /**
   * Options in this group
   */
  options: MultiSelectOption[];
}

/**
 * Additional props specific to MultiSelect
 */
export interface MultiSelectProps extends Omit<
  InputProps<string[]>,
  "onChange" | "onFocus"
> {
  /**
   * Change handler - receives array of selected values
   */
  onChange: (value: string[]) => void;

  /**
   * Focus handler
   */
  onFocus?: () => void;

  /**
   * Array of select options (flat structure)
   */
  options?: MultiSelectOption[];

  /**
   * Array of option groups (grouped structure)
   */
  optionGroups?: MultiSelectOptionGroup[];

  /**
   * Placeholder text when no options are selected
   * @default "Select..."
   */
  placeholder?: string;

  /**
   * Enable search/filter functionality
   * @default true
   */
  searchable?: boolean;

  /**
   * Enable clearable button to reset all selections
   * @default true
   */
  clearable?: boolean;

  /**
   * Loading state for async options
   * @default false
   */
  loading?: boolean;

  /**
   * Maximum number of selections allowed
   */
  maxSelections?: number;

  /**
   * Show "Select All" button
   * @default false
   */
  showSelectAll?: boolean;

  /**
   * Custom render function for options
   */
  renderOption?: (option: MultiSelectOption) => React.ReactNode;

  /**
   * Custom render function for selected value chips/tags
   */
  renderValue?: (option: MultiSelectOption) => React.ReactNode;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * MultiSelect - High-performance multi-selection dropdown component
 *
 * A lightweight, accessible multi-select dropdown with search, keyboard navigation,
 * and error state support. Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Multiple value selection
 * - Full accessibility support (ARIA attributes, role="listbox")
 * - Error state styling
 * - Controlled input behavior
 * - Keyboard navigation (arrow keys, Enter, Escape, Space)
 * - Searchable options with filtering
 * - Clearable selections
 * - Option groups support
 * - Loading state for async options
 * - Disabled options support
 * - Maximum selections limit
 * - Select All / Clear All functionality
 * - Selected value chips/tags with individual removal
 * - Click outside to close
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { skills: [] } });
 *
 * <MultiSelect
 *   {...form.getFieldProps('skills')}
 *   placeholder="Select skills"
 *   options={[
 *     { value: 'react', label: 'React' },
 *     { value: 'typescript', label: 'TypeScript' },
 *     { value: 'node', label: 'Node.js' }
 *   ]}
 *   searchable
 *   clearable
 *   showSelectAll
 *   maxSelections={5}
 *   error={!!form.errors.skills}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/multi-select
 */
export function MultiSelect({
  name,
  value = [],
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error = false,
  className = "",
  placeholder = "Select...",
  searchable = true,
  clearable = true,
  loading = false,
  maxSelections,
  showSelectAll = false,
  options = [],
  optionGroups = [],
  renderOption,
  renderValue,
  ...props
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [focusedIndex, setFocusedIndex] = React.useState(-1);
  const selectRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);
  const dropdownId = `${name}-dropdown`;

  // Flatten options from groups or use flat options
  const allOptions = React.useMemo(() => {
    if (optionGroups.length > 0) {
      return optionGroups.flatMap((group) => group.options);
    }
    return options;
  }, [options, optionGroups]);

  // Filter options based on search query
  const filteredOptions = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return allOptions;
    }
    const query = searchQuery.toLowerCase();
    return allOptions.filter((option) => {
      const label =
        typeof option.label === "string" ? option.label : String(option.label);
      return label.toLowerCase().includes(query);
    });
  }, [allOptions, searchQuery]);

  // Get selected options
  const selectedOptions = React.useMemo(() => {
    return allOptions.filter((opt) => value.includes(opt.value));
  }, [allOptions, value]);
  const hasValue = value.length > 0;

  // Check if max selections reached
  const isMaxReached = React.useMemo(() => {
    return maxSelections !== undefined && value.length >= maxSelections;
  }, [maxSelections, value.length]);

  // Handle option selection toggle
  const handleToggleOption = (optionValue: string) => {
    const isSelected = value.includes(optionValue);
    if (isSelected) {
      // Remove from selection
      onChange(value.filter((v) => v !== optionValue));
    } else {
      // Add to selection (if not at max)
      if (!isMaxReached) {
        onChange([...value, optionValue]);
      }
    }
    // Reset search after selection
    setSearchQuery("");
  };

  // Handle select all
  const handleSelectAll = () => {
    const enabledOptions = filteredOptions.filter((opt) => !opt.disabled);
    const allValues = enabledOptions.map((opt) => opt.value);
    onChange(allValues);
    setSearchQuery("");
  };

  // Handle clear all
  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
    setSearchQuery("");
    setFocusedIndex(-1);
  };

  // Handle remove single value
  const handleRemoveValue = (optionValue: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== optionValue));
  };

  // Toggle dropdown
  const handleToggle = () => {
    if (disabled) return;
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    if (newIsOpen && searchable && searchInputRef.current) {
      // Focus search input when opening
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }
    if (newIsOpen) {
      onFocus?.();
    }
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setFocusedIndex(0); // Reset focus to first filtered option
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          setIsOpen(true);
          setFocusedIndex(0);
        } else {
          const enabledOptions = filteredOptions.filter((opt) => !opt.disabled);
          if (enabledOptions.length > 0) {
            const currentIndexInFiltered = focusedIndex;
            const nextIndex =
              (currentIndexInFiltered + 1) % enabledOptions.length;
            setFocusedIndex(filteredOptions.indexOf(enabledOptions[nextIndex]));
          }
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          const enabledOptions = filteredOptions.filter((opt) => !opt.disabled);
          if (enabledOptions.length > 0) {
            const currentIndexInFiltered = focusedIndex;
            const prevIndex =
              (currentIndexInFiltered - 1 + enabledOptions.length) %
              enabledOptions.length;
            setFocusedIndex(filteredOptions.indexOf(enabledOptions[prevIndex]));
          }
        }
        break;

      case "Enter":
        e.preventDefault();
        if (
          isOpen &&
          focusedIndex >= 0 &&
          focusedIndex < filteredOptions.length
        ) {
          const focusedOption = filteredOptions[focusedIndex];
          if (!focusedOption.disabled) {
            handleToggleOption(focusedOption.value);
          }
        } else if (!isOpen) {
          setIsOpen(true);
        }
        break;

      case "Escape":
        e.preventDefault();
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery("");
          setFocusedIndex(-1);
        }
        break;

      case " ":
        // Space key to toggle option if focused
        if (
          isOpen &&
          focusedIndex >= 0 &&
          focusedIndex < filteredOptions.length
        ) {
          e.preventDefault();
          const focusedOption = filteredOptions[focusedIndex];
          if (!focusedOption.disabled) {
            handleToggleOption(focusedOption.value);
          }
        } else if (!isOpen && !searchable) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;
    }
  };

  // Handle blur
  const handleBlur = (event?: React.FocusEvent<HTMLElement>) => {
    const nextTarget = event?.relatedTarget as Node | null;
    if (!nextTarget || !selectRef.current?.contains(nextTarget)) {
      onBlur?.();
    }
  };

  const closeDropdown = React.useCallback(() => {
    if (!isOpen) return;

    setIsOpen(false);
    setSearchQuery("");
    setFocusedIndex(-1);
    onBlur?.();
  }, [isOpen, onBlur]);

  useOnClickOutside(selectRef, closeDropdown, "pointerdown", true);

  const combinedClassName = cn("relative w-full", className);

  return (
    <div
      ref={selectRef}
      className={combinedClassName}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
    >
      {/* Hidden native select for form submission */}
      <select
        name={name}
        value={value}
        onChange={() => {}}
        disabled={disabled}
        required={required}
        aria-hidden="true"
        tabIndex={-1}
        style={{ display: "none" }}
        multiple
      >
        <option value="">Select...</option>
        {allOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {typeof option.label === "string" ? option.label : option.value}
          </option>
        ))}
      </select>

      {/* Custom select trigger */}
      <div
        className={cn(
          "flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
          "cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
          !error && hasValue && "ring-2 ring-ring",
          disabled && "cursor-not-allowed opacity-50 pointer-events-none",
          error && "border-destructive ring-1 ring-destructive",
        )}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-controls={dropdownId}
        aria-invalid={error || props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
        aria-required={required || props["aria-required"]}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex items-center flex-1 overflow-hidden">
          {selectedOptions.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {selectedOptions.map((option) => (
                <span
                  key={option.value}
                  className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium"
                >
                  {renderValue ? (
                    renderValue(option)
                  ) : (
                    <>
                      <span className="max-w-40 overflow-hidden text-ellipsis whitespace-nowrap">
                        {option.label}
                      </span>
                      {!disabled && (
                        <button
                          type="button"
                          className="flex items-center justify-center h-3.5 w-3.5 rounded-sm border-none bg-transparent cursor-pointer text-[0.625rem] p-0 transition-opacity hover:opacity-70"
                          onClick={(e) => handleRemoveValue(option.value, e)}
                          aria-label={`Remove ${option.label}`}
                          tabIndex={-1}
                        >
                          ✕
                        </button>
                      )}
                    </>
                  )}
                </span>
              ))}
            </div>
          ) : (
            <span className="relative">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center gap-1 ml-2">
          {loading && <span className="text-xs">⏳</span>}
          {clearable && value.length > 0 && !disabled && !loading && (
            <button
              type="button"
              className="flex items-center justify-center h-4 w-4 rounded-sm border-none bg-transparent cursor-pointer text-xs p-0 transition-opacity hover:opacity-70"
              onClick={handleClearAll}
              aria-label="Clear all selections"
              tabIndex={-1}
            >
              ✕
            </button>
          )}
          <span className="text-xs leading-none" aria-hidden="true">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          id={dropdownId}
          className="absolute z-50 top-full mt-1 w-full overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md"
          role="listbox"
          aria-multiselectable="true"
        >
          {searchable && (
            <div className="p-2 border-b border-border">
              <input
                ref={searchInputRef}
                type="text"
                className={cn(
                  "w-full border border-input rounded px-2 py-1 text-sm bg-transparent outline-none focus:ring-1 focus:ring-ring",
                  INPUT_AUTOFILL_RESET_CLASSES,
                )}
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
                aria-label="Search options"
              />
            </div>
          )}

          {showSelectAll && filteredOptions.length > 0 && (
            <div className="flex gap-2 p-2 border-b border-border">
              <button
                type="button"
                className="flex-1 px-3 py-1.5 text-xs font-medium rounded border border-input bg-transparent hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleSelectAll}
                disabled={disabled}
              >
                Select All
              </button>
              {value.length > 0 && (
                <button
                  type="button"
                  className="flex-1 px-3 py-1.5 text-xs font-medium rounded border border-input bg-transparent hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleClearAll}
                  disabled={disabled}
                >
                  Clear All
                </button>
              )}
            </div>
          )}

          {isMaxReached && (
            <div className="px-2 py-1 text-xs font-medium text-amber-600 bg-destructive/80 text-destructive-foreground border-b border-destructive">
              Maximum {maxSelections} selection{maxSelections !== 1 ? "s" : ""}{" "}
              reached
            </div>
          )}

          <div className="max-h-64 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="px-2 py-1 text-center text-sm">
                No options found
              </div>
            ) : optionGroups.length > 0 ? (
              // Render grouped options
              optionGroups.map((group, groupIndex) => {
                const groupOptions = group.options.filter((opt) =>
                  filteredOptions.includes(opt),
                );
                if (groupOptions.length === 0) return null;

                return (
                  <div key={groupIndex} className="py-1">
                    <div className="py-1.5 px-2 text-xs font-semibold ">
                      {group.label}
                    </div>
                    {groupOptions.map((option) => {
                      const globalIndex = filteredOptions.indexOf(option);
                      const isSelected = value.includes(option.value);
                      const isFocused = globalIndex === focusedIndex;
                      const isDisabled =
                        option.disabled || (isMaxReached && !isSelected);

                      return (
                        <div
                          key={option.value}
                          className={`relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-muted ${isFocused ? "bg-muted" : ""} ${isSelected ? "font-medium" : ""} ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
                          onClick={() =>
                            !isDisabled && handleToggleOption(option.value)
                          }
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={isDisabled}
                        >
                          <span className="text-base leading-none">
                            {isSelected ? "☑" : "☐"}
                          </span>
                          <span className="flex-1">
                            {renderOption ? renderOption(option) : option.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              // Render flat options
              filteredOptions.map((option, index) => {
                const isSelected = value.includes(option.value);
                const isFocused = index === focusedIndex;
                const isDisabled =
                  option.disabled || (isMaxReached && !isSelected);

                return (
                  <div
                    key={option.value}
                    className={`relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 px-2 text-sm outline-none transition-colors hover:bg-muted ${isFocused ? "bg-muted" : ""} ${isSelected ? "font-medium bg-muted" : ""} ${isDisabled ? "pointer-events-none opacity-50" : ""}`}
                    onClick={() =>
                      !isDisabled && handleToggleOption(option.value)
                    }
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                  >
                    <span className="text-base leading-none">
                      {isSelected ? "☑" : "☐"}
                    </span>
                    <span className="flex-1">
                      {renderOption ? renderOption(option) : option.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

MultiSelect.displayName = "MultiSelect";
