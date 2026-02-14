# ShadCN Configuration for Dynamic Multi-Brand Theming

## ✅ Configuration Complete

The `components.json` and initial Input component have been configured to work with your dynamic styling system that serves thousands of client websites.

---

## 🎯 What Was Changed

### **1. components.json**

```json
{
  "tailwind": {
    "css": "",  // ✅ Removed globals.css reference
    "cssVariables": true,  // ✅ CRITICAL - enables dynamic theming
  },
  "iconLibrary": "lucide"  // ⚠️ Keep for now, replace icons manually
}
```

**Key Points:**
- ✅ **`css: ""`** - No globals.css file (you generate merged Tailwind payload server-side)
- ✅ **`cssVariables: true`** - CRITICAL for dynamic theming to work
- ✅ **Aliases correct** - Points to your src structure
- ⚠️ **Icon library** - Keep "lucide" in config, but replace icons with `<DynamicIcon name="lucide:icon-name" />` when installing components

### **2. Input Component**

**Before (ShadCN default):**
```tsx
// ❌ Hardcoded colors that break dynamic theming
"file:text-foreground placeholder:text-muted-foreground"
"selection:bg-primary selection:text-primary-foreground"
"dark:bg-input/30"
"dark:aria-invalid:ring-destructive/40"
```

**After (Dynamic theming ready):**
```tsx
// ✅ Only CSS variables that adapt to Section background
"border-input"                  // Adapts to theme
"ring-ring"                     // Adapts to theme
"ring-destructive"              // Adapts to theme
"bg-transparent"                // Inherits from parent
INPUT_AUTOFILL_RESET_CLASSES    // Prevents browser override
```

---

## 📋 Installation Workflow for Each Component

When installing any new ShadCN component, follow this process:

### **Step 1: Install Component**
```bash
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add textarea
# etc...
```

### **Step 2: Open Generated File**
```bash
# Example: /src/components/ui/button.tsx
```

### **Step 3: Remove Hardcoded Colors**

**Find and remove:**
- `text-foreground`
- `text-muted-foreground`
- `bg-muted`
- `bg-input`
- `bg-accent`
- `dark:*` (any dark mode specific color classes)

**Keep:**
- `border-input`
- `ring-ring`
- `ring-destructive`
- `border-destructive`
- `bg-transparent`
- `bg-primary` (only in explicitly branded elements like primary buttons)

### **Step 4: Add Autofill Reset (for inputs)**
```tsx
import { INPUT_AUTOFILL_RESET_CLASSES } from "../../lib/utils";

// In className:
INPUT_AUTOFILL_RESET_CLASSES,
```

### **Step 5: Replace Icons**
```tsx
// Before:
import { ChevronDown } from "lucide-react";
<ChevronDown className="h-4 w-4" />

// After:
import { DynamicIcon } from "@opensite/ui/components/ui/dynamic-icon";
<DynamicIcon name="lucide:chevron-down" className="h-4 w-4" />
```

### **Step 6: Test in Multiple Backgrounds**
```tsx
<Section background="dark"><YourComponent /></Section>
<Section background="white"><YourComponent /></Section>
<Section background="primary"><YourComponent /></Section>
```

---

## 🎨 Color Token Reference

### **✅ ALLOWED (Adapt Dynamically)**

| Token | Purpose | Example |
|-------|---------|---------|
| `border-input` | Input borders | `border border-input` |
| `ring-ring` | Focus rings | `ring-1 ring-ring` |
| `ring-destructive` | Error rings | `ring-1 ring-destructive` |
| `border-destructive` | Error borders | `border-destructive` |
| `bg-transparent` | Transparent bg | `bg-transparent` |
| `opacity-*` | Opacity utilities | `opacity-50` (no color) |

### **❌ FORBIDDEN (Break Dynamic Theming)**

| Token | Why | Replace With |
|-------|-----|--------------|
| `text-foreground` | Hardcoded text | Inherit from parent |
| `text-muted-foreground` | Hardcoded muted | Inherit + opacity |
| `bg-input` | Hardcoded bg | `bg-transparent` |
| `bg-muted` | Hardcoded bg | `bg-transparent` |
| `dark:bg-*` | Dark mode specific | Remove (CSS vars adapt) |
| `dark:text-*` | Dark mode specific | Remove (CSS vars adapt) |

---

## 📦 Components to Install

Based on your current form library, you'll need:

### **Core Form Components:**
```bash
pnpm dlx shadcn@latest add input      # ✅ Already done
pnpm dlx shadcn@latest add textarea
pnpm dlx shadcn@latest add label
pnpm dlx shadcn@latest add button
pnpm dlx shadcn@latest add checkbox
pnpm dlx shadcn@latest add radio-group
pnpm dlx shadcn@latest add select
pnpm dlx shadcn@latest add switch
```

### **Date/Time Components:**
```bash
pnpm dlx shadcn@latest add calendar
pnpm dlx shadcn@latest add date-picker
```

### **Advanced Components:**
```bash
pnpm dlx shadcn@latest add form        # Includes Zod validation support
pnpm dlx shadcn@latest add popover     # For dropdown menus
pnpm dlx shadcn@latest add command     # For searchable selects
pnpm dlx shadcn@latest add dialog      # For modals
```

---

## 🔧 Post-Install Checklist

For EACH installed component:

- [ ] Open generated file
- [ ] Remove `text-foreground`, `text-muted-foreground`
- [ ] Remove `bg-muted`, `bg-input`, `bg-accent`
- [ ] Remove ALL `dark:*` color classes
- [ ] Keep `border-input`, `ring-ring`, `ring-destructive`
- [ ] Keep `bg-transparent`
- [ ] Add `INPUT_AUTOFILL_RESET_CLASSES` (for inputs only)
- [ ] Replace Lucide icons with `<DynamicIcon name="lucide:icon-name" />`
- [ ] Test in dark Section
- [ ] Test in white Section
- [ ] Test in primary Section
- [ ] Verify no layout shifts
- [ ] Verify proper alignment in 2-column grids

---

## 🚀 Quick Start Example

Let's install Button component as an example:

```bash
# 1. Install
pnpm dlx shadcn@latest add button

# 2. Open file
# /src/components/ui/button.tsx

# 3. Find this line (example):
className={cn(
  "bg-primary text-primary-foreground shadow hover:bg-primary/90",  // ✅ Keep - primary is OK
  "text-muted-foreground hover:bg-accent hover:text-accent-foreground",  // ❌ Remove accent refs
  "dark:bg-input/30",  // ❌ Remove dark mode
  className,
)}

# 4. Replace with:
className={cn(
  "bg-primary text-primary-foreground shadow hover:bg-primary/90",  // ✅ Keep
  "hover:opacity-90",  // ✅ Use opacity instead of color for hover
  className,
)}

# 5. Replace icon imports:
// Before:
import { ArrowRight } from "lucide-react";
<ArrowRight className="h-4 w-4" />

// After:
import { DynamicIcon } from "@opensite/ui/components/ui/dynamic-icon";
<DynamicIcon name="lucide:arrow-right" className="h-4 w-4" />
```

---

## 📚 Reference Documents

- **SHADCN_INTEGRATION_GUIDE.md** - Complete component conversion guide
- **components.json** - ShadCN configuration file
- **Example:** `/src/components/ui/input.tsx` - Already converted for reference

---

## ⚠️ Critical Reminders

1. **CSS Variables = Dynamic Theming**
   - `cssVariables: true` in components.json is CRITICAL
   - Never disable this setting

2. **No Dark Mode Classes**
   - Don't use `dark:*` color classes
   - CSS variables adapt automatically via Section background

3. **Test in Multiple Backgrounds**
   - Dark section
   - White section
   - Primary section
   - Check layout alignment

4. **Icons = DynamicIcon**
   - Always replace Lucide imports
   - Use `<DynamicIcon name="lucide:icon-name" />`

5. **No Globals.css**
   - Keep `css: ""` in components.json
   - Your platform generates merged Tailwind payload server-side

---

## ✅ Summary

You're now configured to install ShadCN components that work seamlessly with your dynamic multi-brand theming system. Each new component will need manual color stripping, but the process is straightforward and documented in the integration guide.

The key is: **Only use CSS variables (`border-input`, `ring-ring`, etc.) that adapt automatically. Avoid hardcoded semantic colors.**
