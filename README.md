# @page-speed/forms

Ultra-high-performance React form library with field-level reactivity and tree-shakable architecture.

## Features

- =€ **Field-Level Reactivity**: Only re-render the specific field that changed (~1 re-render per change vs ~10 for traditional hooks)
- =æ **Tree-Shakable**: Import only what you need - Core module starts at 13 KB gzipped
- ¡ **Built on @legendapp/state**: Observable-based state management for optimal performance
-  **Valibot Integration**: Lightweight validation (95% smaller than Zod)
- <¯ **TypeScript-First**: Full type safety with comprehensive type definitions
-  **Accessible**: ARIA attributes and semantic HTML out of the box
- = **Progressive Enhancement**: Forms work without JavaScript
- <¨ **Unstyled**: Bring your own styles - no CSS to override

## Installation

```bash
# Using pnpm (recommended)
pnpm add @page-speed/forms

# Optional: Add validation library
pnpm add valibot

# Optional: Add state management (peer dependency)
pnpm add @legendapp/state
```

## Bundle Sizes

All sizes shown are **minified + gzipped** with dependencies:

- **Core** (useForm, Form, Field, useField): 13.11 KB
- **TextInput**: 502 B
- **Valibot Adapter**: 392 B
- **Full Bundle**: 13.25 KB

## Quick Start

### Basic Form

```tsx
import { useForm, Form, Field } from '@page-speed/forms';
import { TextInput } from '@page-speed/forms/inputs';

function LoginForm() {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: {
      email: (value) => !value ? 'Required' : undefined,
      password: (value) => value.length < 8 ? 'Too short' : undefined,
    },
    onSubmit: async (values) => {
      await login(values);
    },
  });

  return (
    <Form form={form}>
      <Field name="email" label="Email">
        {({ field, meta }) => (
          <>
            <TextInput {...field} type="email" error={!!meta.error} />
            {meta.error && <span>{meta.error}</span>}
          </>
        )}
      </Field>

      <Field name="password" label="Password">
        {({ field, meta }) => (
          <>
            <TextInput {...field} type="password" error={!!meta.error} />
            {meta.error && <span>{meta.error}</span>}
          </>
        )}
      </Field>

      <button type="submit" disabled={form.isSubmitting}>
        Submit
      </button>
    </Form>
  );
}
```

### With Valibot Validation

```tsx
import { useForm } from '@page-speed/forms';
import { createValibotSchema } from '@page-speed/forms/validation/valibot';
import * as v from 'valibot';

const LoginSchema = v.object({
  email: v.pipe(v.string(), v.email('Invalid email')),
  password: v.pipe(v.string(), v.minLength(8, 'Too short')),
});

function LoginForm() {
  const form = useForm({
    initialValues: { email: '', password: '' },
    validationSchema: createValibotSchema(LoginSchema),
    onSubmit: async (values) => {
      await login(values);
    },
  });

  // ... rest of form
}
```

## API Reference

### `useForm(options)`

Main hook for creating form state.

**Options:**

- `initialValues` (required): Initial form values
- `validationSchema`: Schema mapping field names to validators
- `validateOn`: When to validate - `"onBlur"` (default) | `"onChange"` | `"onSubmit"`
- `revalidateOn`: When to revalidate after first validation - `"onChange"` (default) | `"onBlur"`
- `onSubmit` (required): Submit handler function
- `onError`: Error handler for validation failures
- `debug`: Enable debug logging

**Returns:**

```typescript
{
  // State
  values: T;
  errors: FormErrors<T>;
  touched: TouchedFields<T>;
  isSubmitting: boolean;
  isValid: boolean;
  isDirty: boolean;
  status: 'idle' | 'submitting' | 'success' | 'error';

  // Actions
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
  setFieldValue: (field: keyof T, value: T[field]) => void;
  setFieldError: (field: keyof T, error: string) => void;
  setFieldTouched: (field: keyof T, touched: boolean) => void;
  validateForm: () => Promise<FormErrors<T>>;
  validateField: (field: keyof T) => Promise<string | undefined>;
  resetForm: () => void;
  getFieldProps: (field: keyof T) => FieldInputProps;
  getFieldMeta: (field: keyof T) => FieldMeta;
}
```

### `<Form>`

Progressive enhancement wrapper component.

```tsx
<Form
  form={form}
  action="/api/endpoint"  // Fallback for no-JS
  method="post"           // Fallback for no-JS
  className="my-form"
>
  {/* fields */}
</Form>
```

### `<Field>`

Field wrapper with label, description, and error display.

```tsx
<Field
  name="email"
  label="Email Address"
  description="We'll never share your email"
  validate={(value) => !value ? 'Required' : undefined}
>
  {({ field, meta, helpers }) => (
    <TextInput {...field} error={!!meta.error} />
  )}
</Field>
```

### `useField(options)`

Field-level hook for accessing field state.

```tsx
const { field, meta, helpers } = useField({
  name: 'email',
  validate: (value) => !value ? 'Required' : undefined,
  transform: (value) => value.toLowerCase(),
});
```

### `<TextInput>`

Lightweight, accessible text input component.

```tsx
<TextInput
  name="email"
  value={value}
  onChange={onChange}
  onBlur={onBlur}
  type="email"
  placeholder="you@example.com"
  error={hasError}
  disabled={false}
  required={true}
/>
```

## Validation

### Inline Validators

```tsx
const form = useForm({
  initialValues: { email: '' },
  validationSchema: {
    email: (value) => {
      if (!value) return 'Required';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return 'Invalid email';
      }
      return undefined;
    },
  },
  onSubmit: async (values) => { /* ... */ },
});
```

### Async Validation

```tsx
const form = useForm({
  initialValues: { username: '' },
  validationSchema: {
    username: async (value) => {
      const exists = await checkUsernameExists(value);
      return exists ? 'Username taken' : undefined;
    },
  },
  onSubmit: async (values) => { /* ... */ },
});
```

### Multiple Validators per Field

```tsx
const form = useForm({
  initialValues: { password: '' },
  validationSchema: {
    password: [
      (value) => !value ? 'Required' : undefined,
      (value) => value.length < 8 ? 'Too short' : undefined,
      (value) => !/[A-Z]/.test(value) ? 'Needs uppercase' : undefined,
    ],
  },
  onSubmit: async (values) => { /* ... */ },
});
```

### Valibot Integration

```tsx
import { createValibotSchema } from '@page-speed/forms/validation/valibot';
import * as v from 'valibot';

const schema = v.object({
  email: v.pipe(
    v.string(),
    v.email('Invalid email'),
    v.endsWith('@company.com', 'Must be company email')
  ),
  age: v.pipe(
    v.number(),
    v.minValue(18, 'Must be 18+')
  ),
});

const form = useForm({
  initialValues: { email: '', age: 0 },
  validationSchema: createValibotSchema(schema),
  onSubmit: async (values) => { /* ... */ },
});
```

## Advanced Usage

### Conditional Validation

```tsx
const form = useForm({
  initialValues: {
    contactMethod: 'email',
    email: '',
    phone: '',
  },
  validationSchema: {
    email: (value, allValues) => {
      if (allValues.contactMethod === 'email' && !value) {
        return 'Email required when email is selected';
      }
      return undefined;
    },
    phone: (value, allValues) => {
      if (allValues.contactMethod === 'phone' && !value) {
        return 'Phone required when phone is selected';
      }
      return undefined;
    },
  },
  onSubmit: async (values) => { /* ... */ },
});
```

### Dynamic Forms

```tsx
function DynamicForm() {
  const form = useForm({
    initialValues: {
      contacts: [{ name: '', email: '' }],
    },
    onSubmit: async (values) => { /* ... */ },
  });

  return (
    <Form form={form}>
      {form.values.contacts.map((contact, index) => (
        <div key={index}>
          <Field name={`contacts.${index}.name`}>
            {({ field }) => <TextInput {...field} />}
          </Field>
          <Field name={`contacts.${index}.email`}>
            {({ field }) => <TextInput {...field} type="email" />}
          </Field>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          form.setFieldValue('contacts', [
            ...form.values.contacts,
            { name: '', email: '' },
          ]);
        }}
      >
        Add Contact
      </button>
    </Form>
  );
}
```

### Form Helpers in onSubmit

```tsx
const form = useForm({
  initialValues: { email: '' },
  onSubmit: async (values, helpers) => {
    try {
      await api.submit(values);
      helpers.resetForm();
    } catch (error) {
      if (error.code === 'EMAIL_EXISTS') {
        helpers.setFieldError('email', 'Email already exists');
      } else {
        helpers.setErrors({ email: 'Unexpected error' });
      }
    }
  },
});
```

## Tree-Shaking

The library is designed for optimal tree-shaking. Import only what you need:

```tsx
// Import core functionality (13.11 KB)
import { useForm, Form, Field } from '@page-speed/forms/core';

// Import input components separately (502 B)
import { TextInput } from '@page-speed/forms/inputs';

// Import validation adapters separately (392 B)
import { createValibotSchema } from '@page-speed/forms/validation/valibot';

// Or import from main entry point
import { useForm } from '@page-speed/forms';
```

## Performance

The library uses @legendapp/state for optimal performance:

- **~1 re-render per change** vs ~10 for traditional hooks
- **Observable-based state**: Fine-grained reactivity at the field level
- **No unnecessary re-renders**: Parent form doesn't re-render when child field changes
- **Efficient validation**: Debounced and memoized by default

## Progressive Enhancement

Forms work without JavaScript by using native HTML form submission:

```tsx
<Form
  form={form}
  action="/api/endpoint"  // Used when JS disabled
  method="post"
>
  {/* fields */}
</Form>
```

When JavaScript is available, `onSubmit` handles the submission. When JavaScript is disabled, the native HTML form submission takes over.

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES2020 support
- No IE11 support

## TypeScript

Fully typed with comprehensive type definitions:

```tsx
import type {
  FormValues,
  FormErrors,
  TouchedFields,
  ValidationSchema,
  FieldValidator,
  UseFormOptions,
  UseFormReturn,
} from '@page-speed/forms/core';
```

## Examples

See the [`examples/`](./examples) directory for more complete examples including:
- Basic forms with inline validation
- Valibot schema integration
- Dynamic forms with conditional fields
- Progressive enhancement
- Async validation

## License

MIT

## Contributing

Contributions welcome! Please read our contributing guidelines first.

## Credits

Built with:
- [@legendapp/state](https://legendapp.com/open-source/state/) - Observable state management
- [Valibot](https://valibot.dev/) - Lightweight validation library
- [tsup](https://tsup.egoist.dev/) - TypeScript bundler
