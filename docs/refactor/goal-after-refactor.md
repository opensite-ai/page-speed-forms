# Goal After Refactor

## Standard Form

```tsx
const api = {
  apiKey: "02d522b2-49b7-413d-8a77-0d5543e1915d",
  contactCategoryToken: "cad2947a-49b5-491e-jhd87-c0cd828291f3",
  websiteId: "435",
  endpoint: "https://api.dashtrack.com/contacts",
  method: "post",
};

const styleRules = {
  formContainer: "mt-10 flex w-full flex-col", // div wrapper around the <form> tag should have basic defaults for each
  fieldsContainer: "grid grid-cols-12 gap-6 md:gap-10", // div wrapper around the fields
  ...declarative naming for each key 'level' and the ability to supply a custom class name
};

<FormEngine
  api={api}
  fields={[
    {
      name: "name",
      type: "text",
      label: "Full Name",
      placeholder: "Full Name",
      required: true,
      columnSpan: 6,
    },
    {
      name: "email",
      type: "email",
      label: "Email",
      placeholder: "your@email.com",
      required: true,
      columnSpan: 6,
    },
    {
      name: "subject",
      type: "text",
      label: "Subject",
      placeholder: "What is this regarding?",
      required: true,
      columnSpan: 12,
    },
    {
      name: "content",
      type: "textarea",
      label: "Message",
      placeholder: "Please describe your question in detail...",
      required: true,
      rows: 5,
      columnSpan: 12,
    },
  ]}
  formLayoutSettings={{
    styleRules,
    submitButtonSetup: {
      submitLabel: <span className="flex items-center justify-center gap-2">
        <span>Signup</span>
        <Icon name="lucide/send"  />
      </span>,
      submitVariant: "outline",
    },
  }}
/>
```


## Button Group Form

```tsx
const api = {
  apiKey: "02d522b2-49b7-413d-8a77-0d5543e1915d",
  contactCategoryToken: "cad2947a-49b5-491e-b7a5-c0cd828291f3",
  websiteId: "435",
  endpoint: "https://api.dashtrack.com/contacts",
  method: "post",
};

const styleRules = {
  formContainer: "mt-10 flex w-full max-w-md flex-col gap-4 sm:flex-row", // div wrapper around the <form> tag should have basic defaults for each
  fieldsContainer: "flex w-full items-center justify-center", // div wrapper around the field(s) but in this case for a button group form it will just be the 1 div wrapper for the button group form
  fieldClassName: "space-y-2", // can also be overridden by the field's className prop, this is a general classname applied to all field divs
  ...
};

<FormEngine
  api={api}
  fields={[{
    name: "email",
    type: "email",
    label: "Email Address",
    placeholder: "Enter your email",
    className: "font-serif",
    required: true,
    columnSpan: 12,
  }]}
  formLayoutSettings={{
    styleRules,
    formLayout: "button-group",
    buttonGroundSetup: {
      size: "lg",
      submitLabel: <span className="flex items-center justify-center gap-2">
        <span>Signup</span>
        <Icon name="lucide/send"  />
      </span>,
      ...any other custom button group form settings
    },
  }}
/>
```

## Advanced Usage

- Make callback functions available for the functions from the other 2 examples such as handleSubmission (returns the form data), handleSuccess (returns the data response from the server), and handleFailure (returns the error response from the server).
- We don't need to immediately build this out extensively, but eventually will need tooling just as onFormChange that will give the ability to get the real time state of the form data.
