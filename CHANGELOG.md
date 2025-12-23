# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2025-12-22

### Added

#### Phase 2.2: Built-in Input Components Expansion

**Date and Time Components**
- **DatePicker** - Calendar-based date selection with popup interface
  - Configurable date format (default: "MM/dd/yyyy")
  - Min/max date constraints for restricting selectable dates
  - Custom date disabling via `isDateDisabled` function
  - Calendar navigation (previous/next month, year selection)
  - "Today" button for quick current date selection
  - Clearable option with clear button
  - Manual text input with automatic date parsing
  - Keyboard navigation (Enter to confirm, Escape to close)
  - Full accessibility with ARIA attributes

- **TimePicker** - Hour/minute/period time selection
  - 12-hour and 24-hour format support
  - Configurable minute step intervals (1, 5, 15, 30, etc.)
  - Separate hour, minute, and period (AM/PM) columns
  - Clearable option with clear button
  - Keyboard navigation support
  - Proper midnight (12:00 AM) and noon (12:00 PM) handling
  - Full accessibility with ARIA attributes

- **DateRangePicker** - Date range selection with start and end dates
  - Interactive calendar for selecting date ranges
  - Visual range highlighting during selection
  - Hover preview of potential range selection
  - Automatic date swapping (if end date is before start date)
  - Customizable separator between dates (default: " - ")
  - Min/max date constraints
  - Custom date disabling via `isDateDisabled` function
  - Clearable option to reset range
  - Full accessibility with ARIA attributes

**Rich Text Editor**
- **RichTextEditor** - WYSIWYG and Markdown editor with toolbar
  - WYSIWYG mode with contentEditable
  - Markdown mode for direct markdown editing
  - Mode switching between WYSIWYG and Markdown
  - Automatic HTML ↔ Markdown conversion
  - Rich toolbar with formatting buttons:
    - Bold, Italic, Underline
    - Heading levels (H1, H2, H3)
    - Bulleted and numbered lists
    - Link insertion with URL prompt
  - Configurable min/max height constraints
  - Custom toolbar button support
  - Hidden input for form integration
  - Full accessibility with contentEditable semantics

**Enhanced Select Component**
- Multi-select functionality via `multiple` prop
  - Multi-value display with removable tags
  - Keyboard support for tag removal (Backspace)
  - "Select All" / "Clear All" buttons for multi-select
  - Maintains all existing single-select features

**Enhanced FileInput Component**
- Upload progress indicators
  - Progress bar display with percentage
  - Per-file progress tracking via `uploadProgress` prop
  - Toggle via `showProgress` prop
  - ARIA progressbar attributes for accessibility

- Image cropping functionality
  - Interactive crop interface with zoom slider
  - Customizable aspect ratio (e.g., 1:1, 16:9, 4:3)
  - Crop overlay with visual guidelines
  - Save/Cancel actions in modal dialog
  - `onCropComplete` callback with cropped file
  - Automatic object URL cleanup
  - Only available for image files

**New Type Exports**
- `DatePickerProps` - Props interface for DatePicker
- `TimePickerProps` - Props interface for TimePicker
- `TimeValue` - Interface for time value structure
- `DateRangePickerProps` - Props interface for DateRangePicker
- `DateRange` - Interface for date range (start/end)
- `RichTextEditorProps` - Props interface for RichTextEditor
- `EditorMode` - Type for editor mode ("wysiwyg" | "markdown")
- `ToolbarButton` - Interface for custom toolbar buttons
- `FileUploadProgress` - Interface for upload progress tracking
- `CropArea` - Interface for image crop area definition

### Changed

- Enhanced `Select` component to support both single and multi-select modes
- Enhanced `FileInput` component with progress tracking and image cropping
- Updated input component exports in `/inputs` entry point
- Improved BEM-style CSS class naming for new components

### Documentation

- Added comprehensive "Built-in Input Components" section to README
- Documented all Phase 2.2 components with usage examples
- Added props documentation for DatePicker, TimePicker, DateRangePicker
- Documented RichTextEditor modes and toolbar features
- Added FileInput progress and cropping feature documentation
- Updated exports documentation with new types

### Testing

- Added comprehensive test suite for DatePicker (692 lines, 48 tests)
  - Basic rendering, calendar popup, date selection
  - Date constraints (min/max, custom disabled)
  - Clear functionality, manual input parsing
  - Keyboard navigation, disabled state
  - Accessibility, CSS classes, component metadata

- Added comprehensive test suite for TimePicker (696 lines, 44 tests)
  - Basic rendering, time picker popup, 12/24-hour modes
  - Hour/minute/period selection, minuteStep intervals
  - Clear functionality, disabled state
  - Accessibility, CSS classes, component metadata

- Added comprehensive test suite for DateRangePicker (774 lines, 51 tests)
  - Basic rendering, calendar popup, range selection
  - Date swapping, hover effects, range highlighting
  - Date constraints, clear functionality
  - Accessibility, CSS classes, component metadata

- Added comprehensive test suite for RichTextEditor (642 lines, 41 tests)
  - Basic rendering, WYSIWYG mode, Markdown mode
  - Toolbar button actions, document.execCommand
  - Mode switching, HTML ↔ Markdown conversion
  - Disabled state, accessibility, CSS classes

- Enhanced FileInput test suite (+499 lines, +22 tests)
  - Progress indicator rendering and updates
  - Multiple file progress tracking
  - ARIA attributes on progress bars
  - Image cropping modal and UI elements
  - Crop button visibility and interactions
  - Custom aspect ratio support
  - Object URL cleanup

- Total test coverage: 767 passing tests
- All new components follow consistent test patterns

### Developer Notes

- All new components work with Tailwind CSS 3 and 4
- Platform-agnostic (no Next.js/framework dependencies)
- Tree-shakeable imports via granular exports
- BEM-style CSS class naming for easy styling
- Full TypeScript type safety with strict mode
- Zero breaking changes - fully backward compatible
- Follows Phase 2.1 patterns for consistency

## [0.2.4] - 2025-01-22

### Added

#### Phase 2.1: Advanced Validation Features

**Cross-Field Validation**
- `crossFieldValidator()` utility for validating fields that depend on other field values
- Support for `allValues` parameter in all validators for accessing form-wide state
- `matches()` validator for password confirmation and field matching scenarios
- Automatic revalidation when dependent fields change

**Async Validation with Debouncing**
- `debounce()` utility for debouncing async validators
- `asyncValidator()` wrapper combining debounce with race condition prevention
- Configurable debounce timing with `delay`, `leading`, and `trailing` options
- Race condition prevention ensures only latest async validation result is used
- Optimal for API-based validation (username availability, email verification, etc.)

**Validation Rules Library**
- 17 pre-built, tree-shakable validation rules
- `required()` - Required field validation with support for arrays and objects
- `email()` - RFC 5322 compliant email validation
- `url()` - URL format validation using URL constructor
- `phone()` - US phone number validation with flexible formatting
- `minLength()` / `maxLength()` - String and array length validation
- `min()` / `max()` - Numeric range validation
- `pattern()` - Custom regex pattern matching
- `oneOf()` - Enum/whitelist validation
- `creditCard()` - Credit card validation with Luhn algorithm
- `postalCode()` - US ZIP code validation (5 or 9 digit)
- `alpha()` - Alphabetic characters only
- `alphanumeric()` - Letters and numbers only
- `numeric()` - Valid number validation
- `integer()` - Whole number validation
- `compose()` - Combine multiple validators in sequence

**Custom Error Messages & i18n**
- `MessageRegistry` class for managing error messages
- `setErrorMessages()` for global error message customization
- Template functions with parameter interpolation (e.g., `({ min }) => \`Must be ${min} characters\``)
- Per-field message overrides via `message` option
- Full internationalization support for multi-language applications
- `defaultMessages` export with sensible English defaults
- `getErrorMessage()` and `resetErrorMessages()` utilities

**Additional Validation Utilities**
- `when()` conditional validator for validating based on form state
- `withRaceConditionPrevention()` for custom async validators
- Validation metadata tracking integrated with `@opensite/hooks` useMap

**Enhanced useForm Integration**
- Field-level validation metadata tracking (validationCount, lastValidated)
- Validation in progress tracking to prevent race conditions
- Support for validator arrays per field
- Automatic revalidation on field change when configured
- Enhanced `getFieldMeta()` with validation metadata

### Changed

- Integrated `@opensite/hooks` v0.1.0 for enhanced field metadata management
- Updated `getFieldMeta()` to include `validationCount` and `lastValidated` metadata
- Improved validation error handling with try-catch blocks
- Enhanced type definitions for `FieldMeta` interface

### Documentation

- Added comprehensive "Advanced Validation Features" section to README
- Documented all 17 validation rules with examples and parameter tables
- Added async validation with debouncing examples
- Documented cross-field validation patterns (two methods)
- Added custom error messages and i18n documentation with examples
- Included conditional validation patterns

### Developer Notes

- All validation utilities are tree-shakeable via granular imports
- Validation rules export from `/validation/rules` entry point
- Validation utilities export from `/validation/utils` entry point
- Zero breaking changes - fully backward compatible
- Test coverage maintained at 561 passing tests

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
