import * as React from "react"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"

/**
 * RadioGroup components - Optimized for dynamic theming across thousands of client brands
 *
 * CRITICAL: Only uses CSS variables that adapt automatically - NO hardcoded semantic colors
 * See: SHADCN_INTEGRATION_GUIDE.md for full documentation
 */
function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        // Core structure - uses CSS variables
        "aspect-square size-4 shrink-0 rounded-full border border-input bg-transparent shadow-xs",
        "text-primary transition-[color,box-shadow] outline-none",

        // Focus state - uses ring-ring CSS variable
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

        // Error state - uses destructive CSS variables
        "aria-invalid:border-destructive aria-invalid:ring-destructive/20",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",

        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        {/* Simple filled circle indicator */}
        <svg
          className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2"
          viewBox="0 0 24 24"
        >
          <circle cx="12" cy="12" r="12" />
        </svg>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
