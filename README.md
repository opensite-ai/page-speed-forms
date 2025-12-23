<img width="896" height="330" alt="page-speed-forms" src="https://github.com/user-attachments/assets/6db9cf70-5488-472d-b1a7-b79cc74a8cf2" />

# ⚡@page-speed/forms

Type-safe form state management and validation for React applications.

## Overview

OpenSite Page Speed Forms is a high-performance library designed to streamline form state management, validation, and submission handling in React applications. This library is part of OpenSite AI's open-source ecosystem, built for performance and open collaboration. By emphasizing type safety and modularity, it aligns with OpenSite's goal to create scalable, open, and developer-friendly performance tooling.

[![npm version](https://img.shields.io/npm/v/@page-speed/forms?style=flat-square)](https://www.npmjs.com/package/@page-speed/forms)
[![npm downloads](https://img.shields.io/npm/dm/@page-speed/forms?style=flat-square)](https://www.npmjs.com/package/@page-speed/forms)
[![License](https://img.shields.io/npm/l/@page-speed/forms?style=flat-square)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?style=flat-square)](./tsconfig.json)
[![Tree-Shakeable](https://img.shields.io/badge/Tree%20Shakeable-Yes-brightgreen?style=flat-square)](#tree-shaking)

Learn more at [OpenSite.ai Developers](https://opensite.ai/developers).

## Key Features

- Type-safe form state management with TypeScript.
- Flexible validation schemas supporting both synchronous and asynchronous validation.
- Modular useForm and useField hooks for complete form and field control.
- Built-in support for form submission and error handling.
- Configurable validation modes: `onChange`, `onBlur`, and `onSubmit`.

## Installation

To install OpenSite Page Speed Forms, ensure you have Node.js and npm installed, then run:

```
npm install @page-speed/forms
```

Dependencies:
- React

## Quick Start

Here is a basic example to get started with OpenSite Page Speed Forms in your React application:

```typescript
import React from 'react';
import { useForm, Form } from '@page-speed/forms';

function MyForm() {
  const form = useForm({
    initialValues: { email: '' },
    onSubmit: (values) => {
      console.log('Form Submitted:', values);
    }
  });

  return (
    <Form form={form}>
      <input
        name="email"
        value={form.values.email}
        onChange={(e) => form.setFieldValue('email', e.target.value)}
        onBlur={() => form.setFieldTouched('email', true)}
      />
      <button type="submit">Submit</button>
    </Form>
  );
}
```

## Configuration or Advanced Usage

OpenSite Page Speed Forms can be customized with various options:

```typescript
const form = useForm({
  initialValues: { email: '' },
  validationSchema: {
    email: (value) => value.includes('@') ? undefined : 'Invalid email'
  },
  validateOn: 'onBlur',
  revalidateOn: 'onChange',
  onSubmit: (values) => console.log(values),
  onError: (errors) => console.error(errors),
  debug: true
});
```

## Advanced Validation Features

### Cross-Field Validation

Validate fields that depend on other field values using the `crossFieldValidator` utility or by accessing `allValues` in your validator:

```typescript
import { useForm, crossFieldValidator } from '@page-speed/forms/validation';

// Method 1: Using crossFieldValidator helper
const form = useForm({
  initialValues: { password: '', confirmPassword: '' },
  validationSchema: {
    confirmPassword: crossFieldValidator(
      ['password', 'confirmPassword'],
      (values) => {
        if (values.password !== values.confirmPassword) {
          return 'Passwords must match';
        }
        return undefined;
      }
    )
  }
});

// Method 2: Direct access to allValues
const form = useForm({
  initialValues: { password: '', confirmPassword: '' },
  validationSchema: {
    confirmPassword: (value, allValues) => {
      if (value !== allValues.password) {
        return 'Passwords must match';
      }
      return undefined;
    }
  }
});
```

### Async Validation with Debouncing

Optimize async validators (like API calls) with built-in debouncing to prevent excessive requests:

```typescript
import { useForm, asyncValidator } from '@page-speed/forms/validation';

const checkUsernameAvailability = async (username: string) => {
  const response = await fetch(`/api/check-username?username=${username}`);
  const { available } = await response.json();
  return available ? undefined : 'Username already taken';
};

const form = useForm({
  initialValues: { username: '' },
  validationSchema: {
    // Debounce async validation by 500ms
    username: asyncValidator(
      checkUsernameAvailability,
      { delay: 500, trailing: true }
    )
  }
});
```

**Debounce Options:**
- `delay`: Milliseconds to wait (default: 300ms)
- `leading`: Validate immediately on first change (default: false)
- `trailing`: Validate after delay expires (default: true)

The `asyncValidator` wrapper also includes automatic race condition prevention, ensuring only the latest validation result is used.

### Validation Rules Library

Use pre-built, tree-shakable validation rules for common scenarios:

```typescript
import {
  required,
  email,
  url,
  phone,
  minLength,
  maxLength,
  min,
  max,
  pattern,
  matches,
  oneOf,
  creditCard,
  postalCode,
  alpha,
  alphanumeric,
  numeric,
  integer,
  compose
} from '@page-speed/forms/validation/rules';

const form = useForm({
  initialValues: {
    email: '',
    password: '',
    confirmPassword: '',
    age: 0,
    username: '',
    cardNumber: ''
  },
  validationSchema: {
    email: compose(
      required({ message: 'Email is required' }),
      email({ message: 'Invalid email format' })
    ),
    password: compose(
      required(),
      minLength(8, { message: 'Password must be at least 8 characters' })
    ),
    confirmPassword: matches('password', { message: 'Passwords must match' }),
    age: compose(
      required(),
      numeric({ message: 'Age must be a number' }),
      min(18, { message: 'Must be 18 or older' })
    ),
    username: compose(
      required(),
      alphanumeric({ message: 'Only letters and numbers allowed' }),
      minLength(3),
      maxLength(20)
    ),
    cardNumber: creditCard({ message: 'Invalid credit card number' })
  }
});
```

**Available Validators:**

| Validator | Description | Example |
|-----------|-------------|---------|
| `required()` | Field must have a value | `required({ message: 'Required' })` |
| `email()` | Valid email format (RFC 5322) | `email()` |
| `url()` | Valid URL format | `url()` |
| `phone()` | US phone number format | `phone()` |
| `minLength(n)` | Minimum string/array length | `minLength(3)` |
| `maxLength(n)` | Maximum string/array length | `maxLength(100)` |
| `min(n)` | Minimum numeric value | `min(0)` |
| `max(n)` | Maximum numeric value | `max(100)` |
| `pattern(regex)` | Custom regex pattern | `pattern(/^[A-Z]+$/)` |
| `matches(field)` | Match another field | `matches('password')` |
| `oneOf(values)` | Value in allowed list | `oneOf(['a', 'b', 'c'])` |
| `creditCard()` | Valid credit card (Luhn) | `creditCard()` |
| `postalCode()` | US ZIP code format | `postalCode()` |
| `alpha()` | Alphabetic characters only | `alpha()` |
| `alphanumeric()` | Letters and numbers only | `alphanumeric()` |
| `numeric()` | Valid number | `numeric()` |
| `integer()` | Whole number | `integer()` |
| `compose(...)` | Combine multiple validators | `compose(required(), email())` |

### Custom Error Messages & Internationalization

Customize error messages globally for internationalization support:

```typescript
import { setErrorMessages } from '@page-speed/forms/validation/utils';

// Set custom messages (e.g., Spanish translations)
setErrorMessages({
  required: 'Este campo es obligatorio',
  email: 'Por favor ingrese un correo electrónico válido',
  minLength: ({ min }) => `Debe tener al menos ${min} caracteres`,
  maxLength: ({ max }) => `No debe exceder ${max} caracteres`,
  phone: 'Por favor ingrese un número de teléfono válido'
});

// Use with validation rules
import { required, email, minLength } from '@page-speed/forms/validation/rules';

const form = useForm({
  initialValues: { email: '', password: '' },
  validationSchema: {
    email: compose(required(), email()),
    password: compose(required(), minLength(8))
  }
});
```

**Message Template Functions:**

Error messages support template functions with parameter interpolation:

```typescript
setErrorMessages({
  minLength: ({ min }) => `Must be at least ${min} characters`,
  max: ({ max }) => `Cannot exceed ${max}`,
  matches: ({ field }) => `Must match ${field}`
});
```

**Per-Field Custom Messages:**

Override global messages on a per-field basis:

```typescript
const form = useForm({
  initialValues: { email: '' },
  validationSchema: {
    email: required({ message: 'Please provide your email address' })
  }
});
```

### Conditional Validation

Validate fields only when certain conditions are met:

```typescript
import { when, required, minLength } from '@page-speed/forms/validation';

const form = useForm({
  initialValues: { accountType: 'personal', companyName: '' },
  validationSchema: {
    // Only require company name for business accounts
    companyName: when(
      (allValues) => allValues.accountType === 'business',
      compose(
        required({ message: 'Company name is required for business accounts' }),
        minLength(3)
      )
    )
  }
});
```

## Built-in Input Components

`@page-speed/forms` includes a comprehensive set of accessible, production-ready input components that work seamlessly with the form hooks.

### Basic Inputs

#### TextInput
Standard text input with support for various types (text, email, password, etc.):

```typescript
import { TextInput } from '@page-speed/forms/inputs';

<Field name="email" label="Email">
  {({ field }) => <TextInput {...field} type="email" placeholder="Enter email" />}
</Field>
```

#### TextArea
Multi-line text input:

```typescript
import { TextArea } from '@page-speed/forms/inputs';

<Field name="description" label="Description">
  {({ field }) => <TextArea {...field} rows={5} placeholder="Enter description" />}
</Field>
```

#### Checkbox & CheckboxGroup
Single checkbox or group of checkboxes:

```typescript
import { Checkbox, CheckboxGroup } from '@page-speed/forms/inputs';

// Single checkbox
<Field name="terms" label="Terms">
  {({ field }) => <Checkbox {...field} label="I agree to the terms" />}
</Field>

// Checkbox group
<Field name="interests" label="Interests">
  {({ field }) => (
    <CheckboxGroup
      {...field}
      options={[
        { label: 'Sports', value: 'sports' },
        { label: 'Music', value: 'music' },
        { label: 'Travel', value: 'travel' }
      ]}
    />
  )}
</Field>
```

#### Radio
Radio button group:

```typescript
import { Radio } from '@page-speed/forms/inputs';

<Field name="plan" label="Select Plan">
  {({ field }) => (
    <Radio
      {...field}
      options={[
        { label: 'Basic', value: 'basic' },
        { label: 'Pro', value: 'pro' },
        { label: 'Enterprise', value: 'enterprise' }
      ]}
    />
  )}
</Field>
```

#### Select
Dropdown select with support for single and multi-select:

```typescript
import { Select } from '@page-speed/forms/inputs';

// Single select
<Field name="country" label="Country">
  {({ field }) => (
    <Select
      {...field}
      options={[
        { label: 'United States', value: 'us' },
        { label: 'Canada', value: 'ca' },
        { label: 'United Kingdom', value: 'uk' }
      ]}
      searchable
      clearable
    />
  )}
</Field>

// Multi-select
<Field name="skills" label="Skills">
  {({ field }) => (
    <Select
      {...field}
      multiple
      options={[
        { label: 'JavaScript', value: 'js' },
        { label: 'TypeScript', value: 'ts' },
        { label: 'React', value: 'react' }
      ]}
      searchable
    />
  )}
</Field>
```

### Advanced Inputs

#### DatePicker
Date selection with calendar popup:

```typescript
import { DatePicker } from '@page-speed/forms/inputs';

<Field name="birthdate" label="Birth Date">
  {({ field }) => (
    <DatePicker
      {...field}
      placeholder="Select date"
      dateFormat="MM/dd/yyyy"
      minDate={new Date(1900, 0, 1)}
      maxDate={new Date()}
      clearable
    />
  )}
</Field>
```

**Props:**
- `dateFormat`: Date display format (default: "MM/dd/yyyy")
- `minDate`, `maxDate`: Restrict selectable dates
- `isDateDisabled`: Custom function to disable specific dates
- `clearable`: Show clear button
- `showTodayButton`: Show "Today" button

#### TimePicker
Time selection with hour/minute/period selectors:

```typescript
import { TimePicker } from '@page-speed/forms/inputs';

<Field name="appointmentTime" label="Appointment Time">
  {({ field }) => (
    <TimePicker
      {...field}
      placeholder="Select time"
      use24Hour={false}
      minuteStep={15}
      clearable
    />
  )}
</Field>
```

**Props:**
- `use24Hour`: Use 24-hour format (default: false)
- `minuteStep`: Minute increment (default: 1)
- `clearable`: Show clear button

#### DateRangePicker
Date range selection with start and end dates:

```typescript
import { DateRangePicker } from '@page-speed/forms/inputs';

<Field name="dateRange" label="Date Range">
  {({ field }) => (
    <DateRangePicker
      {...field}
      placeholder="Select date range"
      separator=" - "
      minDate={new Date()}
      clearable
    />
  )}
</Field>
```

**Props:**
- `separator`: String between start and end dates (default: " - ")
- `minDate`, `maxDate`: Restrict selectable dates
- `isDateDisabled`: Custom function to disable specific dates
- `clearable`: Show clear button

#### RichTextEditor
WYSIWYG and Markdown editor with toolbar:

```typescript
import { RichTextEditor } from '@page-speed/forms/inputs';

<Field name="content" label="Content">
  {({ field }) => (
    <RichTextEditor
      {...field}
      placeholder="Enter content..."
      minHeight="200px"
      maxHeight="600px"
      allowModeSwitch
      defaultMode="wysiwyg"
    />
  )}
</Field>
```

**Props:**
- `defaultMode`: "wysiwyg" or "markdown" (default: "wysiwyg")
- `allowModeSwitch`: Enable mode toggle button
- `minHeight`, `maxHeight`: Editor height constraints
- `customButtons`: Add custom toolbar buttons

**Features:**
- WYSIWYG mode: Bold, Italic, Underline, Headings, Lists, Links
- Markdown mode: Direct markdown editing
- Automatic HTML ↔ Markdown conversion

#### FileInput
File upload with drag-and-drop, progress indicators, and image cropping:

```typescript
import { FileInput } from '@page-speed/forms/inputs';

<Field name="avatar" label="Profile Picture">
  {({ field }) => (
    <FileInput
      {...field}
      accept="image/*"
      maxSize={5 * 1024 * 1024} // 5MB
      maxFiles={1}
      showProgress
      uploadProgress={uploadProgress}
      enableCropping
      cropAspectRatio={1}
      onCropComplete={(file) => console.log('Cropped:', file)}
    />
  )}
</Field>
```

**Props:**
- `accept`: File type filter (e.g., "image/*", ".pdf")
- `multiple`: Allow multiple files
- `maxFiles`: Maximum number of files
- `maxSize`: Maximum file size in bytes
- `showPreview`: Show file previews
- `showProgress`: Display upload progress bars
- `uploadProgress`: Object mapping filenames to progress percentages
- `enableCropping`: Enable image cropping for image files
- `cropAspectRatio`: Crop aspect ratio (e.g., 16/9, 1 for square)
- `onCropComplete`: Callback when cropping is complete

**Features:**
- Drag-and-drop support
- File type and size validation
- Image previews with thumbnails
- Upload progress indicators with percentage
- Interactive image cropping with zoom
- Multiple file support
- Accessible file selection

## Performance Notes

Performance is a core facet of everything we build at OpenSite AI. The library is optimized for minimal re-renders and efficient form state updates, ensuring your applications remain responsive and fast.

## Contributing

We welcome contributions from the community to enhance OpenSite Page Speed Forms. Please refer to our [GitHub repository](https://github.com/opensite-ai) for guidelines and more information on how to get involved.

## License

Licensed under the BSD 3-Clause License. See the [LICENSE](./LICENSE) file for details.

## Related Projects

- [Domain Extractor](https://github.com/opensite-ai/domain_extractor)
- [Page Speed Hooks](https://github.com/opensite-ai/page-speed-hooks)
- Visit [opensite.ai](https://opensite.ai) for more tools and information.
