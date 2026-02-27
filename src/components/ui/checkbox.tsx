"use client";

import * as React from "react";
import { Checkbox as CheckboxPrimitive } from "radix-ui";

import { cn } from "../../lib/utils";

/**
 * Checkbox component - Optimized for dynamic theming across thousands of client brands
 *
 * CRITICAL: Only uses CSS variables that adapt automatically - NO hardcoded semantic colors
 * See: SHADCN_INTEGRATION_GUIDE.md for full documentation
 */
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // Core structure - uses CSS variables
        "peer size-4 shrink-0 rounded-[4px] border border-input bg-transparent shadow-xs",
        "transition-shadow outline-none",

        // Checked state - uses primary CSS variables
        "data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        "data-[state=checked]:border-primary",

        // Focus state - uses ring-ring CSS variable
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

        // Error state - uses destructive CSS variables
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",

        " mt-1",

        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none"
      >
        {/* Simple check mark using CSS */}
        <svg
          className="size-3.5"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
