![Page Speed React Forms](https://octane.cdn.ing/api/v1/images/transform?url=https://cdn.ing/assets/i/r/286339/nwqgw37pigfluhcmmjmpql3yj9y4/github.png&q=90)

# `@page-speed/forms`

Type-safe, high-performance React form state and input components for OpenSite/DashTrack workloads.

[![npm version](https://img.shields.io/npm/v/@page-speed/forms?style=flat-square)](https://www.npmjs.com/package/@page-speed/forms)
[![npm downloads](https://img.shields.io/npm/dm/@page-speed/forms?style=flat-square)](https://www.npmjs.com/package/@page-speed/forms)
[![License](https://img.shields.io/npm/l/@page-speed/forms?style=flat-square)](./LICENSE)

## Highlights

- Field-level reactivity via `@legendapp/state/react`
- Typed `useForm` and `useField` APIs
- Built-in input library (text, select, date, time, upload, rich text)
- Tree-shakable subpath exports (`/core`, `/inputs`, `/validation`, `/upload`, `/integration`)
- Validation rules and utilities (sync + async)
- Valibot adapter in a separate entrypoint (`/validation/valibot`)
- Tailwind token-based default UI aligned with ShadCN interaction patterns

## Installation

```bash
pnpm add @page-speed/forms
# or
npm install @page-speed/forms
```

Peer dependencies:
- `react >= 16.8.0`
- `react-dom >= 16.8.0`

## Quick Start

```tsx
import * as React from "react";
import { Form, Field, useForm } from "@page-speed/forms";
import { TextInput, Select } from "@page-speed/forms/inputs";
import { required, email } from "@page-speed/forms/validation/rules";

export function ContactForm() {
  const form = useForm({
    initialValues: {
      fullName: "",
      email: "",
      inquiryType: "",
    },
    validationSchema: {
      fullName: required(),
      email: [required(), email()],
      inquiryType: required(),
    },
    onSubmit: async (values) => {
      console.log(values);
    },
  });

  return (
    <Form form={form}>
      <Field name="fullName" label="Full Name" required>
        {({ field, meta }) => (
          <TextInput
            {...field}
            placeholder="Your name"
            error={Boolean(meta.touched && meta.error)}
          />
        )}
      </Field>

      <Field name="email" label="Email" required>
        {({ field, meta }) => (
          <TextInput
            {...field}
            type="email"
            placeholder="you@example.com"
            error={Boolean(meta.touched && meta.error)}
          />
        )}
      </Field>

      <Field name="inquiryType" label="Inquiry Type" required>
        {({ field, meta }) => (
          <Select
            {...field}
            options={[
              { label: "General", value: "general" },
              { label: "Sales", value: "sales" },
              { label: "Support", value: "support" },
            ]}
            error={Boolean(meta.touched && meta.error)}
          />
        )}
      </Field>

      <button type="submit" disabled={form.isSubmitting}>
        Submit
      </button>
    </Form>
  );
}
```

## Package Entry Points

### Main
- `@page-speed/forms`

Exports:
- `useForm`, `useField`, `Form`, `Field`, `FormContext`
- core form/types interfaces

### Inputs
- `@page-speed/forms/inputs`

Exports:
- `TextInput`
- `TextArea`
- `Checkbox`
- `CheckboxGroup`
- `Radio`
- `Select`
- `MultiSelect`
- `DatePicker`
- `DateRangePicker`
- `TimePicker`
- `FileInput`

### Validation
- `@page-speed/forms/validation`
- `@page-speed/forms/validation/rules`
- `@page-speed/forms/validation/utils`
- `@page-speed/forms/validation/valibot`

### Upload and Integration
- `@page-speed/forms/upload`
- `@page-speed/forms/integration`

## Input Notes

### `TimePicker`
`TimePicker` now uses a native `input[type="time"]` UX internally.

- Accepts controlled values in `HH:mm` (24-hour) or `h:mm AM/PM` (12-hour)
- Emits `HH:mm` when `use24Hour` is `true`
- Emits `h:mm AM/PM` when `use24Hour` is `false`

### `DatePicker` and `DateRangePicker`
- Calendar popovers close on outside click
- Compact month/day layout using tokenized Tailwind classes
- `DateRangePicker` renders two months and highlights endpoints + in-range dates

### `Select` and `MultiSelect`
- Close on outside click
- Search support
- Option groups
- Selected options inside the menu use accent highlight styles

## Styling (Tailwind 4 + Semantic Tokens)

This library ships with Tailwind utility classes and semantic token class names.

It is **not** a BEM-only unstyled package anymore.

### Base conventions

- Inputs/triggers are transparent shells with semantic borders/rings
- Fields with values (text-like controls) use `ring-2 ring-ring`
- Error states use destructive border/ring
- Dropdown selected rows use muted backgrounds

### Autofill normalization

Text-like controls apply autofill reset classes to avoid browser-injected background/text colors breaking your theme contrast.

See `INPUT_AUTOFILL_RESET_CLASSES` in `src/utils.ts`.

### Token requirements

Ensure your app defines semantic tokens used in classes such as:
- `background`, `foreground`, `border`, `input`, `ring`
- `primary`, `primary-foreground`
- `muted`, `muted-foreground`
- `destructive`, `destructive-foreground`
- `popover`, `popover-foreground`
- `card`, `card-foreground`

For complete styling guidance, see [`docs/STYLES.md`](./docs/STYLES.md).

## Validation Utilities

Use built-in rules:
- `required`, `email`, `url`, `phone`
- `minLength`, `maxLength`, `min`, `max`
- `pattern`, `matches`, `oneOf`
- `creditCard`, `postalCode`, `alpha`, `alphanumeric`, `numeric`, `integer`
- `compose`

Use utilities from `/validation/utils`:
- `debounce`, `asyncValidator`, `crossFieldValidator`, `when`
- `setErrorMessages`, `getErrorMessage`, `resetErrorMessages`

## File Uploads

`FileInput` supports validation, drag/drop, preview, and crop workflows.

For full two-phase upload patterns and serializer usage, see:
- [`docs/FILE_UPLOADS.md`](./docs/FILE_UPLOADS.md)
- `@page-speed/forms/integration`

## Development

```bash
pnpm test:ci
pnpm build
pnpm type-check
```

## License

MIT. See [`LICENSE`](./LICENSE).
