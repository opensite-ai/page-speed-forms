# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-01-19

### Added

#### Core Form Management
- **useForm hook** - Main hook for form state management with field-level reactivity via Legend State
- **Form component** - Wrapper component that provides form context and handles submission
- **Field component** - Flexible field renderer with render props pattern for custom field UIs
- **FormStatus component** - Display form-wide status messages (success, error, info)
- **FormErrors component** - Display form-wide error messages with customizable rendering

#### Built-in Input Components
- **TextInput** - Standard text input with label, error display, and full accessibility
- **EmailInput** - Email-specific input with type="email" and email validation
- **PasswordInput** - Password input with optional show/hide toggle functionality
- **SearchInput** - Search input with type="search" and search-specific styling
- **NumberInput** - Number input with type="number" and numeric validation
- **TelInput** - Telephone input with type="tel" formatting
- **UrlInput** - URL input with type="url" and URL validation
- **TextareaInput** - Multi-line textarea with auto-resize support
- **DateInput** - Date picker with type="date" and date validation

All input components include:
- Integrated label and error message display
- Full keyboard and screen reader accessibility
- Customizable styling via className props
- TypeScript type safety

#### Validation System
- **Synchronous validation** - Field-level and form-level validation functions
- **Asynchronous validation** - Support for async validators (e.g., API calls)
- **Validation timing** - Configurable validation triggers (onChange, onBlur, onSubmit)
- **Custom validators** - Simple function-based validators that return error strings
- **Form-level validation** - Cross-field validation and complex business rules
- **Validation state tracking** - Per-field error state with touched/dirty tracking

#### Valibot Adapter
- **Schema-based validation** - Integrate Valibot schemas for type-safe validation
- **Automatic error extraction** - Convert Valibot validation errors to form error format
- **Nested object support** - Handle nested objects and arrays in schemas
- **Optional integration** - Valibot as optional peer dependency (tree-shakeable)

#### File Upload System
- **FileUpload component** - Complete file upload UI with drag-and-drop support
- **Progress tracking** - Upload progress indicators
- **File validation** - File type and size validation
- **Multiple file support** - Handle single or multiple file uploads
- **Custom upload handlers** - Flexible upload function integration
- **Preview support** - Image preview before and after upload

#### Form State & Helpers
- **Field-level reactivity** - Only re-renders affected fields when values change
- **Form state management** - Centralized state for values, errors, touched, dirty, submitting
- **Form actions** - setFieldValue, setFieldError, setFieldTouched, setStatus, reset, submit
- **Field metadata** - Access to field state (value, error, touched, dirty) via meta object
- **Form helpers** - Helper functions for common form operations
- **Type-safe APIs** - Full TypeScript support with type inference

#### Developer Experience
- **Tree-shakeable architecture** - Granular exports for optimal bundle sizes
- **Multiple entry points** - Import only what you need (/core, /inputs, /validation, /upload)
- **Zero configuration** - Works out of the box with sensible defaults
- **Platform-agnostic** - Pure React, no framework dependencies (Next.js, Remix, etc.)
- **Comprehensive TypeScript** - Full type safety with type inference and strict typing

### Developer Notes

#### Architecture
- Built on [@legendapp/state](https://legendapp.com/open-source/state/) for fine-grained reactivity
- Platform-agnostic React library (no Next.js or framework-specific dependencies)
- Tree-shakeable exports via package.json exports map
- Side-effect free (sideEffects: false in package.json)

#### Bundle Size
- Core library: ~10-12 KB gzipped
- Individual input components: ~2-3 KB each (tree-shakeable)
- Valibot adapter: ~1-2 KB (optional, tree-shakeable)

#### Test Coverage
- 25 passing tests across core, inputs, and validation
- 86% code coverage
- Unit tests for all core functionality
- Integration tests for useForm, Form, Field, and validation system
- Component tests for all built-in inputs

#### Known Limitations
- dt-cms integration test blocked by external streamdown/katex ESM CSS import issue
- File upload requires custom upload handler implementation
- No built-in server-side rendering (SSR) support yet (planned for Phase 2)

#### Browser Support
- Modern browsers with ES2020 support
- React 16.8+ (hooks support required)
- No IE11 support

### Documentation
- Comprehensive README with getting started guide
- API documentation for all exports
- Usage examples for common patterns
- TypeScript type definitions included

### Future Roadmap
- See PHASE_2_PLAN.md for detailed Phase 2 features:
  - Advanced validation (cross-field, async debouncing, validation rules)
  - Form arrays and dynamic fields
  - Additional validation adapters (Zod, Yup, Joi)
  - More built-in components (Select, RadioGroup, DatePicker, etc.)
  - Form builder integration
  - Accessibility enhancements
  - Performance optimizations

[0.1.0]: https://github.com/opensite-ai/page-speed-forms/releases/tag/v0.1.0
