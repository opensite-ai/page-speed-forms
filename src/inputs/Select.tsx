"use client";

import * as React from "react";
import type { InputProps } from "../core/types";

/**
 * Select option type
 */
export interface SelectOption {
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
 * Select option group type for organizing options
 */
export interface SelectOptionGroup {
  /**
   * Group label
   */
  label: string;

  /**
   * Options in this group
   */
  options: SelectOption[];
}

/**
 * Additional props specific to Select
 */
export interface SelectProps
  extends Omit<InputProps<string>, "onChange" | "onFocus"> {
  /**
   * Change handler - receives selected value
   */
  onChange: (value: string) => void;

  /**
   * Focus handler
   */
  onFocus?: () => void;

  /**
   * Array of select options (flat structure)
   */
  options?: SelectOption[];

  /**
   * Array of option groups (grouped structure)
   */
  optionGroups?: SelectOptionGroup[];

  /**
   * Placeholder text when no option is selected
   * @default "Select..."
   */
  placeholder?: string;

  /**
   * Enable search/filter functionality
   * @default true
   */
  searchable?: boolean;

  /**
   * Enable clearable button to reset selection
   * @default true
   */
  clearable?: boolean;

  /**
   * Loading state for async options
   * @default false
   */
  loading?: boolean;

  /**
   * Custom render function for options
   */
  renderOption?: (option: SelectOption) => React.ReactNode;

  /**
   * Additional native input attributes
   */
  [key: string]: any;
}

/**
 * Select - High-performance dropdown selection component
 *
 * A lightweight, accessible select/dropdown with search, keyboard navigation,
 * and error state support. Designed to work seamlessly with useForm and Field components.
 *
 * Features:
 * - Full accessibility support (ARIA attributes, role="combobox")
 * - Error state styling
 * - Controlled input behavior
 * - Keyboard navigation (arrow keys, Enter, Escape, type-ahead)
 * - Searchable options with filtering
 * - Clearable selection
 * - Option groups support
 * - Loading state for async options
 * - Disabled options support
 * - Click outside to close
 *
 * @example
 * ```tsx
 * const form = useForm({ initialValues: { country: '' } });
 *
 * <Select
 *   {...form.getFieldProps('country')}
 *   placeholder="Select a country"
 *   options={[
 *     { value: 'us', label: 'United States' },
 *     { value: 'ca', label: 'Canada' },
 *     { value: 'mx', label: 'Mexico' }
 *   ]}
 *   searchable
 *   clearable
 *   error={!!form.errors.country}
 *   aria-describedby={form.errors.country ? 'country-error' : undefined}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With option groups
 * <Select
 *   name="timezone"
 *   value={timezone}
 *   onChange={handleTimezoneChange}
 *   optionGroups={[
 *     {
 *       label: 'North America',
 *       options: [
 *         { value: 'est', label: 'Eastern Time' },
 *         { value: 'cst', label: 'Central Time' }
 *       ]
 *     },
 *     {
 *       label: 'Europe',
 *       options: [
 *         { value: 'gmt', label: 'GMT' },
 *         { value: 'cet', label: 'Central European Time' }
 *       ]
 *     }
 *   ]}
 * />
 * ```
 *
 * @see https://opensite.ai/developers/page-speed/forms/select
 */
export function Select({
  name,
  value,
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
  options = [],
  optionGroups = [],
  renderOption,
  ...props
}: SelectProps) {
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

  // Get selected option
  const selectedOption = React.useMemo(() => {
    return allOptions.find((opt) => opt.value === value);
  }, [allOptions, value]);

  // Handle option selection
  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchQuery("");
    setFocusedIndex(-1);
  };

  // Handle clear selection
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange("");
    setSearchQuery("");
    setFocusedIndex(-1);
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
            handleSelect(focusedOption.value);
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
        // Space key to open dropdown if not searching
        if (!isOpen && !searchable) {
          e.preventDefault();
          setIsOpen(true);
        }
        break;

      default:
        // Type-ahead search (only if not already searching)
        if (!searchable && e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          const char = e.key.toLowerCase();
          const matchingOption = filteredOptions.find((opt) => {
            const label =
              typeof opt.label === "string"
                ? opt.label
                : String(opt.label);
            return label.toLowerCase().startsWith(char) && !opt.disabled;
          });
          if (matchingOption) {
            handleSelect(matchingOption.value);
          }
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

  const baseClassName = "select";
  const errorClassName = error ? "select--error" : "";
  const disabledClassName = disabled ? "select--disabled" : "";
  const openClassName = isOpen ? "select--open" : "";
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
        className="select-trigger"
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
        <span className="select-value">
          {selectedOption ? (
            renderOption ? (
              renderOption(selectedOption)
            ) : (
              selectedOption.label
            )
          ) : (
            <span className="select-placeholder">{placeholder}</span>
          )}
        </span>
        <div className="select-icons">
          {loading && <span className="select-loading">⏳</span>}
          {clearable && value && !disabled && !loading && (
            <button
              type="button"
              className="select-clear"
              onClick={handleClear}
              aria-label="Clear selection"
              tabIndex={-1}
            >
              ✕
            </button>
          )}
          <span className="select-arrow" aria-hidden="true">
            {isOpen ? "▲" : "▼"}
          </span>
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div id={dropdownId} className="select-dropdown" role="listbox">
          {searchable && (
            <div className="select-search">
              <input
                ref={searchInputRef}
                type="text"
                className="select-search-input"
                placeholder="Search..."
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()}
                aria-label="Search options"
              />
            </div>
          )}

          <div className="select-options">
            {filteredOptions.length === 0 ? (
              <div className="select-no-options">No options found</div>
            ) : optionGroups.length > 0 ? (
              // Render grouped options
              optionGroups.map((group, groupIndex) => {
                const groupOptions = group.options.filter((opt) =>
                  filteredOptions.includes(opt)
                );
                if (groupOptions.length === 0) return null;

                return (
                  <div key={groupIndex} className="select-optgroup">
                    <div className="select-optgroup-label">{group.label}</div>
                    {groupOptions.map((option) => {
                      const globalIndex = filteredOptions.indexOf(option);
                      const isSelected = value === option.value;
                      const isFocused = globalIndex === focusedIndex;
                      const isDisabled = option.disabled;

                      return (
                        <div
                          key={option.value}
                          className={`select-option ${isSelected ? "select-option--selected" : ""} ${isFocused ? "select-option--focused" : ""} ${isDisabled ? "select-option--disabled" : ""}`}
                          onClick={() =>
                            !isDisabled && handleSelect(option.value)
                          }
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={isDisabled}
                        >
                          {renderOption ? renderOption(option) : option.label}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              // Render flat options
              filteredOptions.map((option, index) => {
                const isSelected = value === option.value;
                const isFocused = index === focusedIndex;
                const isDisabled = option.disabled;

                return (
                  <div
                    key={option.value}
                    className={`select-option ${isSelected ? "select-option--selected" : ""} ${isFocused ? "select-option--focused" : ""} ${isDisabled ? "select-option--disabled" : ""}`}
                    onClick={() => !isDisabled && handleSelect(option.value)}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={isDisabled}
                  >
                    {renderOption ? renderOption(option) : option.label}
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

Select.displayName = "Select";
