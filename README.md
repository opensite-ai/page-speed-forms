# @page-speed/forms

## Type-safe, high-performance React form state and input components. Utilized by the [OpenSite Semantic UI](https://opensite.ai) website platform

![Page Speed React Forms](https://octane.cdn.ing/api/v1/images/transform?url=https://cdn.ing/assets/i/r/286339/nwqgw37pigfluhcmmjmpql3yj9y4/github.png&f=webp&q=90)

<br />

[![npm version](https://img.shields.io/npm/v/@page-speed/forms?style=for-the-badge)](https://www.npmjs.com/package/@page-speed/forms)
[![npm downloads](https://img.shields.io/npm/dm/@page-speed/forms?style=for-the-badge)](https://www.npmjs.com/package/@page-speed/forms)
[![License](https://img.shields.io/npm/l/@page-speed/forms?style=for-the-badge)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge)](./tsconfig.json)
[![Tree-Shakeable](https://img.shields.io/badge/Tree%20Shakeable-Yes-brightgreen?style=for-the-badge)](#tree-shaking)

## Highlights

- **`FormEngine`** — declarative form component with built-in API integration
- Field-level reactivity via `@legendapp/state/react`
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

### Peer dependencies:

- `react >= 16.8.0`
- `react-dom >= 16.8.0`

## Quick Start with FormEngine

`FormEngine` is the recommended entry point for most use cases. It provides a declarative API for rendering forms with built-in API integration, validation, file uploads, and styling.

```tsx
import * as React from "react";
import {
  FormEngine,
  type FormFieldConfig,
} from "@page-speed/forms/integration";

const fields: FormFieldConfig[] = [
  {
    name: "full_name",
    type: "text",
    label: "Full Name",
    required: true,
    placeholder: "Your name",
    columnSpan: 12,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    required: true,
    placeholder: "you@example.com",
    columnSpan: 6,
  },
  {
    name: "phone",
    type: "tel",
    label: "Phone",
    columnSpan: 6,
  },
  {
    name: "content",
    type: "textarea",
    label: "Message",
    required: true,
    columnSpan: 12,
  },
];

export function ContactForm() {
  return (
    <FormEngine
      api={{
        endpoint: "/api/contact",
        method: "post",
        submissionConfig: { behavior: "showConfirmation" },
      }}
      fields={fields}
      successMessage="Thanks for reaching out!"
      formLayoutSettings={{
        submitButtonSetup: {
          submitLabel: "Send Message",
        },
      }}
    />
  );
}
```

### FormEngine Props

| Prop | Type | Description |
|------|------|-------------|
| `api` | `PageSpeedFormConfig` | API endpoint and submission configuration |
| `fields` | `FormFieldConfig[]` | Array of field definitions |
| `formLayoutSettings` | `FormEngineLayoutSettings` | Layout, style, and submit button settings |
| `successMessage` | `ReactNode` | Message shown after successful submission |
| `onSubmit` | `(values) => void \| Promise<void>` | Custom submit handler |
| `onSuccess` | `(data) => void` | Called after successful submission |
| `onError` | `(error) => void` | Called when submission fails |
| `resetOnSuccess` | `boolean` | Reset form after success (default: `true`) |

### Field Configuration

Each field in the `fields` array supports:

```tsx
interface FormFieldConfig {
  name: string;
  type: "text" | "email" | "tel" | "textarea" | "select" | "multiselect" | 
        "date" | "daterange" | "time" | "file" | "checkbox" | "radio";
  label?: string;
  placeholder?: string;
  required?: boolean;
  columnSpan?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  className?: string;
  options?: { label: string; value: string }[]; // For select/multiselect/radio
  // File-specific props
  accept?: string;
  maxFiles?: number;
  maxFileSize?: number;
}
```

### Layout Options

#### Standard Layout (default)

Multi-column grid with a submit button below the fields:

```tsx
<FormEngine
  fields={fields}
  formLayoutSettings={{
    formLayout: "standard",
    submitButtonSetup: {
      submitLabel: "Submit",
      submitVariant: "default", // | "destructive" | "outline" | "secondary" | "ghost" | "link"
    },
    styleRules: {
      formContainer: "max-w-2xl mx-auto",
      fieldsContainer: "gap-6",
      formClassName: "space-y-4",
    },
  }}
/>
```

#### Button-Group Layout

Inline input with submit button (e.g., newsletter signup):

```tsx
<FormEngine
  fields={[{ name: "email", type: "email", label: "Email", required: true }]}
  formLayoutSettings={{
    formLayout: "button-group",
    buttonGroupSetup: {
      size: "lg", // | "xs" | "sm" | "default"
      submitLabel: "Subscribe",
      submitVariant: "default",
    },
  }}
/>
```

### Using formEngineSetup Wrapper

For block/component libraries that provide default configurations:

```tsx
import {
  FormEngine,
  type FormEngineSetup,
  type FormFieldConfig,
  type FormEngineStyleRules,
} from "@page-speed/forms/integration";

const defaultFields: FormFieldConfig[] = [
  { name: "email", type: "email", label: "Email", required: true },
];

const defaultStyleRules: FormEngineStyleRules = {
  formClassName: "space-y-6",
};

// Consumer passes setup, component provides defaults
function ContactBlock({ formEngineSetup }: { formEngineSetup?: FormEngineSetup }) {
  return (
    <FormEngine
      formEngineSetup={formEngineSetup}
      defaultFields={defaultFields}
      defaultStyleRules={defaultStyleRules}
    />
  );
}
```

## Package Entry Points

### Main

- `@page-speed/forms`

#### Exports:

- `useForm`, `useField`, `Form`, `Field`, `FormContext`
- Core form/types interfaces

### Integration (Recommended)

- `@page-speed/forms/integration`

#### Exports:

- `FormEngine`, `FormEngineSetup`, `FormEngineProps`
- `FormFieldConfig`, `FormEngineStyleRules`, `FormEngineLayoutSettings`
- `DynamicFormField`, `useContactForm`, `useFileUpload`

### Inputs

- `@page-speed/forms/inputs`

#### Exports:

- `TextInput`, `TextArea`, `Checkbox`, `CheckboxGroup`, `Radio`
- `Select`, `MultiSelect`, `DatePicker`, `DateRangePicker`, `TimePicker`
- `FileInput`

### Validation

- `@page-speed/forms/validation`
- `@page-speed/forms/validation/rules`
- `@page-speed/forms/validation/utils`
- `@page-speed/forms/validation/valibot`

### Upload

- `@page-speed/forms/upload`

## Input Notes

### `TimePicker`

`TimePicker` uses a native `input[type="time"]` UX internally.

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

### Base conventions

- Inputs/triggers are transparent shells with semantic borders/rings
- Fields with values (text-like controls) use `ring-2 ring-primary`
- Error states use destructive border/ring
- Dropdown selected rows use muted backgrounds

### FormEngine Style Rules

```tsx
interface FormEngineStyleRules {
  formContainer?: string;       // Wrapper around <form>
  fieldsContainer?: string;     // Grid wrapper for fields
  fieldClassName?: string;      // Fallback className for fields
  formClassName?: string;       // Applied to <form> element
  successMessageClassName?: string;
  errorMessageClassName?: string;
}
```

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

## Advanced: Low-Level APIs

For custom form implementations, the lower-level `useForm`, `Form`, and `Field` APIs are available:

```tsx
import { Form, Field, useForm } from "@page-speed/forms";
import { TextInput } from "@page-speed/forms/inputs";

function CustomForm() {
  const form = useForm({
    initialValues: { email: "" },
    validationSchema: {
      email: (value) => (!value ? "Required" : undefined),
    },
    onSubmit: async (values) => {
      console.log(values);
    },
  });

  return (
    <Form form={form}>
      <Field name="email" label="Email">
        {({ field, meta }) => (
          <TextInput
            {...field}
            error={Boolean(meta.touched && meta.error)}
          />
        )}
      </Field>
      <button type="submit">Submit</button>
    </Form>
  );
}
```

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

`FileInput` and `FormEngine` support validation, drag/drop, preview, and crop workflows.

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
