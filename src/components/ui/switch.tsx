"use client"

import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "../../lib/utils"

/**
 * Switch component - Optimized for dynamic theming across thousands of client brands
 *
 * CRITICAL: Only uses CSS variables that adapt automatically - NO hardcoded semantic colors
 * See: SHADCN_INTEGRATION_GUIDE.md for full documentation
 */
function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        // Core structure - uses CSS variables
        "peer group/switch inline-flex shrink-0 items-center rounded-full",
        "border border-transparent shadow-xs transition-all outline-none",

        // State-based backgrounds - use CSS variables
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",

        // Focus state
        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",

        // Disabled state
        "disabled:cursor-not-allowed disabled:opacity-50",

        // Size variants
        "data-[size=default]:h-[1.15rem] data-[size=default]:w-8",
        "data-[size=sm]:h-3.5 data-[size=sm]:w-6",

        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          // Thumb appearance - inherits from parent theme
          "bg-background pointer-events-none block rounded-full ring-0 transition-transform",

          // Size variants
          "group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",

          // Position based on state
          "data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
