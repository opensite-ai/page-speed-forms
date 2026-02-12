# Styling Guide for `@page-speed/forms`

This package now ships with **Tailwind utility classes** and semantic color tokens (ShadCN-style), not BEM-only unstyled primitives.

## Styling Model

Components are styled with Tailwind class names such as:
- `bg-transparent`, `border-input`, `text-foreground`
- `ring-ring`, `bg-muted`, `bg-primary`, `text-primary-foreground`
- `bg-popover`, `text-popover-foreground`, `border-border`

The package relies on your app's theme tokens (usually via CSS variables mapped to Tailwind semantic tokens).

## Required Theme Tokens

Ensure your app defines semantic tokens used by this library:

- `background`
- `foreground`
- `border`
- `input`
- `ring`
- `primary`
- `primary-foreground`
- `muted`
- `muted-foreground`
- `destructive`
- `destructive-foreground`
- `popover`
- `popover-foreground`
- `card`
- `card-foreground`

If your design system already uses ShadCN-style token variables, no additional setup is typically needed.

## Component Style Behavior

### Base text-style controls
`TextInput`, `TextArea`, `Select`, `MultiSelect`, `DatePicker`, `DateRangePicker`, `TimePicker`, and `RichTextEditor` all follow the same baseline input shell:

- `border border-input`
- `bg-transparent`
- focus state: `focus-visible:ring-1 focus-visible:ring-ring`
- disabled state: `disabled:opacity-50 disabled:cursor-not-allowed`

### Value-present indicator
For the controls above, when a field has a value and no error:
- `ring-2 ring-ring`

### Error state
When `error` is true:
- `border-destructive ring-1 ring-destructive`

### Dropdown and calendar selection states
- Select-like menu options use `bg-muted` for selected rows.
- `DatePicker` selected day uses `bg-muted font-semibold`.
- `DateRangePicker` endpoints use `bg-primary text-primary-foreground font-semibold`.
- `DateRangePicker` in-range days use `bg-muted`.

### Important exceptions
Do **not** apply the generic text-input value-ring selection model to:
- `Checkbox`
- `Radio`
- `CheckboxGroup`
- `FileInput`

Those components have their own interaction patterns (choice-card ring behavior, indicator states, upload-state UI).

## Autofill Overrides

The package provides `INPUT_AUTOFILL_RESET_CLASSES` in `src/utils.ts` and applies it to applicable text-like fields.

This normalizes browser autofill visuals to match your tokenized theme and prevents hard-coded browser autofill backgrounds from breaking contrast.

## Extending Styles Safely

Use `className` for additive customization, and always merge with `cn(...)` in component implementations.

```tsx
className={cn(
  "flex h-9 w-full rounded-md border border-input bg-transparent",
  hasValue && "ring-2 ring-ring",
  error && "border-destructive ring-1 ring-destructive",
  className,
)}
```

## Popover Close UX Requirement

Any input with a dropdown/popover/calendar must close on outside click. Use:
- `useOnClickOutside` from `@opensite/hooks/useOnClickOutside`

Applied components include:
- `Select`
- `MultiSelect`
- `DatePicker`
- `DateRangePicker`

## Migration Notes

If you previously styled this package using BEM hooks from older docs:
- Remove legacy `.text-input`, `.select-trigger`, etc. assumptions.
- Move to token-driven Tailwind styles.
- Prefer semantic token updates over component-level hard-coded colors.

This keeps forms compatible with dynamic theming and block-level background overrides.
