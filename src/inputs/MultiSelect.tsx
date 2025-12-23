"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

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
export interface MultiSelectProps
  extends Omit<InputProps<string[]>, "onChange" | "onFocus"> {
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
            const nextIndex = (currentIndexInFiltered + 1) % enabledOptions.length;
            setFocusedIndex(
              filteredOptions.indexOf(enabledOptions[nextIndex])
            );
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
            setFocusedIndex(
              filteredOptions.indexOf(enabledOptions[prevIndex])
            );
          }
        }
        break;

      case "Enter":
        e.preventDefault();
        if (isOpen && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
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
        if (isOpen && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
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
  const handleBlur = () => {
    onBlur?.();
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
        setFocusedIndex(-1);
        handleBlur();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  const baseClassName = "multi-select";
  const errorClassName = error ? "multi-select--error" : "";
  const disabledClassName = disabled ? "multi-select--disabled" : "";
  const openClassName = isOpen ? "multi-select--open" : "";
  const combinedClassName =
    `${baseClassName} ${errorClassName} ${disabledClassName} ${openClassName} ${className}`.trim();

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
        className="multi-select-trigger"
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
        <div className="multi-select-values">
          {selectedOptions.length > 0 ? (
            <div className="multi-select-value-list">
              {selectedOptions.map((option) => (
                <span key={option.value} className="multi-select-value-chip">
                  {renderValue ? renderValue(option) : (
                    <>
                      <span className="multi-select-value-label">
                        {option.label}
                      </span>
                      {!disabled && (
                        <button
                          type="button"
                          className="multi-select-value-remove"
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
            <span className="multi-select-placeholder">{placeholder}</span>
          )}
        </div>
        <div className="multi-select-icons">
          {loading && <span className="multi-select-loading">⏳</span>}
          {clearable && value.length > 0 && !disabled && !loading && (
            <button
              type="button"
              className="multi-select-clear"
              onClick={handleClearAll}
              aria-label="Clear all selections"
              tabIndex={-1}
            >
              ✕
            </button>
          )}
          <span className="multi-select-arrow" aria-hidden="true">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div id={dropdownId} className="multi-select-dropdown" role="listbox" aria-multiselectable="true">
          {searchable && (
            <div className="multi-select-search">
              <input
                ref={searchInputRef}
                type="text"
                className="multi-select-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
                aria-label="Search options"
              />
            </div>
          )}

          {showSelectAll && filteredOptions.length > 0 && (
            <div className="multi-select-actions">
              <button
                type="button"
                className="multi-select-action-button"
                onClick={handleSelectAll}
                disabled={disabled}
              >
                Select All
              </button>
              {value.length > 0 && (
                <button
                  type="button"
                  className="multi-select-action-button"
                  onClick={handleClearAll}
                  disabled={disabled}
                >
                  Clear All
                </button>
              )}
            </div>
          )}

          {isMaxReached && (
            <div className="multi-select-max-notice">
              Maximum {maxSelections} selection{maxSelections !== 1 ? "s" : ""} reached
            </div>
          )}

          <div className="multi-select-options">
            {filteredOptions.length === 0 ? (
              <div className="multi-select-no-options">No options found</div>
            ) : optionGroups.length > 0 ? (
              // Render grouped options
              optionGroups.map((group, groupIndex) => {
                const groupOptions = group.options.filter((opt) =>
                  filteredOptions.includes(opt)
                );
                if (groupOptions.length === 0) return null;

                return (
                  <div key={groupIndex} className="multi-select-optgroup">
                    <div className="multi-select-optgroup-label">{group.label}</div>
                    {groupOptions.map((option) => {
                      const globalIndex = filteredOptions.indexOf(option);
                      const isSelected = value.includes(option.value);
                      const isFocused = globalIndex === focusedIndex;
                      const isDisabled = option.disabled || (isMaxReached && !isSelected);

                      return (
                        <div
                          key={option.value}
                          className={`multi-select-option ${isSelected ? "multi-select-option--selected" : ""} ${isFocused ? "multi-select-option--focused" : ""} ${isDisabled ? "multi-select-option--disabled" : ""}`}
                          onClick={() =>
                            !isDisabled && handleToggleOption(option.value)
                          }
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={isDisabled}
                        >
                          <span className="multi-select-option-checkbox">
                            {isSelected ? "☑" : "☐"}
                          </span>
                          <span className="multi-select-option-label">
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
                const isDisabled = option.disabled || (isMaxReached && !isSelected);

                return (
                  <div
                    key={option.value}
                    className={`multi-select-option ${isSelected ? "multi-select-option--selected" : ""} ${isFocused ? "multi-select-option--focused" : ""} ${isDisabled ? "multi-select-option--disabled" : ""}`}
                    onClick={() => !isDisabled && handleToggleOption(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                  >
                    <span className="multi-select-option-checkbox">
                      {isSelected ? "☑" : "☐"}
                    </span>
                    <span className="multi-select-option-label">
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
