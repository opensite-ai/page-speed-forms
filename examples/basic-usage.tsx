/**
 * @page-speed/forms - Basic Usage Examples
 *
 * This file demonstrates common usage patterns for the form library.
 */

import { useForm, Form, Field } from '@page-speed/forms';
import { TextInput } from '@page-speed/forms/inputs';
import { createValibotSchema } from '@page-speed/forms/validation/valibot';
import * as v from 'valibot';

// ============================================================================
// Example 1: Basic Form with Inline Validation
// ============================================================================

interface LoginFormValues {
  email: string;
  password: string;
}

function BasicLoginForm() {
  const form = useForm<LoginFormValues>({
    initialValues: {
      email: '',
      password: '',
    },
    validationSchema: {
      email: (value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email format';
        }
        return undefined;
      },
      password: (value) => {
        if (!value) return 'Password is required';
        if (value.length < 8) return 'Password must be at least 8 characters';
        return undefined;
      },
    },
    onSubmit: async (values) => {
      console.log('Form submitted:', values);
      // Call your API here
      await fetch('/api/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
  });

  return (
    <Form form={form}>
      <Field name="email" label="Email">
        {({ field, meta }) => (
          <div>
            <TextInput
              {...field}
              type="email"
              placeholder="you@example.com"
              error={meta.touched && !!meta.error}
            />
            {meta.touched && meta.error && (
              <span style={{ color: 'red' }}>{meta.error}</span>
            )}
          </div>
        )}
      </Field>

      <Field name="password" label="Password">
        {({ field, meta }) => (
          <div>
            <TextInput
              {...field}
              type="password"
              placeholder="••••••••"
              error={meta.touched && !!meta.error}
            />
            {meta.touched && meta.error && (
              <span style={{ color: 'red' }}>{meta.error}</span>
            )}
          </div>
        )}
      </Field>

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Logging in...' : 'Login'}
      </button>
    </Form>
  );
}

// ============================================================================
// Example 2: Form with Valibot Schema Validation
// ============================================================================

const RegistrationSchema = v.object({
  username: v.pipe(
    v.string(),
    v.minLength(3, 'Username must be at least 3 characters'),
    v.maxLength(20, 'Username must be less than 20 characters')
  ),
  email: v.pipe(
    v.string(),
    v.email('Invalid email address')
  ),
  password: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters')
  ),
  confirmPassword: v.pipe(
    v.string(),
    v.minLength(8, 'Password must be at least 8 characters')
  ),
});

type RegistrationFormValues = v.InferInput<typeof RegistrationSchema>;

function RegistrationForm() {
  const form = useForm<RegistrationFormValues>({
    initialValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema: createValibotSchema(RegistrationSchema),
    onSubmit: async (values, helpers) => {
      // Validate passwords match
      if (values.password !== values.confirmPassword) {
        helpers.setFieldError('confirmPassword', 'Passwords do not match');
        return;
      }

      console.log('Registration submitted:', values);

      try {
        await fetch('/api/register', {
          method: 'POST',
          body: JSON.stringify(values),
        });
        helpers.resetForm();
      } catch (error) {
        helpers.setFieldError('email', 'Email already exists');
      }
    },
  });

  return (
    <Form form={form}>
      <Field name="username" label="Username">
        {({ field, meta }) => (
          <>
            <TextInput {...field} error={meta.touched && !!meta.error} />
            {meta.touched && meta.error && <span>{meta.error}</span>}
          </>
        )}
      </Field>

      <Field name="email" label="Email">
        {({ field, meta }) => (
          <>
            <TextInput {...field} type="email" error={meta.touched && !!meta.error} />
            {meta.touched && meta.error && <span>{meta.error}</span>}
          </>
        )}
      </Field>

      <Field name="password" label="Password">
        {({ field, meta }) => (
          <>
            <TextInput {...field} type="password" error={meta.touched && !!meta.error} />
            {meta.touched && meta.error && <span>{meta.error}</span>}
          </>
        )}
      </Field>

      <Field name="confirmPassword" label="Confirm Password">
        {({ field, meta }) => (
          <>
            <TextInput {...field} type="password" error={meta.touched && !!meta.error} />
            {meta.touched && meta.error && <span>{meta.error}</span>}
          </>
        )}
      </Field>

      <button type="submit" disabled={!form.isValid || form.isSubmitting}>
        {form.isSubmitting ? 'Creating account...' : 'Sign Up'}
      </button>
    </Form>
  );
}

// ============================================================================
// Example 3: Dynamic Form with Conditional Validation
// ============================================================================

interface ContactFormValues {
  name: string;
  email: string;
  phone?: string;
  contactMethod: 'email' | 'phone';
  message: string;
}

function ContactForm() {
  const form = useForm<ContactFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      contactMethod: 'email',
      message: '',
    },
    validationSchema: {
      name: (value) => !value ? 'Name is required' : undefined,
      email: (value, allValues) => {
        if (allValues.contactMethod === 'email' && !value) {
          return 'Email is required when email is selected as contact method';
        }
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Invalid email format';
        }
        return undefined;
      },
      phone: (value, allValues) => {
        if (allValues.contactMethod === 'phone' && !value) {
          return 'Phone is required when phone is selected as contact method';
        }
        return undefined;
      },
      message: (value) => {
        if (!value) return 'Message is required';
        if (value.length < 10) return 'Message must be at least 10 characters';
        return undefined;
      },
    },
    validateOn: 'onBlur',
    revalidateOn: 'onChange',
    onSubmit: async (values) => {
      console.log('Contact form submitted:', values);
      await fetch('/api/contact', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
  });

  return (
    <Form form={form}>
      <Field name="name" label="Name">
        {({ field, meta }) => (
          <>
            <TextInput {...field} error={meta.touched && !!meta.error} />
            {meta.touched && meta.error && <span>{meta.error}</span>}
          </>
        )}
      </Field>

      <Field name="contactMethod" label="Preferred Contact Method">
        {({ field }) => (
          <div>
            <label>
              <input
                type="radio"
                name={field.name}
                value="email"
                checked={field.value === 'email'}
                onChange={(e) => field.onChange(e.target.value as 'email' | 'phone')}
              />
              Email
            </label>
            <label>
              <input
                type="radio"
                name={field.name}
                value="phone"
                checked={field.value === 'phone'}
                onChange={(e) => field.onChange(e.target.value as 'email' | 'phone')}
              />
              Phone
            </label>
          </div>
        )}
      </Field>

      {form.values.contactMethod === 'email' && (
        <Field name="email" label="Email">
          {({ field, meta }) => (
            <>
              <TextInput {...field} type="email" error={meta.touched && !!meta.error} />
              {meta.touched && meta.error && <span>{meta.error}</span>}
            </>
          )}
        </Field>
      )}

      {form.values.contactMethod === 'phone' && (
        <Field name="phone" label="Phone">
          {({ field, meta }) => (
            <>
              <TextInput {...field} type="tel" error={meta.touched && !!meta.error} />
              {meta.touched && meta.error && <span>{meta.error}</span>}
            </>
          )}
        </Field>
      )}

      <Field name="message" label="Message">
        {({ field, meta }) => (
          <>
            <textarea
              {...field}
              rows={5}
              style={{ borderColor: meta.touched && meta.error ? 'red' : undefined }}
            />
            {meta.touched && meta.error && <span>{meta.error}</span>}
          </>
        )}
      </Field>

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'Sending...' : 'Send Message'}
      </button>
    </Form>
  );
}

// ============================================================================
// Example 4: Using getFieldProps for Direct Input Binding
// ============================================================================

function SimpleForm() {
  const form = useForm({
    initialValues: {
      firstName: '',
      lastName: '',
    },
    onSubmit: async (values) => {
      console.log('Submitted:', values);
    },
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <div>
        <label htmlFor="firstName">First Name</label>
        <input id="firstName" {...form.getFieldProps('firstName')} />
        {form.errors.firstName && <span>{form.errors.firstName}</span>}
      </div>

      <div>
        <label htmlFor="lastName">Last Name</label>
        <input id="lastName" {...form.getFieldProps('lastName')} />
        {form.errors.lastName && <span>{form.errors.lastName}</span>}
      </div>

      <button type="submit">Submit</button>
    </form>
  );
}

// ============================================================================
// Example 5: Progressive Enhancement (Works Without JavaScript)
// ============================================================================

function ProgressiveEnhancementForm() {
  const form = useForm({
    initialValues: {
      email: '',
      feedback: '',
    },
    onSubmit: async (values) => {
      // This runs client-side with JavaScript
      console.log('Client-side submission:', values);
      await fetch('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(values),
      });
    },
  });

  return (
    <Form
      form={form}
      action="/api/feedback"  // Fallback for no-JS
      method="post"           // Fallback for no-JS
    >
      <Field name="email" label="Email">
        {({ field }) => <TextInput {...field} type="email" required />}
      </Field>

      <Field name="feedback" label="Feedback">
        {({ field }) => <textarea {...field} required rows={5} />}
      </Field>

      <button type="submit">Send Feedback</button>
    </Form>
  );
}

export {
  BasicLoginForm,
  RegistrationForm,
  ContactForm,
  SimpleForm,
  ProgressiveEnhancementForm,
};
