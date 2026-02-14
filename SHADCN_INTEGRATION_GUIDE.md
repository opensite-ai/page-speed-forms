# ShadCN Integration Guide for @page-speed/forms

## 🎯 Dynamic Styling Requirements

This form library serves **thousands of website clients** with dynamic, brand-specific styling. Form components must automatically adapt to their parent Section's background without hardcoded colors.

### ✅ How Dynamic Styling Works

```tsx
// Section component sets theme via background classes
<Section background="dark">  {/* bg-foreground text-background */}
  <ContactForm />  {/* Forms inherit and adapt automatically */}
</Section>

<Section background="white">  {/* bg-white text-dark */}
  <ContactForm />  {/* Same form, different colors - no changes needed */}
</Section>
```

**CSS Variables Adapt Automatically:**
- `border-input` - Adapts to light/dark background
- `ring-ring` - Adapts to light/dark background
- `ring-destructive` - Adapts for error states
- `bg-transparent` - Inherits parent background

---

## 🚫 What to AVOID in ShadCN Components

### **Hardcoded Semantic Colors:**
```typescript
// ❌ BAD - These break dynamic theming:
"text-foreground"                    // Hardcoded text color
"text-muted-foreground"              // Hardcoded muted text
"bg-input"                           // Hardcoded background
"bg-muted"                           // Hardcoded background
"dark:bg-input/30"                   // Dark mode specific classes
"dark:ring-destructive/40"           // Dark mode specific classes
```

### **What's OK to Use:**
```typescript
// ✅ GOOD - These adapt via CSS variables:
"border-input"                       // Uses CSS variable
"ring-ring"                          // Uses CSS variable
"ring-destructive"                   // Uses CSS variable (errors)
"bg-transparent"                     // Inherits from parent
"opacity-50"                         // Opacity utilities (no color)
"disabled:cursor-not-allowed"        // State utilities (no color)
```

---

## 📋 Component Conversion Checklist

When installing a new ShadCN component, follow these steps:

### **1. Install Component**
```bash
pnpm dlx shadcn@latest add [component-name]
```

### **2. Remove Hardcoded Colors**

**Original ShadCN Input:**
```tsx
className={cn(
  "file:text-foreground placeholder:text-muted-foreground",  // ❌ Remove
  "selection:bg-primary selection:text-primary-foreground",   // ❌ Remove
  "dark:bg-input/30",                                         // ❌ Remove
  "dark:aria-invalid:ring-destructive/40",                   // ❌ Remove
  "border-input h-9 w-full rounded-md border",               // ✅ Keep
  "bg-transparent px-3 py-1",                                 // ✅ Keep
  "focus-visible:ring-ring focus-visible:ring-1",            // ✅ Keep
  "aria-invalid:border-destructive",                         // ✅ Keep
)}
```

**Converted for Dynamic Styling:**
```tsx
className={cn(
  // Core structure (no hardcoded colors)
  "border-input h-9 w-full rounded-md border",
  "bg-transparent px-3 py-1 text-base shadow-sm",
  "transition-colors md:text-sm",

  // Focus states (uses CSS variables)
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",

  // Error states (uses CSS variables)
  "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive",

  // Disabled states (no color, just utilities)
  "disabled:cursor-not-allowed disabled:opacity-50",

  // Autofill reset (prevents browser styles)
  INPUT_AUTOFILL_RESET_CLASSES,
)}
```

### **3. Replace Icons**

**Original:**
```tsx
import { ArrowUpRight } from "lucide-react";

<ArrowUpRight className="h-4 w-4" />
```

**Converted:**
```tsx
import { DynamicIcon } from "@opensite/ui/components/ui/dynamic-icon";

<DynamicIcon name="lucide:arrow-up-right" className="h-4 w-4" />
```

### **4. Remove Dark Mode Classes**

```tsx
// ❌ Remove all dark: prefixed color classes
"dark:bg-input/30"
"dark:text-foreground"
"dark:border-input"

// ✅ CSS variables adapt automatically - no dark mode classes needed
```

---

## 🎨 Color Token Reference

### **Allowed CSS Variables (Adapt to Theme):**

| Variable | Usage | Example |
|----------|-------|---------|
| `border-input` | Input borders | `border border-input` |
| `ring-ring` | Focus rings | `ring-1 ring-ring` |
| `ring-destructive` | Error rings | `ring-1 ring-destructive` |
| `border-destructive` | Error borders | `border-destructive` |
| `bg-transparent` | Transparent bg | `bg-transparent` |

### **Forbidden (Hardcoded Colors):**

| Variable | Why Forbidden | Replace With |
|----------|---------------|--------------|
| `text-foreground` | Hardcoded text color | Use inherited color |
| `text-muted-foreground` | Hardcoded muted text | Use inherited color + opacity |
| `bg-input` | Hardcoded background | `bg-transparent` |
| `bg-muted` | Hardcoded background | `bg-transparent` |
| `bg-primary` | Hardcoded primary bg | Only in specific branded elements |
| `dark:*` | Dark mode specific | Let CSS variables adapt |

---

## 📦 Component Conversion Examples

### **Input Component**

```tsx
import * as React from "react";
import { cn, INPUT_AUTOFILL_RESET_CLASSES } from "@/src/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        // Core structure - no hardcoded colors
        "flex h-9 w-full rounded-md border border-input",
        "bg-transparent px-3 py-1 text-base shadow-sm",
        "transition-colors md:text-sm",

        // Focus state - uses CSS variable
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",

        // Error state - uses CSS variable
        "aria-invalid:border-destructive aria-invalid:ring-1 aria-invalid:ring-destructive",

        // Disabled state - no color
        "disabled:cursor-not-allowed disabled:opacity-50",

        // Autofill reset
        INPUT_AUTOFILL_RESET_CLASSES,

        className,
      )}
      {...props}
    />
  );
}

export { Input };
```

### **Label Component**

```tsx
import * as React from "react";
import { cn } from "@/src/lib/utils";

const Label = React.forwardRef<
  HTMLLabelElement,
  React.ComponentProps<"label">
>(({ className, ...props }, ref) => (
  <label
    ref={ref}
    className={cn(
      // No hardcoded text colors - inherits from parent
      "text-sm font-medium leading-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
      className,
    )}
    {...props}
  />
));

Label.displayName = "Label";

export { Label };
```

### **Button Component**

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/src/lib/utils";

const buttonVariants = cva(
  // Base styles - minimal hardcoded colors
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // ✅ Primary uses CSS variable
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",

        // ✅ Destructive uses CSS variable
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",

        // ✅ Outline uses CSS variable
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",

        // ✅ Ghost inherits colors
        ghost: "hover:bg-accent hover:text-accent-foreground",

        // ✅ Link inherits colors
        link: "underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// ... rest of component
```

---

## 🔧 Utility Reference

### **INPUT_AUTOFILL_RESET_CLASSES**

```typescript
// Prevents browser autofill from overriding our styles
export const INPUT_AUTOFILL_RESET_CLASSES = [
  "autofill:shadow-[inset_0_0_0px_1000px_transparent]",
  "autofill:[-webkit-text-fill-color:inherit]",
].join(" ");
```

---

## 🚀 Installation Workflow

```bash
# 1. Install component
pnpm dlx shadcn@latest add input

# 2. Open generated file
# /src/components/ui/input.tsx

# 3. Remove hardcoded colors:
#    - Remove: file:text-foreground
#    - Remove: placeholder:text-muted-foreground
#    - Remove: selection:bg-primary
#    - Remove: dark:bg-input/30
#    - Remove: dark:aria-invalid:ring-destructive/40

# 4. Keep CSS variable classes:
#    - Keep: border-input
#    - Keep: ring-ring
#    - Keep: ring-destructive
#    - Keep: border-destructive

# 5. Add autofill reset if needed:
#    - Import: INPUT_AUTOFILL_RESET_CLASSES
#    - Add to className

# 6. Replace icons with DynamicIcon:
#    - Replace: <ChevronDown />
#    - With: <DynamicIcon name="lucide:chevron-down" />

# 7. Test in both light and dark sections
```

---

## ✅ Testing Checklist

For each converted component, test in multiple Section backgrounds:

```tsx
// Test 1: Dark background
<Section background="dark">
  <YourComponent />
</Section>

// Test 2: White background
<Section background="white">
  <YourComponent />
</Section>

// Test 3: Primary background
<Section background="primary">
  <YourComponent />
</Section>

// Test 4: Muted background
<Section background="muted">
  <YourComponent />
</Section>
```

**Verify:**
- ✅ Text is readable on all backgrounds
- ✅ Borders are visible on all backgrounds
- ✅ Focus rings are visible on all backgrounds
- ✅ Error states are visible on all backgrounds
- ✅ No layout shifts or misalignments
- ✅ Form columns align properly

---

## 📝 Quick Reference

### **Pattern to Match (From Working TextInput):**

```tsx
const combinedClassName = cn(
  // Structure
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors",

  // Focus
  "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",

  // Disabled
  "disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",

  // Autofill reset
  INPUT_AUTOFILL_RESET_CLASSES,

  // Dynamic value ring
  !error && hasValue && "ring-2 ring-ring",

  // Error state
  error && "border-destructive ring-1 ring-destructive",

  // User classes
  className,
);
```

This pattern works perfectly with the dynamic styling system and should be the template for all form components.
