<img width="1200" height="330" alt="page-speed-forms-npm-module" src="https://github.com/user-attachments/assets/4dd21311-9de6-4c42-be75-bbc8fe5a0192" />

# @page-speed/forms

Type-safe form state management and validation for React applications.

## Overview

OpenSite Page Speed Forms is a high-performance library designed to streamline form state management, validation, and submission handling in React applications. This library is part of OpenSite AI's open-source ecosystem, built for performance and open collaboration. By emphasizing type safety and modularity, it aligns with OpenSite's goal to create scalable, open, and developer-friendly performance tooling.

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
