"use client";

import * as React from "react";
import type { InputProps } from "../core/types";
import {
  Select as SelectPrimitive,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { cn } from "../lib/utils";

/**
 * Select option type
 */
export interface SelectOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

/**
 * Select option group type
 */
export interface SelectOptionGroup {
  label: string;
  options: SelectOption[];
}

/**
 * Additional props specific to Select
 */
export interface SelectProps extends Omit<
  InputProps<string>,
  "onChange" | "onFocus"
> {
  onChange: (value: string) => void;
  onFocus?: () => void;
  options?: SelectOption[];
  optionGroups?: SelectOptionGroup[];
  placeholder?: string;
  renderOption?: (option: SelectOption) => React.ReactNode;
  [key: string]: any;
}

/**
 * Select - High-performance dropdown selection component (ShadCN-based)
 *
 * Built on ShadCN Select with form-specific behavior:
 * - Error state handling
 * - Valid value indicator (ring-2)
 * - Form integration (onChange, onBlur)
 * - Option groups support
 * - Full accessibility support
 *
 * NOTE: This is a simplified refactored version. For advanced features like
 * search, clearable, and loading states, use the Command component or MultiSelect.
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
 *   error={!!form.errors.country}
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
  options = [],
  optionGroups = [],
  renderOption,
  ...props
}: SelectProps) {
  const [hasInteracted, setHasInteracted] = React.useState(false);

  // Flatten options from groups or use flat options
  const allOptions = React.useMemo(() => {
    if (optionGroups.length > 0) {
      return optionGroups.flatMap((group) => group.options);
    }
    return options;
  }, [options, optionGroups]);

  const hasValue = Boolean(value);

  const handleValueChange = (newValue: string) => {
    onChange(newValue);
  };

  const handleOpenChange = (open: boolean) => {
    if (open) {
      // Mark as interacted when dropdown opens
      if (!hasInteracted) {
        setHasInteracted(true);
      }
      onFocus?.();
    } else if (hasInteracted) {
      // Only trigger onBlur validation if user has interacted
      onBlur?.();
    }
  };

  return (
    <SelectPrimitive
      name={name}
      value={value}
      onValueChange={handleValueChange}
      onOpenChange={handleOpenChange}
      disabled={disabled}
      required={required}
    >
      <SelectTrigger
        className={cn(
          // Valid value indicator - ring-2 when has value and no error
          !error && hasValue && "ring-2 ring-ring",
          // Error state - handled by SelectTrigger via aria-invalid
          className,
        )}
        aria-invalid={error || props["aria-invalid"]}
        aria-describedby={props["aria-describedby"]}
        aria-required={required || props["aria-required"]}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {optionGroups.length > 0 ? (
          // Render grouped options
          optionGroups.map((group, groupIndex) => (
            <SelectGroup key={groupIndex}>
              <SelectLabel>{group.label}</SelectLabel>
              {group.options.map((option) => (
                <SelectItem
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {renderOption ? renderOption(option) : option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          ))
        ) : (
          // Render flat options
          allOptions.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {renderOption ? renderOption(option) : option.label}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </SelectPrimitive>
  );
}

Select.displayName = "Select";
