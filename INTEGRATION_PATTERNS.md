# @page-speed/forms Integration Patterns

This document explains how to integrate @page-speed/forms with different rendering systems and frameworks. It covers the architectural principles, available integration utilities, and implementation examples.

## Table of Contents

- [Architectural Philosophy](#architectural-philosophy)
- [Integration Utilities](#integration-utilities)
- [Integration Patterns](#integration-patterns)
  - [ChaiBuilder Integration (builder-sdk)](#chaibuilder-integration-builder-sdk)
  - [Rendering Runtime Integration (opensite-blocks)](#rendering-runtime-integration-opensite-blocks)
- [Comparison](#comparison)
- [Custom Integrations](#custom-integrations)
- [Best Practices](#best-practices)

## Architectural Philosophy

@page-speed/forms is designed as a **pure, framework-agnostic React library**. This means:

1. **No Framework Dependencies**: The library has zero dependencies on specific builder tools, page builders, or rendering frameworks
2. **Generic Adapter Patterns**: Integration utilities are provided as generic adapters that can be used with any system
3. **Consumer Responsibility**: Applications consuming @page-speed/forms are responsible for creating platform-specific implementations
4. **Tree-Shakable**: Only import what you need - unused components and utilities are automatically excluded from builds

### Why This Matters

This architecture ensures:
- **Portability**: Use @page-speed/forms with any React-based system
- **Maintainability**: Library updates don't break specific platform integrations
- **Bundle Size**: Applications only include the code they actually use
- **Flexibility**: Integrate with existing systems without forcing architectural changes

## Integration Utilities

@page-speed/forms provides generic utilities in the `@page-speed/forms/integration` module:

### `createBlockAdapter`

A generic adapter factory for wrapping form components to work with block-based systems.

**Type Signature**:
```typescript
function createBlockAdapter<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  options: BlockAdapterOptions<P>
): React.ComponentType<BlockProps<P>>
```

**Options**:
- `defaultProps` - Default props for all instances
- `transformProps` - Function to transform block props to component props
- `withErrorBoundary` - Enable React error boundaries (default: true)
- `errorFallback` - Custom error UI component

**Example**:
```typescript
import { TextInput } from "@page-speed/forms/inputs";
import { createBlockAdapter, standardInputTransformer } from "@page-speed/forms/integration";

const TextInputBlock = createBlockAdapter(TextInput, {
  defaultProps: {
    type: "text",
    placeholder: "Enter text...",
  },
  transformProps: (blockProps, block) => {
    const baseProps = standardInputTransformer(blockProps, block);
    return {
      ...baseProps,
      name: blockProps.name || `field-${block._id}`,
    };
  },
  withErrorBoundary: true,
});
```

### `standardInputTransformer`

A helper function that provides standard ChaiBlock → component prop mapping:
- Maps `ChaiBlock.content` to `label` prop
- Maps `ChaiBlock.styles` to `className` prop
- Extracts `ChaiBlock.blockProps` for additional props
- Returns common form field props (name, required, disabled, etc.)

**Type Signature**:
```typescript
function standardInputTransformer(
  blockProps: Record<string, unknown>,
  block: ChaiBlock
): StandardInputProps
```

**Example**:
```typescript
import { standardInputTransformer } from "@page-speed/forms/integration";

const props = standardInputTransformer(blockProps, block);
// {
//   label: block.content,
//   className: extractedClassName,
//   name: blockProps.name,
//   required: blockProps.required,
//   disabled: blockProps.disabled,
//   ...
// }
```

## Integration Patterns

### ChaiBuilder Integration (builder-sdk)

**Use Case**: Visual page builder with drag-and-drop blocks and sidebar configuration.

**System**: ChaiBuilder-based applications using `@chaibuilder/runtime`.

**Implementation**: [@opensite/builder-sdk](https://github.com/Toastability/builder-sdk)

#### How It Works

1. **Wrap Components**: Use `createChaiBlockAdapter` to wrap form components
2. **Define Block Configs**: Create ChaiBuilder block configurations with visual properties
3. **Register Blocks**: Use `registerChaiBlock` to make blocks available in the builder sidebar
4. **User Interaction**: Users drag blocks into the canvas, configure props via UI, and save design payloads

#### Example Implementation

```typescript
// File: builder-sdk/src/web-blocks/page-speed-forms.tsx
import { registerChaiBlock } from "@chaibuilder/runtime";
import { TextInput } from "@page-speed/forms/inputs";
import { createChaiBlockAdapter, standardInputTransformer } from "@page-speed/forms/integration";
import { Single } from "@/helpers";

// Create adapted component
export const TextInputBlock = createChaiBlockAdapter(TextInput, {
  defaultProps: {
    type: "text",
    placeholder: "Enter text...",
  },
  transformProps: (blockProps, block) => {
    const baseProps = standardInputTransformer(blockProps, block);
    return {
      ...baseProps,
      name: blockProps.name || `field-${block._id}`,
      disabled: blockProps.disabled === true,
    };
  },
  withErrorBoundary: true,
});

// Define builder configuration
export const TextInputConfig = {
  type: "TextInput",
  label: "Text Input",
  category: "form",
  icon: "Type",
  group: "page-speed-forms",
  props: {
    content: Single({ title: "Label", type: "text", default: "Label" }),
    name: Single({ title: "Field Name", type: "text", default: "field" }),
    type: Single({
      title: "Input Type",
      type: "select",
      default: "text",
      options: ["text", "email", "password", "tel", "url", "number"],
    }),
    placeholder: Single({ title: "Placeholder", type: "text", default: "" }),
    required: Single({ title: "Required", type: "boolean", default: false }),
  },
};

// Register with ChaiBuilder
export const loadPageSpeedFormBlocks = () => {
  registerChaiBlock(TextInputBlock, TextInputConfig);
  // Register other blocks...
};
```

#### ChaiBlock Data Structure

When users configure blocks in the builder, ChaiBuilder generates this data structure:

```json
{
  "_type": "TextInput",
  "_id": "field-email",
  "_parent": "form-1",
  "content": "Email Address",
  "name": "email",
  "type": "email",
  "placeholder": "you@example.com",
  "required": true,
  "styles": "#styles:,w-full mb-4"
}
```

#### Documentation

See [builder-sdk/docs/PAGE_SPEED_FORMS_INTEGRATION.md](https://github.com/Toastability/builder-sdk/blob/master/docs/PAGE_SPEED_FORMS_INTEGRATION.md) for complete integration guide.

### Rendering Runtime Integration (opensite-blocks)

**Use Case**: Server-side or client-side rendering of pre-built design payloads.

**System**: opensite-blocks rendering runtime consuming Chai design payloads.

**Implementation**: [@opensite/blocks](https://github.com/Toastability/opensite-blocks)

#### How It Works

1. **Create Renderers**: Write custom `BlockRenderer` functions for each block type
2. **Transform Props**: Extract and transform ChaiBlock data to component props at render time
3. **Register Renderers**: Use `registerBlockRenderer` to map block `_type` to renderer function
4. **Automatic Rendering**: opensite-blocks recursively renders the block tree using registered renderers

#### Example Implementation

```typescript
// File: opensite-blocks/src/integrations/page-speed-forms.tsx
import { registerBlockRenderer } from "../core/blockRegistry";
import type { BlockRenderer } from "../core/renderers/blockRenderer";
import { buildElementProps } from "../core/renderers/blockRenderer";
import { TextInput } from "@page-speed/forms/inputs";

// Helper to extract form field props
function extractFormFieldProps(block: ChaiBlock) {
  const baseProps = buildElementProps(block);
  return {
    name: block.name || block.fieldName || `field-${block._id}`,
    label: block.content || block.label || "",
    placeholder: block.placeholder || "",
    required: block.required === true,
    disabled: block.disabled === true,
    className: baseProps.className as string | undefined,
    ...block.blockProps,
  };
}

// Create renderer for TextInput blocks
export const textInputRenderer: BlockRenderer = ({ block, context }) => {
  const props = extractFormFieldProps(block);
  return (
    <TextInput
      {...props}
      type={(block.type as string) || "text"}
      value={undefined} // Controlled by form state
      onChange={() => {}} // Controlled by form state
    />
  );
};

// Register renderer
export function registerPageSpeedFormRenderers(): void {
  registerBlockRenderer("TextInput", textInputRenderer);
  // Register other renderers...
}
```

#### Usage in Application

```typescript
// App initialization
import { registerPageSpeedFormRenderers } from "@opensite/blocks/integrations/page-speed-forms";

// Register renderers before rendering pages
registerPageSpeedFormRenderers();

// Render design payload
import { BlocksRenderer } from "@opensite/blocks/core/blocks-renderer";

function MyPage({ designPayload }) {
  return <BlocksRenderer blocks={designPayload.blocks} />;
}
```

#### Design Payload Structure

The rendering runtime consumes the same ChaiBlock structure generated by the builder:

```json
{
  "version": "1.0",
  "blocks": [
    {
      "_type": "Form",
      "_id": "form-1",
      "_parent": null,
      "action": "/api/contact",
      "method": "POST"
    },
    {
      "_type": "TextInput",
      "_id": "field-email",
      "_parent": "form-1",
      "content": "Email Address",
      "name": "email",
      "type": "email",
      "required": true
    }
  ]
}
```

#### Documentation

See [opensite-blocks/src/integrations/page-speed-forms.tsx](https://github.com/Toastability/opensite-blocks/blob/master/src/integrations/page-speed-forms.tsx) for complete integration examples with inline documentation.

## Comparison

| Aspect | ChaiBuilder Integration | Rendering Runtime Integration |
|--------|------------------------|------------------------------|
| **Purpose** | Visual page builder | Design payload rendering |
| **System** | @chaibuilder/runtime | @opensite/blocks |
| **User Interaction** | Drag-and-drop, visual config | None - renders pre-built payloads |
| **Integration Utility** | `createChaiBlockAdapter` | Custom `BlockRenderer` functions |
| **Registration** | `registerChaiBlock` | `registerBlockRenderer` |
| **Transformation** | At component wrapper level | At render time |
| **Block Config** | Required (defines UI properties) | Not required (only renderer) |
| **Error Handling** | Built into adapter | Manual implementation |
| **State Management** | Via form state hooks | Via form state hooks or context |
| **Bundle Impact** | Includes builder runtime | Minimal - only rendering code |
| **Use Cases** | Builder apps, CMS, site editors | Client websites, SSR, static sites |

## Custom Integrations

You can integrate @page-speed/forms with any React-based system by following these patterns:

### 1. Direct Component Usage

Use form components directly without any adapter:

```typescript
import { TextInput } from "@page-speed/forms/inputs";
import { useForm } from "@page-speed/forms/core";

function MyForm() {
  const form = useForm({
    defaultValues: { email: "" },
    onSubmit: async (values) => {
      // Handle submission
    },
  });

  return (
    <form.Provider>
      <form.Form>
        <TextInput
          name="email"
          label="Email"
          type="email"
          required
        />
      </form.Form>
    </form.Provider>
  );
}
```

### 2. Custom Adapter Pattern

Create your own adapter for your specific system:

```typescript
import { TextInput } from "@page-speed/forms/inputs";

// Example: Adapter for a hypothetical "PageBuilder" system
function createPageBuilderAdapter(Component, config) {
  return function Adapter(props) {
    // Transform PageBuilder props to component props
    const componentProps = {
      name: props.fieldId,
      label: props.displayName,
      required: props.validation?.required,
      // ... custom transformations
    };

    return <Component {...componentProps} />;
  };
}

// Usage
const EmailInput = createPageBuilderAdapter(TextInput, {
  type: "email-field",
  category: "forms",
});
```

### 3. Custom Renderer Pattern

Create renderers for your specific block structure:

```typescript
import { TextInput } from "@page-speed/forms/inputs";

// Example: Custom block renderer for your system
function renderFormField(fieldData) {
  switch (fieldData.type) {
    case "email":
      return (
        <TextInput
          name={fieldData.id}
          label={fieldData.label}
          type="email"
          required={fieldData.rules?.required}
        />
      );
    // ... other field types
  }
}
```

## Best Practices

### 1. Keep Transformations Pure

Prop transformation functions should be pure - no side effects, no API calls:

```typescript
// ✅ Good: Pure transformation
transformProps: (blockProps, block) => {
  return {
    name: blockProps.name || `field-${block._id}`,
    required: blockProps.required === true,
  };
}

// ❌ Bad: Side effects
transformProps: (blockProps, block) => {
  // Don't do API calls here
  fetch('/api/validate-field');
  return { ... };
}
```

### 2. Use Standard Utilities First

Always start with provided utilities and extend as needed:

```typescript
import { standardInputTransformer } from "@page-speed/forms/integration";

transformProps: (blockProps, block) => {
  // Start with standard transformation
  const baseProps = standardInputTransformer(blockProps, block);

  // Add custom logic
  return {
    ...baseProps,
    // Custom transformations here
  };
}
```

### 3. Enable Error Boundaries in Production

Always use error boundaries to prevent component failures from breaking the entire page:

```typescript
createChaiBlockAdapter(Component, {
  withErrorBoundary: true, // Always true for production
  errorFallback: (error, block) => (
    <div className="error-message">
      Failed to render {block._type}
    </div>
  ),
});
```

### 4. Provide Sensible Defaults

Set default props that create a good initial experience:

```typescript
createChaiBlockAdapter(Component, {
  defaultProps: {
    type: "text",
    placeholder: "Enter text...",
    // Don't default to required: true
  },
});
```

### 5. Document Custom Integrations

When creating custom integrations, document:
- How to register/initialize the integration
- Prop transformation logic
- Custom configuration options
- Example block structures
- Error handling approach

### 6. Test Integration Separately

Test your integration layer independently from @page-speed/forms:

```typescript
// Test your adapter
describe("TextInputBlock", () => {
  it("transforms ChaiBlock props correctly", () => {
    const block = {
      _id: "field-1",
      _type: "TextInput",
      content: "Email",
      name: "email",
    };

    const result = transformProps(block.blockProps, block);
    expect(result.label).toBe("Email");
    expect(result.name).toBe("email");
  });
});
```

### 7. Handle Missing Data Gracefully

Always provide fallbacks for missing or invalid data:

```typescript
transformProps: (blockProps, block) => {
  // Fallback to block._id if name is missing
  const name = blockProps.name || `field-${block._id}`;

  // Fallback to empty string if label is missing
  const label = block.content || block.label || "";

  // Parse JSON with try-catch
  let options = [];
  if (typeof blockProps.options === "string") {
    try {
      options = JSON.parse(blockProps.options);
    } catch {
      options = [];
    }
  }

  return { name, label, options };
}
```

## Summary

@page-speed/forms provides:
- **Pure, framework-agnostic React components** for high-performance forms
- **Generic adapter utilities** for integrating with any system
- **Two reference implementations**:
  - ChaiBuilder integration in builder-sdk (visual builder)
  - opensite-blocks integration (rendering runtime)
- **Flexible architecture** that supports custom integrations

Choose the integration pattern that matches your use case:
- **Visual Builder**: Use ChaiBuilder pattern with `createChaiBlockAdapter`
- **Rendering Only**: Use custom renderers with `registerBlockRenderer`
- **Direct Usage**: Import components directly for standard React applications
- **Custom System**: Create your own adapter pattern using provided utilities

For questions or support:
- [@page-speed/forms GitHub Issues](https://github.com/opensite-ai/page-speed-forms/issues)
- [builder-sdk GitHub Issues](https://github.com/Toastability/builder-sdk/issues)
- [opensite-blocks GitHub Issues](https://github.com/Toastability/opensite-blocks/issues)
