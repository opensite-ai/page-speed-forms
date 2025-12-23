# Styling Guide for @page-speed/forms

This guide explains how to style @page-speed/forms components to match any design system or brand identity.

## Table of Contents

- [Philosophy](#philosophy)
- [BEM Class Naming](#bem-class-naming)
- [Class Reference](#class-reference)
- [Styling Approaches](#styling-approaches)
- [Complete Examples](#complete-examples)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)

## Philosophy

@page-speed/forms is intentionally **unstyled** to provide maximum flexibility. The library:

- ✅ Provides semantic HTML structure
- ✅ Includes accessibility attributes (ARIA, roles)
- ✅ Uses predictable BEM class names as styling hooks
- ✅ Accepts `className` prop that merges with base classes
- ❌ Does NOT include any CSS by default
- ❌ Does NOT make assumptions about your design system

This means you have complete control over how forms look in your application.

## BEM Class Naming

All components use **BEM (Block Element Modifier)** naming convention:

```css
/* Block */
.text-input { }

/* Element */
.select-trigger { }
.select-dropdown { }

/* Modifier */
.text-input--error { }
.select-option--selected { }

/* State */
.select--open { }
.select--disabled { }
```

**Key points:**
- Base classes are always present (e.g., `.text-input`)
- Modifier classes are added conditionally (e.g., `.text-input--error`)
- Your custom `className` is merged with these base classes
- State classes reflect component state (e.g., `.select--open` when dropdown is visible)

## Class Reference

### TextInput

```css
.text-input                /* Base input */
.text-input--error         /* Error state */
```

### TextArea

```css
.textarea                  /* Base textarea */
.textarea--error           /* Error state */
```

### Select

```css
/* Container */
.select                    /* Base container */
.select--error             /* Error state */
.select--disabled          /* Disabled state */
.select--open              /* Dropdown open state */

/* Trigger button */
.select-trigger            /* Clickable trigger */
.select-value              /* Selected value display */
.select-placeholder        /* Placeholder text */
.select-icons              /* Icon container */
.select-arrow              /* Dropdown arrow */
.select-clear              /* Clear button */
.select-loading            /* Loading indicator */

/* Dropdown */
.select-dropdown           /* Dropdown container */
.select-search             /* Search input wrapper */
.select-search-input       /* Search input field */
.select-options            /* Options container */
.select-option             /* Individual option */
.select-option--focused    /* Keyboard focused option */
.select-option--selected   /* Selected option */
.select-option--disabled   /* Disabled option */
.select-no-options         /* Empty state message */
.select-optgroup           /* Option group container */
.select-optgroup-label     /* Option group label */
```

### MultiSelect

```css
/* Container */
.multi-select              /* Base container */
.multi-select--error       /* Error state */
.multi-select--disabled    /* Disabled state */

/* Trigger */
.multi-select-trigger      /* Clickable trigger */
.multi-select-values       /* Selected values container */
.multi-select-value-list   /* Value chip list */
.multi-select-value-chip   /* Individual value chip */
.multi-select-value-label  /* Chip text */
.multi-select-value-remove /* Chip remove button */
.multi-select-placeholder  /* Placeholder text */

/* Dropdown */
.multi-select-dropdown     /* Dropdown container */
.multi-select-option       /* Individual option */
.multi-select-option--focused   /* Keyboard focused option */
.multi-select-option--selected  /* Selected option */
.multi-select-option--disabled  /* Disabled option */
```

### Field (Wrapper)

```css
.field-label               /* Field label */
.field-required            /* Required asterisk */
.field-description         /* Description text */
.field-input               /* Input wrapper */
.field-error               /* Error message */
```

### Checkbox

```css
.checkbox                  /* Base checkbox */
.checkbox-input            /* Hidden input */
.checkbox-box              /* Visual checkbox */
.checkbox-icon             /* Checkmark icon */
.checkbox--checked         /* Checked state */
.checkbox--disabled        /* Disabled state */
.checkbox--error           /* Error state */
```

### Radio

```css
.radio                     /* Base radio */
.radio-input               /* Hidden input */
.radio-circle              /* Visual radio circle */
.radio-indicator           /* Selection dot */
.radio--checked            /* Selected state */
.radio--disabled           /* Disabled state */
.radio--error              /* Error state */
```

## Styling Approaches

### Approach 1: Vanilla CSS

Create a dedicated CSS file with your styles:

```css
/* forms.css */
.text-input {
  height: 2.25rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid #d1d5db;
  padding: 0.25rem 0.75rem;
  font-size: 1rem;
  transition: border-color 150ms;
}

.text-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.text-input--error {
  border-color: #ef4444;
}
```

Import in your app:

```tsx
import './forms.css';
```

### Approach 2: Tailwind CSS

**Option A: Using @apply**

```css
/* forms.css */
@layer components {
  .text-input {
    @apply h-9 w-full rounded-md border border-input bg-transparent px-3 py-1;
    @apply text-base shadow-sm transition-colors;
    @apply focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring;
    @apply disabled:cursor-not-allowed disabled:opacity-50;
  }

  .text-input--error {
    @apply border-red-500 ring-1 ring-red-500;
  }
}
```

**Option B: Using className prop**

```tsx
<TextInput
  name="email"
  className="h-9 w-full rounded-md border border-input px-3 py-1"
/>
```

### Approach 3: CSS Modules

```css
/* Input.module.css */
.textInput {
  height: 2.25rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid var(--input-border);
  padding: 0.25rem 0.75rem;
}

.textInput:focus {
  outline: none;
  border-color: var(--ring);
}

.error {
  border-color: var(--error);
}
```

```tsx
import styles from './Input.module.css';

<TextInput
  name="email"
  className={styles.textInput}
  error={meta.error && meta.touched}
/>
```

### Approach 4: CSS-in-JS

**styled-components:**

```tsx
import styled from 'styled-components';
import { TextInput } from '@page-speed/forms';

const StyledTextInput = styled(TextInput)`
  &.text-input {
    height: 2.25rem;
    width: 100%;
    border-radius: 0.375rem;
    border: 1px solid ${props => props.theme.colors.input};
    padding: 0.25rem 0.75rem;

    &:focus {
      outline: none;
      border-color: ${props => props.theme.colors.ring};
    }
  }

  &.text-input--error {
    border-color: ${props => props.theme.colors.error};
  }
`;
```

**Emotion:**

```tsx
import { css } from '@emotion/react';
import { TextInput } from '@page-speed/forms';

const inputStyles = css`
  &.text-input {
    height: 2.25rem;
    width: 100%;
    border-radius: 0.375rem;
    border: 1px solid var(--input);
    padding: 0.25rem 0.75rem;

    &:focus {
      outline: none;
      border-color: var(--ring);
    }
  }
`;

<TextInput name="email" className={inputStyles} />
```

## Complete Examples

### Example 1: shadcn/ui Design

This example replicates the shadcn/ui design system:

```css
/* forms.css */

/* TextInput */
.text-input {
  display: flex;
  height: 2.25rem;
  width: 100%;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--input));
  background-color: transparent;
  padding: 0.25rem 0.75rem;
  font-size: 1rem;
  line-height: 1.5rem;
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.text-input::placeholder {
  color: hsl(var(--muted-foreground));
}

.text-input:focus-visible {
  outline: none;
  ring: 1px;
  ring-color: hsl(var(--ring));
}

.text-input:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.text-input--error {
  border-color: rgb(239 68 68);
  ring: 1px;
  ring-color: rgb(239 68 68);
}

/* Select */
.select {
  position: relative;
  width: 100%;
}

.select-trigger {
  display: flex;
  height: 2.25rem;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--input));
  background-color: transparent;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 150ms cubic-bezier(0.4, 0, 0.2, 1);
}

.select-trigger:hover {
  background-color: hsl(var(--accent));
}

.select-trigger:focus-visible {
  outline: none;
  ring: 1px;
  ring-color: hsl(var(--ring));
}

.select-dropdown {
  position: absolute;
  z-index: 50;
  top: 100%;
  margin-top: 0.25rem;
  min-width: 100%;
  border-radius: 0.375rem;
  border: 1px solid hsl(var(--border));
  background-color: hsl(var(--popover));
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}

.select-option {
  display: flex;
  width: 100%;
  cursor: pointer;
  align-items: center;
  border-radius: 0.25rem;
  padding: 0.375rem 0.5rem 0.375rem 2rem;
  font-size: 0.875rem;
  transition: all 150ms;
}

.select-option:hover {
  background-color: hsl(var(--accent));
}

.select-option--selected {
  font-weight: 500;
  background-color: hsl(var(--accent));
}

/* Field */
.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.field-required {
  color: rgb(239 68 68);
  margin-left: 0.125rem;
}

.field-error {
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(239 68 68);
  margin-top: 0.5rem;
}
```

Define CSS custom properties in your globals.css:

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --border: 214.3 31.8% 91.4%;
  --accent: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --popover: 0 0% 100%;
}
```

### Example 2: Material Design

```css
/* forms-material.css */

.text-input {
  height: 56px;
  width: 100%;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.42);
  border-radius: 4px 4px 0 0;
  background-color: rgba(0, 0, 0, 0.04);
  padding: 20px 16px 6px;
  font-size: 1rem;
  font-family: 'Roboto', sans-serif;
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.text-input:hover {
  background-color: rgba(0, 0, 0, 0.08);
  border-bottom-color: rgba(0, 0, 0, 0.87);
}

.text-input:focus {
  outline: none;
  border-bottom: 2px solid #1976d2;
  background-color: rgba(0, 0, 0, 0.06);
}

.text-input--error {
  border-bottom-color: #d32f2f;
}

.field-label {
  font-family: 'Roboto', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.08333em;
  margin-bottom: 4px;
}

.field-error {
  font-family: 'Roboto', sans-serif;
  font-size: 0.75rem;
  color: #d32f2f;
  margin-top: 4px;
}
```

### Example 3: Custom Brand

```css
/* forms-brand.css */

:root {
  --brand-primary: #6366f1;
  --brand-primary-dark: #4f46e5;
  --brand-text: #1e293b;
  --brand-border: #cbd5e1;
  --brand-error: #ef4444;
  --brand-radius: 12px;
}

.text-input {
  height: 48px;
  width: 100%;
  border-radius: var(--brand-radius);
  border: 2px solid var(--brand-border);
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 500;
  color: var(--brand-text);
  background: white;
  transition: all 200ms ease;
}

.text-input:focus {
  outline: none;
  border-color: var(--brand-primary);
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.1);
}

.text-input--error {
  border-color: var(--brand-error);
}

.text-input--error:focus {
  box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
}

.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--brand-text);
  margin-bottom: 8px;
  letter-spacing: -0.01em;
}

.field-error {
  font-size: 13px;
  font-weight: 500;
  color: var(--brand-error);
  margin-top: 6px;
}

.select-trigger {
  height: 48px;
  border-radius: var(--brand-radius);
  border: 2px solid var(--brand-border);
  padding: 12px 16px;
  font-weight: 500;
  transition: all 200ms ease;
}

.select-trigger:hover {
  border-color: var(--brand-primary);
}

.select-dropdown {
  border-radius: var(--brand-radius);
  border: 2px solid var(--brand-border);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

.select-option {
  padding: 12px 16px;
  font-weight: 500;
  border-radius: 8px;
  margin: 4px;
}

.select-option--selected {
  background-color: var(--brand-primary);
  color: white;
}
```

## Best Practices

### 1. Centralize Your Styles

Keep all form styles in one place for consistency:

```
src/
  styles/
    forms.css         # All form component styles
    variables.css     # CSS custom properties
```

### 2. Use CSS Custom Properties

Define design tokens for easy theming:

```css
:root {
  /* Colors */
  --form-text: #1e293b;
  --form-border: #cbd5e1;
  --form-focus: #3b82f6;
  --form-error: #ef4444;

  /* Spacing */
  --form-padding-x: 0.75rem;
  --form-padding-y: 0.5rem;
  --form-gap: 1rem;

  /* Typography */
  --form-font-size: 1rem;
  --form-label-size: 0.875rem;

  /* Effects */
  --form-radius: 0.375rem;
  --form-transition: 150ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

### 3. Leverage the className Prop

Add component-specific styles using the `className` prop:

```tsx
<TextInput
  name="email"
  className="font-mono tracking-wide"
/>

<Select
  name="country"
  className="w-full md:w-1/2"
/>
```

### 4. Style Error States Consistently

Always style the error modifier classes:

```css
.text-input--error,
.textarea--error,
.select--error .select-trigger {
  border-color: var(--form-error);
}
```

### 5. Support Dark Mode

Use CSS custom properties that change with theme:

```css
:root {
  --form-bg: #ffffff;
  --form-text: #000000;
}

[data-theme="dark"] {
  --form-bg: #1e293b;
  --form-text: #f1f5f9;
}

.text-input {
  background-color: var(--form-bg);
  color: var(--form-text);
}
```

### 6. Maintain Focus States

Always provide visible focus indicators:

```css
.text-input:focus-visible,
.select-trigger:focus-visible {
  outline: 2px solid var(--form-focus);
  outline-offset: 2px;
}
```

### 7. Consider Dropdown Positioning

Account for Select dropdown positioning:

```css
.select-dropdown {
  position: absolute;
  z-index: 50; /* Ensure it appears above other content */
  top: 100%;
  margin-top: 0.25rem;
  min-width: 100%; /* Match trigger width minimum */
}
```

### 8. Test All States

Ensure you style all component states:

- Default
- Hover
- Focus
- Active
- Disabled
- Error
- Loading (for Select)

## Common Patterns

### Floating Labels

```css
.field-floating {
  position: relative;
}

.field-floating .field-label {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  transition: all 150ms;
  pointer-events: none;
}

.field-floating .text-input:focus ~ .field-label,
.field-floating .text-input:not(:placeholder-shown) ~ .field-label {
  top: 0;
  font-size: 0.75rem;
  background: white;
  padding: 0 0.25rem;
}
```

### Input Groups

```css
.input-group {
  display: flex;
  gap: 0;
}

.input-group .text-input {
  border-radius: 0;
}

.input-group .text-input:first-child {
  border-top-left-radius: 0.375rem;
  border-bottom-left-radius: 0.375rem;
}

.input-group .text-input:last-child {
  border-top-right-radius: 0.375rem;
  border-bottom-right-radius: 0.375rem;
}
```

### Inline Forms

```css
.form-inline {
  display: flex;
  align-items: flex-end;
  gap: 1rem;
}

.form-inline .field-label {
  margin-bottom: 0.25rem;
}
```

### Compact Forms

```css
.text-input--compact {
  height: 2rem;
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
}

.field-label--compact {
  font-size: 0.75rem;
  margin-bottom: 0.25rem;
}
```

### Animated Transitions

```css
.text-input {
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

.select-dropdown {
  animation: slideDown 150ms ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

---

## Need Help?

- **Examples:** See the `/prototypes/client-cli-select/app/forms.css` file for a complete working example
- **Issues:** Report styling issues at [GitHub Issues](https://github.com/opensite-ai/page-speed-forms/issues)
- **Questions:** Ask questions in [GitHub Discussions](https://github.com/opensite-ai/page-speed-forms/discussions)

## Contributing

Found a styling pattern that would benefit others? Consider contributing it to this guide! See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.
