"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
} from "../components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import { cn, INPUT_AUTOFILL_RESET_CLASSES } from "../lib/utils";

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

function ensureResizeObserver() {
  if (typeof window === "undefined") return;

  const windowWithResizeObserver = window as unknown as {
    ResizeObserver?: new (...args: any[]) => {
      observe: (...args: any[]) => void;
      unobserve: (...args: any[]) => void;
      disconnect: () => void;
    };
  };

  if (windowWithResizeObserver.ResizeObserver) return;

  windowWithResizeObserver.ResizeObserver = class ResizeObserverMock {
    observe() {}
    unobserve() {}
    disconnect() {}
  };

  if (
    typeof HTMLElement !== "undefined" &&
    typeof HTMLElement.prototype.scrollIntoView !== "function"
  ) {
    HTMLElement.prototype.scrollIntoView = () => {};
  }
}

function optionLabelText(option: MultiSelectOption): string {
  if (typeof option.label === "string") {
    return option.label;
  }
  return String(option.label);
}

/**
 * MultiSelect - ShadCN Command + Popover multi-select component
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
  const [hasInteracted, setHasInteracted] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);
  const dropdownId = `${name}-dropdown`;
  const searchInputId = `${name}-search`;

  ensureResizeObserver();

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
    return allOptions.filter((option) =>
      optionLabelText(option).toLowerCase().includes(query),
    );
  }, [allOptions, searchQuery]);

  // Get selected options
  const selectedOptions = React.useMemo(() => {
    return allOptions.filter((option) => value.includes(option.value));
  }, [allOptions, value]);

  const hasValue = value.length > 0;

  // Check if max selections reached
  const isMaxReached = React.useMemo(() => {
    return maxSelections !== undefined && value.length >= maxSelections;
  }, [maxSelections, value.length]);

  const getEnabledOptions = React.useCallback(() => {
    return filteredOptions.filter(
      (option) => !option.disabled && (!isMaxReached || value.includes(option.value)),
    );
  }, [filteredOptions, isMaxReached, value]);

  React.useEffect(() => {
    if (!isOpen) return;
    if (!searchable) return;

    const id = window.setTimeout(() => {
      const searchInput = document.getElementById(
        searchInputId,
      ) as HTMLInputElement | null;
      searchInput?.focus();
    }, 0);

    return () => {
      window.clearTimeout(id);
    };
  }, [isOpen, searchable, searchInputId]);

  // Handle option selection toggle
  const handleToggleOption = React.useCallback(
    (optionValue: string) => {
      const isSelected = value.includes(optionValue);

      if (isSelected) {
        onChange(value.filter((entry) => entry !== optionValue));
      } else if (!isMaxReached) {
        onChange([...value, optionValue]);
      }

      // Reset search after selection
      setSearchQuery("");
    },
    [isMaxReached, onChange, value],
  );

  // Handle select all
  const handleSelectAll = React.useCallback(() => {
    const enabledOptions = filteredOptions.filter((option) => !option.disabled);
    onChange(enabledOptions.map((option) => option.value));
    setSearchQuery("");
  }, [filteredOptions, onChange]);

  // Handle clear all
  const handleClearAll = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange([]);
      setSearchQuery("");
      setFocusedIndex(-1);
    },
    [onChange],
  );

  // Handle remove single value
  const handleRemoveValue = React.useCallback(
    (optionValue: string, e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(value.filter((entry) => entry !== optionValue));
    },
    [onChange, value],
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
        onFocus?.();
        return;
      }

      if (isOpen && hasInteracted) {
        onBlur?.();
      }

      setIsOpen(false);
      setSearchQuery("");
      setFocusedIndex(-1);
    },
    [disabled, hasInteracted, isOpen, onBlur, onFocus],
  );

  const handleTriggerBlur = React.useCallback(() => {
    if (!isOpen) {
      onBlur?.();
    }
  }, [isOpen, onBlur]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) return;

      const enabledOptions = getEnabledOptions();

      switch (event.key) {
        case "ArrowDown": {
          event.preventDefault();

          if (!isOpen) {
            setHasInteracted(true);
            setIsOpen(true);
            onFocus?.();
            if (enabledOptions.length > 0) {
              setFocusedIndex(filteredOptions.indexOf(enabledOptions[0]));
            }
            return;
          }

          if (enabledOptions.length === 0) return;

          const currentOption = filteredOptions[focusedIndex];
          const currentEnabledIndex = enabledOptions.findIndex(
            (option) => option === currentOption,
          );
          const nextEnabledIndex =
            currentEnabledIndex === -1
              ? 0
              : (currentEnabledIndex + 1) % enabledOptions.length;
          setFocusedIndex(filteredOptions.indexOf(enabledOptions[nextEnabledIndex]));
          break;
        }

        case "ArrowUp": {
          event.preventDefault();

          if (!isOpen || enabledOptions.length === 0) return;

          const currentOption = filteredOptions[focusedIndex];
          const currentEnabledIndex = enabledOptions.findIndex(
            (option) => option === currentOption,
          );
          const previousEnabledIndex =
            currentEnabledIndex === -1
              ? enabledOptions.length - 1
              : (currentEnabledIndex - 1 + enabledOptions.length) %
                enabledOptions.length;
          setFocusedIndex(
            filteredOptions.indexOf(enabledOptions[previousEnabledIndex]),
          );
          break;
        }

        case "Enter": {
          event.preventDefault();

          if (
            isOpen &&
            focusedIndex >= 0 &&
            focusedIndex < filteredOptions.length
          ) {
            const focusedOption = filteredOptions[focusedIndex];
            const optionDisabled =
              focusedOption.disabled ||
              (isMaxReached && !value.includes(focusedOption.value));

            if (!optionDisabled) {
              handleToggleOption(focusedOption.value);
            }
            return;
          }

          if (!isOpen) {
            setHasInteracted(true);
            setIsOpen(true);
            onFocus?.();
          }
          break;
        }

        case "Escape": {
          if (!isOpen) return;
          event.preventDefault();
          setIsOpen(false);
          setSearchQuery("");
          setFocusedIndex(-1);
          break;
        }

        case " ": {
          if (
            isOpen &&
            focusedIndex >= 0 &&
            focusedIndex < filteredOptions.length
          ) {
            event.preventDefault();
            const focusedOption = filteredOptions[focusedIndex];
            const optionDisabled =
              focusedOption.disabled ||
              (isMaxReached && !value.includes(focusedOption.value));

            if (!optionDisabled) {
              handleToggleOption(focusedOption.value);
            }
            return;
          }

          if (!isOpen && !searchable) {
            event.preventDefault();
            setHasInteracted(true);
            setIsOpen(true);
            onFocus?.();
          }
          break;
        }
      }
    },
    [
      disabled,
      filteredOptions,
      focusedIndex,
      getEnabledOptions,
      handleToggleOption,
      isMaxReached,
      isOpen,
      onFocus,
      searchable,
      value,
    ],
  );

  const combinedClassName = cn("relative w-full", className);

  return (
    <div className={combinedClassName}>
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
            {optionLabelText(option)}
          </option>
        ))}
      </select>

      <Popover open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverTrigger asChild>
          <div
            ref={triggerRef}
            className={cn(
              "flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm",
              "cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              !error && hasValue && "ring-2 ring-ring",
              disabled && "cursor-not-allowed opacity-50 pointer-events-none",
              error && "border-destructive ring-1 ring-destructive",
            )}
            onKeyDown={handleKeyDown}
            onBlur={handleTriggerBlur}
            role="combobox"
            aria-expanded={isOpen}
            aria-controls={dropdownId}
            aria-invalid={error || props["aria-invalid"]}
            aria-describedby={props["aria-describedby"]}
            aria-required={required || props["aria-required"]}
            aria-disabled={disabled}
            tabIndex={disabled ? -1 : 0}
          >
            <div className="flex flex-1 items-center overflow-hidden">
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
                              className="flex h-3.5 w-3.5 items-center justify-center rounded-sm border-none bg-transparent p-0 text-[0.625rem] transition-opacity hover:opacity-70"
                              onClick={(e) => handleRemoveValue(option.value, e)}
                              aria-label={`Remove ${optionLabelText(option)}`}
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

            <div className="ml-2 flex items-center gap-1">
              {loading && <span className="text-xs">⏳</span>}
              {clearable && value.length > 0 && !disabled && !loading && (
                <button
                  type="button"
                  className="flex h-4 w-4 items-center justify-center rounded-sm border-none bg-transparent p-0 text-xs transition-opacity hover:opacity-70"
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
        </PopoverTrigger>

        {isOpen && (
          <PopoverContent
            id={dropdownId}
            align="start"
            sideOffset={4}
            className="w-full min-w-[var(--radix-popover-trigger-width)] p-0"
            onOpenAutoFocus={(event) => {
              event.preventDefault();
            }}
          >
            <Command
              shouldFilter={false}
              className="max-h-80"
              onKeyDown={handleKeyDown}
            >
              {searchable && (
                <CommandInput
                  id={searchInputId}
                  className={cn(INPUT_AUTOFILL_RESET_CLASSES)}
                  placeholder="Search..."
                  value={searchQuery}
                  onValueChange={(nextValue) => {
                    setSearchQuery(nextValue);
                    setFocusedIndex(0);
                  }}
                  aria-label="Search options"
                />
              )}

              {showSelectAll && filteredOptions.length > 0 && (
                <div className="flex gap-2 border-b border-input p-2">
                  <button
                    type="button"
                    className="flex-1 rounded border border-input bg-transparent px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleSelectAll}
                    disabled={disabled}
                  >
                    Select All
                  </button>
                  {value.length > 0 && (
                    <button
                      type="button"
                      className="flex-1 rounded border border-input bg-transparent px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={handleClearAll}
                      disabled={disabled}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}

              {isMaxReached && (
                <div className="border-b border-destructive bg-destructive/80 px-2 py-1 text-xs font-medium text-destructive-foreground">
                  Maximum {maxSelections} selection{maxSelections !== 1 ? "s" : ""}{" "}
                  reached
                </div>
              )}

              <CommandList role="listbox" aria-multiselectable="true">
                <CommandEmpty>No options found</CommandEmpty>

                {optionGroups.length > 0
                  ? optionGroups.map((group, groupIndex) => {
                      const groupOptions = group.options.filter((option) =>
                        filteredOptions.includes(option),
                      );
                      if (groupOptions.length === 0) return null;

                      return (
                        <CommandGroup
                          key={`${group.label}-${groupIndex}`}
                          heading={group.label}
                        >
                          {groupOptions.map((option) => {
                            const globalIndex = filteredOptions.indexOf(option);
                            const isSelected = value.includes(option.value);
                            const isFocused = globalIndex === focusedIndex;
                            const optionDisabled =
                              option.disabled || (isMaxReached && !isSelected);

                            return (
                              <div
                                key={option.value}
                                role="option"
                                aria-selected={isSelected}
                                aria-disabled={optionDisabled}
                                onMouseEnter={() => {
                                  setFocusedIndex(globalIndex);
                                }}
                                onClick={() => {
                                  if (!optionDisabled) {
                                    handleToggleOption(option.value);
                                  }
                                }}
                                className={cn(
                                  "relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent",
                                  isFocused && "bg-accent",
                                  isSelected && "bg-accent font-medium",
                                  optionDisabled &&
                                    "pointer-events-none opacity-50",
                                )}
                              >
                                <span className="text-base leading-none">
                                  {isSelected ? "☑" : "☐"}
                                </span>
                                <span className="flex-1">
                                  {renderOption
                                    ? renderOption(option)
                                    : option.label}
                                </span>
                              </div>
                            );
                          })}
                        </CommandGroup>
                      );
                    })
                  : filteredOptions.map((option, index) => {
                      const isSelected = value.includes(option.value);
                      const isFocused = index === focusedIndex;
                      const optionDisabled =
                        option.disabled || (isMaxReached && !isSelected);

                      return (
                        <div
                          key={option.value}
                          role="option"
                          aria-selected={isSelected}
                          aria-disabled={optionDisabled}
                          onMouseEnter={() => {
                            setFocusedIndex(index);
                          }}
                          onClick={() => {
                            if (!optionDisabled) {
                              handleToggleOption(option.value);
                            }
                          }}
                          className={cn(
                            "relative flex w-full cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent",
                            isFocused && "bg-accent",
                            isSelected && "bg-accent font-medium",
                            optionDisabled && "pointer-events-none opacity-50",
                          )}
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
              </CommandList>
            </Command>
          </PopoverContent>
        )}
      </Popover>
    </div>
  );
}

MultiSelect.displayName = "MultiSelect";
