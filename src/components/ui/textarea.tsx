import * as React from "react"

import { cn } from "../../lib/utils"

/**
 * Textarea component - Optimized for dynamic theming across thousands of client brands
 *
 * CRITICAL: Only uses CSS variables that adapt automatically - NO hardcoded semantic colors
 * See: SHADCN_INTEGRATION_GUIDE.md for full documentation
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // Core structure - uses CSS variables only
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input",
        "bg-transparent px-3 py-2 text-base shadow-xs",
        "transition-[color,box-shadow] outline-none md:text-sm",

        // Focus state - uses ring-ring CSS variable
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

        // Error state - uses destructive CSS variables
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",

        className
      )}
      {...props}
    />
  )
}

export { Textarea }
