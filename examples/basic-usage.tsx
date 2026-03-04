/**
 * @page-speed/forms - Basic Usage Examples
 *
 * This file demonstrates common usage patterns for the form library.
 * The recommended approach is to use `FormEngine` for declarative form rendering.
 */

import * as React from "react";
import {
  FormEngine,
  type FormEngineSetup,
  type FormFieldConfig,
  type FormEngineStyleRules,
} from "@page-speed/forms/integration";

// ============================================================================
// Example 1: Basic Contact Form with FormEngine
// ============================================================================

const contactFields: FormFieldConfig[] = [
  {
    name: "fullName",
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
    placeholder: "(555) 123-4567",
    columnSpan: 6,
  },
  {
    name: "message",
    type: "textarea",
    label: "Message",
    required: true,
    placeholder: "How can we help?",
    columnSpan: 12,
  },
];

function BasicContactForm() {
  return (
    <FormEngine
      api={{
        endpoint: "/api/contact",
        method: "post",
        submissionConfig: { behavior: "showConfirmation" },
      }}
      fields={contactFields}
      successMessage="Thanks for reaching out! We'll be in touch soon."
      formLayoutSettings={{
        submitButtonSetup: {
          submitLabel: "Send Message",
          submitVariant: "default",
        },
        styleRules: {
          formContainer: "max-w-2xl mx-auto",
          fieldsContainer: "gap-4",
        },
      }}
    />
  );
}

// ============================================================================
// Example 2: Newsletter Signup (Button-Group Layout)
// ============================================================================

const newsletterFields: FormFieldConfig[] = [
  {
    name: "email",
    type: "email",
    label: "Email",
    required: true,
    placeholder: "Enter your email",
  },
];

function NewsletterSignup() {
  return (
    <FormEngine
      api={{ endpoint: "/api/newsletter", method: "post" }}
      fields={newsletterFields}
      successMessage="You're subscribed!"
      formLayoutSettings={{
        formLayout: "button-group",
        buttonGroupSetup: {
          size: "lg",
          submitLabel: "Subscribe",
          submitVariant: "default",
        },
      }}
    />
  );
}

// ============================================================================
// Example 3: Multi-Column Registration Form
// ============================================================================

const registrationFields: FormFieldConfig[] = [
  {
    name: "firstName",
    type: "text",
    label: "First Name",
    required: true,
    columnSpan: 6,
  },
  {
    name: "lastName",
    type: "text",
    label: "Last Name",
    required: true,
    columnSpan: 6,
  },
  {
    name: "email",
    type: "email",
    label: "Email Address",
    required: true,
    columnSpan: 12,
  },
  {
    name: "company",
    type: "text",
    label: "Company",
    columnSpan: 6,
  },
  {
    name: "role",
    type: "select",
    label: "Role",
    columnSpan: 6,
    options: [
      { label: "Developer", value: "developer" },
      { label: "Designer", value: "designer" },
      { label: "Manager", value: "manager" },
      { label: "Other", value: "other" },
    ],
  },
  {
    name: "interests",
    type: "multiselect",
    label: "Interests",
    columnSpan: 12,
    options: [
      { label: "Product Updates", value: "updates" },
      { label: "Technical Content", value: "technical" },
      { label: "Community Events", value: "events" },
    ],
  },
];

function RegistrationForm() {
  return (
    <FormEngine
      api={{
        endpoint: "/api/register",
        method: "post",
        submissionConfig: {
          behavior: "redirect",
          redirectUrl: "/welcome",
        },
      }}
      fields={registrationFields}
      formLayoutSettings={{
        submitButtonSetup: {
          submitLabel: "Create Account",
        },
        styleRules: {
          formContainer: "max-w-3xl mx-auto p-6",
          fieldsContainer: "gap-6",
        },
      }}
      onSuccess={(data) => {
        console.log("Registration successful:", data);
      }}
      onError={(error) => {
        console.error("Registration failed:", error);
      }}
    />
  );
}

// ============================================================================
// Example 4: Form with File Upload
// ============================================================================

const applicationFields: FormFieldConfig[] = [
  {
    name: "name",
    type: "text",
    label: "Full Name",
    required: true,
    columnSpan: 12,
  },
  {
    name: "email",
    type: "email",
    label: "Email",
    required: true,
    columnSpan: 6,
  },
  {
    name: "phone",
    type: "tel",
    label: "Phone",
    columnSpan: 6,
  },
  {
    name: "resume",
    type: "file",
    label: "Resume",
    required: true,
    columnSpan: 12,
    accept: ".pdf,.doc,.docx",
    maxFiles: 1,
    maxFileSize: 5 * 1024 * 1024, // 5MB
  },
  {
    name: "coverLetter",
    type: "textarea",
    label: "Cover Letter",
    placeholder: "Tell us why you're a great fit...",
    columnSpan: 12,
  },
];

function JobApplicationForm() {
  return (
    <FormEngine
      api={{
        endpoint: "/api/applications",
        method: "post",
        submissionConfig: { behavior: "showConfirmation" },
      }}
      fields={applicationFields}
      successMessage="Application submitted successfully!"
      formLayoutSettings={{
        submitButtonSetup: {
          submitLabel: "Submit Application",
        },
      }}
    />
  );
}

// ============================================================================
// Example 5: Using formEngineSetup Wrapper (Block Library Pattern)
// ============================================================================

/**
 * This pattern is useful for component/block libraries that want to provide
 * default fields and styles while allowing consumers to override via setup.
 */

const defaultContactFields: FormFieldConfig[] = [
  { name: "email", type: "email", label: "Email", required: true },
  { name: "message", type: "textarea", label: "Message", required: true },
];

const defaultStyleRules: FormEngineStyleRules = {
  formContainer: "bg-card p-6 rounded-lg shadow",
  formClassName: "space-y-4",
  successMessageClassName: "bg-primary text-primary-foreground p-4 rounded",
};

interface ContactBlockProps {
  formEngineSetup?: FormEngineSetup;
}

function ContactBlock({ formEngineSetup }: ContactBlockProps) {
  return (
    <FormEngine
      formEngineSetup={formEngineSetup}
      defaultFields={defaultContactFields}
      defaultStyleRules={defaultStyleRules}
    />
  );
}

// Usage of ContactBlock:
function ContactBlockExample() {
  const setup: FormEngineSetup = {
    api: { endpoint: "/api/contact", method: "post" },
    fields: [
      { name: "name", type: "text", label: "Name", required: true },
      { name: "email", type: "email", label: "Email", required: true },
      { name: "subject", type: "text", label: "Subject" },
      { name: "message", type: "textarea", label: "Message", required: true },
    ],
    formLayoutSettings: {
      submitButtonSetup: { submitLabel: "Get in Touch" },
    },
    successMessage: "Message sent!",
  };

  return <ContactBlock formEngineSetup={setup} />;
}

// ============================================================================
// Example 6: Date and Time Fields
// ============================================================================

const appointmentFields: FormFieldConfig[] = [
  {
    name: "name",
    type: "text",
    label: "Your Name",
    required: true,
    columnSpan: 12,
  },
  {
    name: "date",
    type: "date",
    label: "Preferred Date",
    required: true,
    columnSpan: 6,
  },
  {
    name: "time",
    type: "time",
    label: "Preferred Time",
    required: true,
    columnSpan: 6,
  },
  {
    name: "notes",
    type: "textarea",
    label: "Additional Notes",
    columnSpan: 12,
  },
];

function AppointmentForm() {
  return (
    <FormEngine
      api={{ endpoint: "/api/appointments", method: "post" }}
      fields={appointmentFields}
      successMessage="Appointment request submitted!"
      formLayoutSettings={{
        submitButtonSetup: {
          submitLabel: "Request Appointment",
        },
      }}
    />
  );
}

// ============================================================================
// Exports
// ============================================================================

export {
  BasicContactForm,
  NewsletterSignup,
  RegistrationForm,
  JobApplicationForm,
  ContactBlock,
  ContactBlockExample,
  AppointmentForm,
};
