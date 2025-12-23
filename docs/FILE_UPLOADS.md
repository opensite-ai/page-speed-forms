# File Upload Guide for @page-speed/forms

This guide explains how to implement file uploads in forms using the `FileInput` component and integrate with backend APIs.

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [FileInput Component](#fileinput-component)
- [Upload Flow](#upload-flow)
- [Rails API Integration](#rails-api-integration)
- [Complete Examples](#complete-examples)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)
- [Common Patterns](#common-patterns)
- [Troubleshooting](#troubleshooting)

## Overview

The `FileInput` component provides a complete file upload solution with:

- ✅ Drag-and-drop support
- ✅ File type and size validation
- ✅ Image previews with thumbnails
- ✅ Upload progress indicators
- ✅ Interactive image cropping
- ✅ Multiple file support
- ✅ Accessible file selection
- ✅ Rails API integration helpers

File uploads follow a **two-phase process**:
1. **Upload Phase**: Files are uploaded to a temporary storage endpoint
2. **Association Phase**: Upload tokens are submitted with the form to associate files with the record

This separation allows for:
- Better user experience (files upload immediately)
- Form validation without losing uploaded files
- Support for draft/partial submissions
- Cleanup of abandoned uploads

## Quick Start

### Basic File Upload

```tsx
import React, { useState } from "react";
import { useForm, Form, Field } from "@page-speed/forms";
import { FileInput } from "@page-speed/forms/inputs";

interface MyFormValues {
  name: string;
  resume: File[];
}

function MyForm() {
  const [uploadTokens, setUploadTokens] = useState<string[]>([]);

  const form = useForm<MyFormValues>({
    initialValues: {
      name: "",
      resume: [],
    },
    validationSchema: {
      resume: (value) => {
        if (!value || value.length === 0) return "Resume is required";
        return undefined;
      },
    },
    onSubmit: async (values) => {
      // Submit form with upload tokens
      await submitForm({
        name: values.name,
        uploadTokens: uploadTokens,
      });
    },
  });

  const handleFileUpload = async (files: File[]) => {
    // Upload files and get tokens
    const tokens = await uploadFiles(files);
    setUploadTokens(tokens);
  };

  return (
    <Form form={form}>
      <Field name="resume" label="Resume" required>
        {({ field, meta }) => (
          <FileInput
            {...field}
            accept=".pdf,.doc,.docx"
            maxSize={5 * 1024 * 1024} // 5MB
            onChange={(files) => {
              field.onChange(files);
              handleFileUpload(files);
            }}
            error={meta.touched && !!meta.error}
          />
        )}
      </Field>

      <button type="submit">Submit</button>
    </Form>
  );
}
```

## FileInput Component

### Props Reference

```tsx
interface FileInputProps {
  // Field connection
  name: string;
  value?: File[];
  onChange: (files: File[]) => void;
  onBlur?: () => void;

  // File constraints
  accept?: string;              // MIME types or extensions
  maxSize?: number;             // Max size in bytes (default: 5MB)
  maxFiles?: number;            // Max number of files (default: 1)
  multiple?: boolean;           // Allow multiple files (default: false)

  // UI features
  showPreview?: boolean;        // Show file previews (default: true)
  showProgress?: boolean;       // Show progress bars (default: true)
  uploadProgress?: {            // Upload progress per file (0-100)
    [fileName: string]: number;
  };

  // Image cropping
  enableCropping?: boolean;     // Enable image cropping (default: false)
  cropAspectRatio?: number;     // Crop aspect ratio (e.g., 1, 16/9)
  onCropComplete?: (file: File) => void;

  // State
  disabled?: boolean;
  error?: boolean;
  className?: string;
}
```

### Basic Props

**accept**
- File type filter using MIME types or file extensions
- Examples:
  ```tsx
  accept="image/*"                    // All images
  accept=".pdf,.doc,.docx"           // Specific extensions
  accept="image/*,application/pdf"   // Multiple types
  ```

**maxSize**
- Maximum file size in bytes
- Default: `5 * 1024 * 1024` (5MB)
- Example:
  ```tsx
  maxSize={10 * 1024 * 1024}  // 10MB
  maxSize={500 * 1024}         // 500KB
  ```

**maxFiles**
- Maximum number of files that can be selected
- Default: `1`
- Set `multiple={true}` for multiple files
- Example:
  ```tsx
  multiple
  maxFiles={5}  // Allow up to 5 files
  ```

### Advanced Props

**uploadProgress**
- Object mapping filenames to progress percentages (0-100)
- Used to display upload progress bars
- Example:
  ```tsx
  const [progress, setProgress] = useState<{[fileName: string]: number}>({});

  <FileInput
    uploadProgress={progress}
    onChange={(files) => {
      files.forEach(file => {
        // Upload file and update progress
        uploadFileWithProgress(file, (percent) => {
          setProgress(prev => ({ ...prev, [file.name]: percent }));
        });
      });
    }}
  />
  ```

**enableCropping**
- Enable interactive image cropping for image files
- Shows crop interface after image selection
- Cropped image replaces original in file list
- Example:
  ```tsx
  <FileInput
    accept="image/*"
    enableCropping
    cropAspectRatio={1}  // Square crop
    onCropComplete={(croppedFile) => {
      console.log('Cropped:', croppedFile.name);
    }}
  />
  ```

## Upload Flow

### Phase 1: Immediate File Upload

When a user selects files, immediately upload them to a temporary storage endpoint:

```tsx
const handleFileUpload = async (files: File[]) => {
  const tokens: string[] = [];

  for (const file of files) {
    // Create FormData
    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);
    formData.append("size", String(file.size));

    // Upload to temporary endpoint
    const response = await fetch("/api/uploads/temporary", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    tokens.push(data.token);  // e.g., "upload_abc123"
  }

  setUploadTokens(tokens);
};
```

### Phase 2: Form Submission with Tokens

When the form is submitted, include the upload tokens:

```tsx
onSubmit: async (values) => {
  await fetch("/api/contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: values.name,
      email: values.email,
      upload_tokens: uploadTokens,  // Associate uploads with record
    }),
  });
}
```

### With Progress Tracking

```tsx
const uploadFileWithProgress = async (
  file: File,
  onProgress: (percent: number) => void
) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        onProgress(percent);
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        const data = JSON.parse(xhr.responseText);
        resolve(data.token);
      } else {
        reject(new Error("Upload failed"));
      }
    });

    xhr.addEventListener("error", () => reject(new Error("Upload failed")));

    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", "/api/uploads/temporary");
    xhr.send(formData);
  });
};

// Usage
const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

const handleFileUpload = async (files: File[]) => {
  for (const file of files) {
    const token = await uploadFileWithProgress(file, (percent) => {
      setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
    });
    setUploadTokens(prev => [...prev, token]);
  }
};
```

## Rails API Integration

### Upload Endpoint

The Rails API provides a dedicated endpoint for file uploads:

**Endpoint**: `POST /contacts/_/contact_form_uploads`

**Request Format** (multipart/form-data):
```
contact_form_upload[file_upload]: (file)
contact_form_upload[title]: "Resume.pdf"
contact_form_upload[file_name]: "Resume.pdf"
contact_form_upload[file_size]: "245760"
```

**Response Format**:
```json
{
  "id": 123,
  "token": "abc123xyz789",
  "file_name": "Resume.pdf",
  "file_size": 245760,
  "content_type": "application/pdf",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Complete Upload Function

```tsx
const uploadToRailsAPI = async (file: File): Promise<string> => {
  // Build FormData
  const formData = new FormData();
  formData.append("contact_form_upload[file_upload]", file);
  formData.append("contact_form_upload[title]", file.name);
  formData.append("contact_form_upload[file_name]", file.name);
  formData.append("contact_form_upload[file_size]", String(file.size));

  // Upload to Rails API
  const response = await fetch(
    "https://api.yourapp.com/contacts/_/contact_form_uploads",
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.token;  // Return token for later association
};
```

### Associating Uploads with Contacts

Use the `serializeForRails` helper from `@page-speed/forms/integration`:

```tsx
import { serializeForRails } from "@page-speed/forms/integration";

// In your form submission
const serialized = serializeForRails(
  {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    message: "Hello!",
    contact_form_upload_tokens: uploadTokens,  // Include tokens
  },
  {
    apiKey: "your-api-key",
    contactCategoryToken: "category-token",
    websiteId: "website-id",
  }
);

// Submit to Rails API
const response = await fetch("https://api.yourapp.com/contacts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(serialized),
});
```

The `serializeForRails` function automatically:
- Extracts upload tokens from form values
- Converts `contact_form_upload_tokens` to the correct format
- Removes `upload_` prefix if present
- Includes tokens in the `contact` object

**Serialized Output**:
```json
{
  "api_key": "your-api-key",
  "contact_category_token": "category-token",
  "contact": {
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "content": "Hello!",
    "website_id": "website-id",
    "contact_form_upload_tokens": ["abc123", "xyz789"]
  }
}
```

## Complete Examples

### Example 1: Resume Upload Form

```tsx
import React, { useState, useCallback } from "react";
import { useForm, Form, Field } from "@page-speed/forms";
import { TextInput, FileInput } from "@page-speed/forms/inputs";
import { serializeForRails } from "@page-speed/forms/integration";

interface ResumeFormValues {
  name: string;
  email: string;
  resume: File[];
}

function ResumeForm() {
  const [resumeTokens, setResumeTokens] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ResumeFormValues>({
    initialValues: {
      name: "",
      email: "",
      resume: [],
    },
    validationSchema: {
      name: (value) => !value ? "Name is required" : undefined,
      email: (value) => !value ? "Email is required" : undefined,
      resume: (value) => {
        if (!value || value.length === 0) return "Resume is required";
        return undefined;
      },
    },
    onSubmit: async (values, helpers) => {
      try {
        // Serialize with upload tokens
        const serialized = serializeForRails(
          {
            firstName: values.name.split(" ")[0],
            lastName: values.name.split(" ").slice(1).join(" "),
            email: values.email,
            subject: "Resume Submission",
            contact_form_upload_tokens: resumeTokens,
          },
          {
            apiKey: process.env.NEXT_PUBLIC_API_KEY!,
            contactCategoryToken: "careers",
          }
        );

        const response = await fetch("https://api.yourapp.com/contacts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(serialized),
        });

        if (!response.ok) throw new Error("Submission failed");

        helpers.resetForm();
        setResumeTokens([]);
        setUploadProgress({});
      } catch (error) {
        console.error("Submission error:", error);
        throw error;
      }
    },
  });

  // Handle file upload
  const handleFileUpload = useCallback(async (files: File[]) => {
    if (files.length === 0) return;

    setIsUploading(true);

    try {
      const tokens: string[] = [];

      for (const file of files) {
        // Initialize progress
        setUploadProgress(prev => ({ ...prev, [file.name]: 0 }));

        // Upload file
        const token = await uploadFileWithProgress(
          file,
          (percent) => {
            setUploadProgress(prev => ({ ...prev, [file.name]: percent }));
          }
        );

        tokens.push(token);

        // Mark complete
        setUploadProgress(prev => ({ ...prev, [file.name]: 100 }));
      }

      setResumeTokens(prev => [...prev, ...tokens]);
    } catch (error) {
      console.error("Upload error:", error);
      form.setFieldError("resume", "File upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }, [form]);

  return (
    <Form form={form}>
      <Field name="name" label="Full Name" required showError>
        {({ field, meta }) => (
          <TextInput
            {...field}
            placeholder="John Doe"
            error={meta.touched && !!meta.error}
          />
        )}
      </Field>

      <Field name="email" label="Email" required showError>
        {({ field, meta }) => (
          <TextInput
            {...field}
            type="email"
            placeholder="john@example.com"
            error={meta.touched && !!meta.error}
          />
        )}
      </Field>

      <Field name="resume" label="Resume" required showError>
        {({ field, meta }) => (
          <FileInput
            {...field}
            accept=".pdf,.doc,.docx"
            maxSize={5 * 1024 * 1024}
            maxFiles={1}
            showProgress
            uploadProgress={uploadProgress}
            onChange={(files) => {
              field.onChange(files);
              handleFileUpload(files);
            }}
            disabled={isUploading}
            error={meta.touched && !!meta.error}
          />
        )}
      </Field>

      <button
        type="submit"
        disabled={form.isSubmitting || isUploading}
      >
        {form.isSubmitting ? "Submitting..." : "Submit Application"}
      </button>
    </Form>
  );
}
```

### Example 2: Multiple Image Upload with Cropping

```tsx
import React, { useState } from "react";
import { useForm, Form, Field } from "@page-speed/forms";
import { FileInput } from "@page-speed/forms/inputs";

interface GalleryFormValues {
  title: string;
  images: File[];
}

function GalleryForm() {
  const [imageTokens, setImageTokens] = useState<string[]>([]);

  const form = useForm<GalleryFormValues>({
    initialValues: {
      title: "",
      images: [],
    },
    validationSchema: {
      title: (value) => !value ? "Title is required" : undefined,
      images: (value) => {
        if (!value || value.length === 0) {
          return "At least one image is required";
        }
        if (value.length > 10) {
          return "Maximum 10 images allowed";
        }
        return undefined;
      },
    },
    onSubmit: async (values) => {
      await submitGallery({
        title: values.title,
        imageTokens: imageTokens,
      });
    },
  });

  const handleImageUpload = async (files: File[]) => {
    const tokens = await Promise.all(
      files.map(file => uploadToRailsAPI(file))
    );
    setImageTokens(prev => [...prev, ...tokens]);
  };

  const handleCropComplete = async (croppedFile: File) => {
    // Upload cropped image
    const token = await uploadToRailsAPI(croppedFile);
    setImageTokens(prev => [...prev, token]);
  };

  return (
    <Form form={form}>
      <Field name="title" label="Gallery Title" required>
        {({ field }) => <TextInput {...field} />}
      </Field>

      <Field name="images" label="Images" required showError>
        {({ field, meta }) => (
          <FileInput
            {...field}
            accept="image/*"
            multiple
            maxFiles={10}
            maxSize={10 * 1024 * 1024}
            enableCropping
            cropAspectRatio={16 / 9}
            onCropComplete={handleCropComplete}
            onChange={(files) => {
              field.onChange(files);
              handleImageUpload(files);
            }}
            error={meta.touched && !!meta.error}
          />
        )}
      </Field>

      <button type="submit">Create Gallery</button>
    </Form>
  );
}
```

### Example 3: Document Upload with Validation

```tsx
import React, { useState } from "react";
import { useForm, Form, Field } from "@page-speed/forms";
import { FileInput } from "@page-speed/forms/inputs";

interface DocumentFormValues {
  documents: File[];
}

// Custom file validation
const validateDocuments = (files: File[]) => {
  if (!files || files.length === 0) {
    return "At least one document is required";
  }

  // Check file types
  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  for (const file of files) {
    if (!allowedTypes.includes(file.type)) {
      return `${file.name}: Only PDF and Word documents are allowed`;
    }
  }

  // Check total size
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxTotalSize = 20 * 1024 * 1024; // 20MB

  if (totalSize > maxTotalSize) {
    return "Total file size cannot exceed 20MB";
  }

  return undefined;
};

function DocumentForm() {
  const [documentTokens, setDocumentTokens] = useState<string[]>([]);

  const form = useForm<DocumentFormValues>({
    initialValues: {
      documents: [],
    },
    validationSchema: {
      documents: validateDocuments,
    },
    onSubmit: async (values) => {
      await submitDocuments(documentTokens);
    },
  });

  const handleDocumentUpload = async (files: File[]) => {
    const tokens = await Promise.all(
      files.map(file => uploadToRailsAPI(file))
    );
    setDocumentTokens(tokens);
  };

  return (
    <Form form={form}>
      <Field name="documents" label="Documents" required showError>
        {({ field, meta }) => (
          <FileInput
            {...field}
            accept=".pdf,.doc,.docx"
            multiple
            maxFiles={5}
            maxSize={10 * 1024 * 1024}
            onChange={(files) => {
              field.onChange(files);
              handleDocumentUpload(files);
            }}
            error={meta.touched && !!meta.error}
          />
        )}
      </Field>

      <button type="submit">Submit Documents</button>
    </Form>
  );
}
```

## Advanced Features

### Image Cropping

Enable interactive image cropping for image files:

```tsx
<FileInput
  accept="image/*"
  enableCropping
  cropAspectRatio={1}  // Square
  onCropComplete={(croppedFile) => {
    console.log("Cropped file:", croppedFile);
    // Upload cropped file
    uploadToRailsAPI(croppedFile);
  }}
/>
```

**Crop Aspect Ratios**:
- `1` - Square (1:1)
- `16/9` - Landscape (16:9)
- `9/16` - Portrait (9:16)
- `4/3` - Classic (4:3)
- `undefined` - Free form

### File Validation

**Built-in validation** via props:
```tsx
<FileInput
  accept="image/*"
  maxSize={5 * 1024 * 1024}
  maxFiles={3}
/>
```

**Custom validation** in schema:
```tsx
validationSchema: {
  files: (value) => {
    if (!value || value.length === 0) {
      return "Files are required";
    }

    // Check file names
    const hasDuplicates = new Set(value.map(f => f.name)).size !== value.length;
    if (hasDuplicates) {
      return "Duplicate file names detected";
    }

    // Check file extensions
    for (const file of value) {
      if (!file.name.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return `${file.name}: Invalid file type`;
      }
    }

    return undefined;
  },
}
```

### Upload Progress

Track upload progress for better UX:

```tsx
const [uploadProgress, setUploadProgress] = useState<{[key: string]: number}>({});

const uploadWithProgress = async (file: File) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const percent = Math.round((e.loaded / e.total) * 100);
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: percent
        }));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error("Upload failed"));
      }
    });

    const formData = new FormData();
    formData.append("file", file);

    xhr.open("POST", "/api/upload");
    xhr.send(formData);
  });
};

<FileInput
  showProgress
  uploadProgress={uploadProgress}
  onChange={handleUpload}
/>
```

### Error Handling

Handle upload errors gracefully:

```tsx
const handleFileUpload = async (files: File[]) => {
  try {
    const tokens = await Promise.all(
      files.map(async (file) => {
        try {
          return await uploadToRailsAPI(file);
        } catch (error) {
          throw new Error(`Failed to upload ${file.name}: ${error.message}`);
        }
      })
    );
    setUploadTokens(tokens);
  } catch (error) {
    // Set field-level error
    form.setFieldError("files", error.message);

    // Or show toast notification
    showToast({
      type: "error",
      message: "Some files failed to upload",
    });
  }
};
```

## Best Practices

### 1. Upload Immediately on Selection

Upload files as soon as they're selected, not on form submission:

```tsx
✅ Good - Upload immediately
<FileInput
  onChange={(files) => {
    field.onChange(files);
    uploadFiles(files);  // Upload now
  }}
/>

❌ Bad - Wait until submit
<FileInput
  onChange={field.onChange}
/>
// Upload in onSubmit (slow, can fail)
```

### 2. Show Upload Progress

Always show progress for better UX:

```tsx
const [uploadProgress, setUploadProgress] = useState({});

<FileInput
  showProgress
  uploadProgress={uploadProgress}
  // Update progress during upload
/>
```

### 3. Validate File Types and Sizes

Set constraints to prevent invalid uploads:

```tsx
<FileInput
  accept=".pdf,.doc,.docx"
  maxSize={5 * 1024 * 1024}  // 5MB
  maxFiles={3}
/>
```

### 4. Handle Upload Errors

Provide clear error messages:

```tsx
try {
  await uploadFiles(files);
} catch (error) {
  form.setFieldError("files", "Upload failed. Please try again.");
}
```

### 5. Clean Up on Form Reset

Clear upload tokens when form is reset:

```tsx
onSubmit: async (values, helpers) => {
  try {
    await submitForm(values);
    helpers.resetForm();
    setUploadTokens([]);  // Clear tokens
    setUploadProgress({});  // Clear progress
  } catch (error) {
    // Handle error
  }
}
```

### 6. Disable Submit During Upload

Prevent form submission while files are uploading:

```tsx
const [isUploading, setIsUploading] = useState(false);

<button
  type="submit"
  disabled={form.isSubmitting || isUploading}
>
  Submit
</button>
```

### 7. Store Tokens in State

Keep upload tokens in component state, separate from form values:

```tsx
✅ Good
const [uploadTokens, setUploadTokens] = useState<string[]>([]);
// Use tokens in onSubmit

❌ Bad
// Don't store tokens in form values
initialValues: {
  files: [],
  tokens: [],  // Don't do this
}
```

### 8. Use TypeScript for Type Safety

Define proper types for form values:

```tsx
interface FormValues {
  name: string;
  resume: File[];  // Files, not tokens
}

const [resumeTokens, setResumeTokens] = useState<string[]>([]);
```

## Common Patterns

### Pattern 1: Multiple File Fields

Handle multiple file upload fields in one form:

```tsx
const [resumeTokens, setResumeTokens] = useState<string[]>([]);
const [portfolioTokens, setPortfolioTokens] = useState<string[]>([]);

<Field name="resume" label="Resume">
  {({ field }) => (
    <FileInput
      {...field}
      onChange={(files) => {
        field.onChange(files);
        uploadFiles(files, setResumeTokens);
      }}
    />
  )}
</Field>

<Field name="portfolio" label="Portfolio">
  {({ field }) => (
    <FileInput
      {...field}
      multiple
      onChange={(files) => {
        field.onChange(files);
        uploadFiles(files, setPortfolioTokens);
      }}
    />
  )}
</Field>

// In onSubmit
onSubmit: async (values) => {
  await submitForm({
    ...values,
    resumeTokens,
    portfolioTokens,
  });
}
```

### Pattern 2: Optional File Upload

Make file upload optional with conditional validation:

```tsx
validationSchema: {
  files: (value) => {
    // Only validate if files were selected
    if (!value || value.length === 0) return undefined;

    // Validate selected files
    const totalSize = value.reduce((sum, f) => sum + f.size, 0);
    if (totalSize > 10 * 1024 * 1024) {
      return "Total size cannot exceed 10MB";
    }

    return undefined;
  },
}
```

### Pattern 3: Prefilled File List

Show previously uploaded files:

```tsx
interface FormValues {
  files: File[];
  existingFileIds: number[];
}

const form = useForm<FormValues>({
  initialValues: {
    files: [],
    existingFileIds: [1, 2, 3],  // IDs of existing files
  },
  onSubmit: async (values) => {
    await submitForm({
      newFileTokens: uploadTokens,
      existingFileIds: values.existingFileIds,
    });
  },
});

// Show existing files separately
{existingFiles.map(file => (
  <div key={file.id}>
    {file.name}
    <button onClick={() => removeExistingFile(file.id)}>Remove</button>
  </div>
))}

// Show new file upload
<FileInput ... />
```

### Pattern 4: Drag and Drop Zone

The FileInput component includes built-in drag-and-drop support:

```tsx
<FileInput
  {...field}
  accept="image/*"
  multiple
  // Drag-and-drop automatically enabled
/>

// No additional configuration needed
// Users can drag files onto the component
```

### Pattern 5: File Preview Gallery

Display uploaded files in a gallery:

```tsx
const [files, setFiles] = useState<File[]>([]);

<FileInput
  value={files}
  multiple
  showPreview  // Shows thumbnails
  onChange={setFiles}
/>

// FileInput automatically shows:
// - Image thumbnails for image files
// - File icons for documents
// - File names and sizes
// - Remove buttons
```

### Pattern 6: Upload Retry Logic

Implement retry logic for failed uploads:

```tsx
const uploadWithRetry = async (
  file: File,
  maxRetries = 3
): Promise<string> => {
  let lastError;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await uploadToRailsAPI(file);
    } catch (error) {
      lastError = error;
      console.log(`Upload attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }

  throw lastError;
};
```

## Troubleshooting

### Problem: Files not associated with contact record

**Symptom**: Files upload successfully but aren't linked to the contact in Rails.

**Solution**: Ensure you're including upload tokens in the form submission:

```tsx
// ✅ Correct
await submitContactForm({
  values: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    contact_form_upload_tokens: uploadTokens,  // Include tokens
  },
  contactCategoryToken: "...",
});

// ❌ Wrong
await submitContactForm({
  values: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    // Missing upload tokens
  },
  contactCategoryToken: "...",
});
```

### Problem: Upload tokens stored in custom_fields instead of contact_form_upload_tokens

**Symptom**: Tokens appear in `custom_fields` hash but not in `contact_form_upload_tokens` array.

**Solution**: Use the exact key name `contact_form_upload_tokens` (with underscores):

```tsx
// ✅ Correct
contact_form_upload_tokens: uploadTokens

// ❌ Wrong
contactFormUploadTokens: uploadTokens  // camelCase won't work
uploadTokens: uploadTokens  // Different key name
resumeTokens: uploadTokens  // Different key name
```

### Problem: "upload_" prefix causing issues

**Symptom**: Rails API rejects tokens with "upload_" prefix.

**Solution**: The `serializeForRails` function automatically strips the prefix. If using custom submission:

```tsx
// Strip "upload_" prefix before sending
const tokens = uploadTokens.map(token => token.replace(/^upload_/, ""));

await fetch("/api/contacts", {
  body: JSON.stringify({
    contact: {
      contact_form_upload_tokens: tokens,  // Without prefix
    },
  }),
});
```

### Problem: File upload fails with CORS error

**Symptom**: Browser console shows CORS policy error.

**Solution**: Ensure your API allows cross-origin requests:

```ruby
# Rails: config/application.rb or config/initializers/cors.rb
config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://your-frontend-domain.com'
    resource '/contacts/_/contact_form_uploads',
      methods: [:post],
      headers: :any
  end
end
```

### Problem: Large files fail to upload

**Symptom**: Upload works for small files but fails for large files.

**Solution**: Check server-side file size limits:

```ruby
# Rails: config/application.rb
config.middleware.use Rack::TempfileReaper
config.action_dispatch.default_headers['X-Content-Type-Options'] = 'nosniff'

# Increase max request size (e.g., 50MB)
config.middleware.use Rack::Protection::JsonCsrf, max_body_size: 50 * 1024 * 1024
```

### Problem: Upload progress not updating

**Symptom**: Progress bar stays at 0% or 100%.

**Solution**: Use XMLHttpRequest instead of fetch for progress tracking:

```tsx
// ✅ Correct - XMLHttpRequest supports progress
const xhr = new XMLHttpRequest();
xhr.upload.addEventListener("progress", (e) => {
  const percent = Math.round((e.loaded / e.total) * 100);
  setProgress(prev => ({ ...prev, [file.name]: percent }));
});

// ❌ Wrong - fetch doesn't support upload progress
fetch("/api/upload", { method: "POST", body: formData });
```

### Problem: Image cropping not working

**Symptom**: Cropping interface doesn't appear for image files.

**Solution**: Ensure you're using image MIME types in accept:

```tsx
// ✅ Correct
<FileInput
  accept="image/*"
  enableCropping
/>

// ❌ Wrong - Won't recognize as images
<FileInput
  accept=".jpg,.png"
  enableCropping
/>
```

### Problem: Validation errors don't clear after upload

**Symptom**: Error message persists after successfully uploading files.

**Solution**: Clear the field error after successful upload:

```tsx
const handleFileUpload = async (files: File[]) => {
  try {
    const tokens = await uploadFiles(files);
    setUploadTokens(tokens);

    // Clear any previous errors
    form.setFieldError("files", undefined);
  } catch (error) {
    form.setFieldError("files", "Upload failed");
  }
};
```

### Problem: Form submits before upload completes

**Symptom**: Form submission happens while files are still uploading.

**Solution**: Disable submit button during upload:

```tsx
const [isUploading, setIsUploading] = useState(false);

const handleFileUpload = async (files: File[]) => {
  setIsUploading(true);
  try {
    await uploadFiles(files);
  } finally {
    setIsUploading(false);
  }
};

<button
  type="submit"
  disabled={form.isSubmitting || isUploading}
>
  {isUploading ? "Uploading..." : "Submit"}
</button>
```

---

## Need Help?

- **Examples**: See `/prototypes/client-cli-select/components/forms/CareersForm.tsx` for a complete working example
- **API Reference**: Check the Rails API documentation at your API endpoint
- **Issues**: Report issues at [GitHub Issues](https://github.com/opensite-ai/page-speed-forms/issues)
- **Questions**: Ask in [GitHub Discussions](https://github.com/opensite-ai/page-speed-forms/discussions)

## Contributing

Found a file upload pattern that would benefit others? Consider contributing it to this guide! See [CONTRIBUTING.md](../CONTRIBUTING.md) for details.
