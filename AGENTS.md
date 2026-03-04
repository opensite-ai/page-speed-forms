# AGENTS.md – Instructions for AI coding agents working on `@page-speed/forms`

These instructions are specific to this repository. Follow them exactly when making changes.

## 1. Mandatory React Import Rule for `.tsx`

This repo uses `"jsx": "react"` in `tsconfig.json`.

For any **source** `.tsx` file under `src/`:
- Always include `import * as React from "react";`
- Do not replace it with no import
- Do not rely on automatic JSX runtime assumptions

If editing an existing `.tsx` source file that does not follow this, normalize it.

Quick audit command:

```bash
for f in $(rg --files src -g '*.tsx' -g '!**/__tests__/**'); do
  rg -q '^import \* as React from "react";' "$f" || echo "$f"
done
```

## 2. FormEngine as Primary Entry Point

`FormEngine` (`src/integration/FormEngine.tsx`) is the **recommended entry point** for form implementations.

### When to use FormEngine

- Any standard form with fields, validation, and API submission
- Contact forms, signup forms, registration flows
- Forms with file uploads
- Forms needing multi-column layouts

### FormEngine capabilities

- Declarative field configuration via `FormFieldConfig[]`
- Built-in API integration via `useContactForm`
- File upload handling via `useFileUpload`
- Two layout modes: `standard` (grid) and `button-group` (inline)
- Style customization via `FormEngineStyleRules`
- Success/error callbacks and messages

### FormEngine prop patterns

```tsx
// Direct props
<FormEngine
  api={{ endpoint: "/api/contact", method: "post" }}
  fields={fields}
  formLayoutSettings={{ submitButtonSetup: { submitLabel: "Send" } }}
/>

// Wrapper setup (for block libraries)
<FormEngine
  formEngineSetup={setup}
  defaultFields={fallbackFields}
  defaultStyleRules={fallbackStyleRules}
/>
```

### When to use lower-level APIs

Only use `useForm`, `Form`, and `Field` directly when:
- Building custom form UX not supported by FormEngine
- Integrating with non-standard submission flows
- Implementing render-prop patterns for complex field interactions

## 3. Styling System (Current State)

This package is **not** BEM-unstyled anymore.

Current styling is Tailwind utility based with semantic tokens (ShadCN-style):
- Inputs and triggers use classes such as `border-input`, `bg-transparent`, `ring-ring`, `bg-muted`, `bg-primary`
- Components use the shared `cn(...)` helper (`clsx` + `tailwind-merge`)
- Text-like controls use `INPUT_AUTOFILL_RESET_CLASSES` to normalize browser autofill

Do not introduce hard-coded color assumptions that break token-driven theming.

## 4. Value / Selection UX Standards

### Text-like controls
For `TextInput`, `TextArea`, `Select`, `MultiSelect`, `DatePicker`, `DateRangePicker`, `TimePicker`, and `RichTextEditor`:
- Base: transparent background input shell
- Value present: `ring-2 ring-primary` (when not error)
- Error: `ring-2 ring-destructive`

### Dropdown/calendar internals
- Selected items inside menus commonly use `bg-muted`
- `DateRangePicker` range endpoints use `bg-primary text-primary-foreground`
- In-range dates use muted background

### Exceptions (do not force the generic ring/bg-muted model)
- `Checkbox`
- `Radio`
- `CheckboxGroup`
- `FileInput`

## 5. Dropdown/Popover Behavior

All dropdown/popover/calendar components must close on outside click.

Use `useOnClickOutside` from `@opensite/hooks/useOnClickOutside` for:
- `Select`
- `MultiSelect`
- `DatePicker`
- `DateRangePicker`

## 6. Shared UI Primitives

Prefer shared primitives over duplicating label/error markup:
- `src/core/label-group.tsx`
- `src/core/field-feedback.tsx`

When adding/updating fields, reuse these components where applicable.

## 7. Architecture and Exports

- Preserve tree-shakable entrypoints (`index`, `core`, `inputs`, `validation`, `upload`, `integration`)
- Do not hand-edit `package.json` exports unless explicitly required
- If adding a new entrypoint, update `tsup.config.ts` and verify output types

### Key integration exports

From `@page-speed/forms/integration`:
- `FormEngine` — main declarative form component
- `FormEngineSetup`, `FormEngineProps` — prop types
- `FormFieldConfig` — field configuration type
- `FormEngineStyleRules`, `FormEngineLayoutSettings` — styling/layout types
- `DynamicFormField` — renders a single field based on config
- `useContactForm` — form state and submission hook
- `useFileUpload` — file upload state management

## 8. Validation and State

- `useForm` is built on `@legendapp/state/react`
- Preserve async validation behavior and race-condition protections
- Keep validator signatures compatible: `(value, allValues)`

## 9. Test and Build Requirements

Before finishing code changes:

```bash
pnpm test:ci
pnpm build
```

If changing validation internals or public APIs, also run:

```bash
pnpm type-check
```

## 10. Documentation Expectations

When behavior changes, update:
- `README.md`
- `docs/STYLES.md`
- this `AGENTS.md` (if implementation rules changed)

Docs must match real implementation details (props, styling model, and UX behavior).

### Example documentation location

- Basic usage examples: `examples/basic-usage.tsx`
- File upload patterns: `docs/FILE_UPLOADS.md`
- Styling reference: `docs/STYLES.md`
