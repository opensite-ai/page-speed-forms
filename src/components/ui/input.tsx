import * as React from "react";
import { cn } from "../../lib/utils";
import { INPUT_AUTOFILL_RESET_CLASSES } from "../../lib/utils";

/**
 * Input component - Optimized for dynamic theming across thousands of client brands
 *
 * CRITICAL: This component must work with dynamic Section backgrounds (light/dark/primary/etc)
 * Only uses CSS variables that adapt automatically - NO hardcoded semantic colors
 *
 * See: SHADCN_INTEGRATION_GUIDE.md for full documentation
 */
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          // Core structure - no hardcoded colors, uses CSS variables
          "flex h-9 w-full min-w-0 rounded-md border border-input",
          "bg-transparent px-3 py-1 text-base shadow-sm",
          "transition-colors outline-none md:text-sm",

          // Focus state - uses ring-ring CSS variable (adapts to theme)
          "focus-visible:ring-1 focus-visible:ring-ring",

          // Error state - uses destructive CSS variables (adapts to theme)
          "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive",

          // Disabled state - no color hardcoding
          "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",

          // File input specific - inherits text color from parent
          "file:inline-flex file:h-7 file:border-0 file:bg-transparent",
          "file:text-sm file:font-medium",

          // Autofill reset - prevents browser from overriding our dynamic colors
          INPUT_AUTOFILL_RESET_CLASSES,

          className,
        )}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
