/**
 * @page-speed/forms - Block Adapter
 *
 * Adapts form components for use in block-based rendering systems.
 * Wraps form components to accept block prop structure and transforms them
 * to component-native props.
 *
 * @see https://github.com/opensite-ai/page-speed-forms
 */

"use client";

import * as React from "react";

/**
 * Block structure for design payloads.
 * Minimal type definition for adapter compatibility.
 */
export interface Block {
  _id: string;
  _type: string;
  _name?: string;
  _parent?: string | null;
  tag?: string;
  styles?: string;
  content?: string;
  blockProps?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Options for Block adapter.
 */
export interface BlockAdapterOptions {
  /**
   * Default props to merge with block props.
   */
  defaultProps?: Record<string, unknown>;

  /**
   * Transform function to convert Block props to component props.
   * Useful for custom prop mapping logic.
   */
  transformProps?: (
    blockProps: Record<string, unknown>,
    block: Block,
  ) => Record<string, unknown>;

  /**
   * Extract display name from block for debugging.
   * Defaults to using _name or _type from block.
   */
  getDisplayName?: (block: Block) => string;

  /**
   * Enable React error boundary wrapping.
   * Defaults to true.
   */
  withErrorBoundary?: boolean;

  /**
   * Custom error fallback component.
   * If not provided, renders basic error message.
   */
  errorFallback?: (error: Error, block: Block) => React.ReactNode;
}

/**
 * Props passed to adapted component.
 */
export interface AdaptedComponentProps {
  /**
   * Block data from design payload.
   */
  block: Block;

  /**
   * Child blocks for rendering nested content.
   * Used by container components like Form.
   */
  children?: React.ReactNode;

  /**
   * Callback to render child blocks.
   * Provided by block rendering systems.
   */
  renderChildren?: (blockId: string) => React.ReactNode;
}

/**
 * Error boundary component for catching render errors.
 */
class BlockErrorBoundary extends React.Component<
  {
    block: Block;
    fallback?: (error: Error, block: Block) => React.ReactNode;
    children: React.ReactNode;
  },
  { error: Error | null }
> {
  constructor(props: BlockErrorBoundary["props"]) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(
      `Block render error (${this.props.block._id}):`,
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.props.block);
      }

      return (
        <div
          className="block-error border border-destructive bg-destructive p-4 rounded text-destructive-foreground"
          data-block-id={this.props.block._id}
          data-block-type={this.props.block._type}
        >
          <p className="font-semibold">Block Render Error</p>
          <p className="text-sm">
            Block: {this.props.block._name || this.props.block._id} (
            {this.props.block._type})
          </p>
          <p className="text-sm mt-1">{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Create a Block-compatible wrapper for a form component.
 *
 * This adapter transforms Block props (from design payload) into
 * component-native props. It handles:
 * - Extracting props from `blockProps` field
 * - Merging with default props
 * - Custom prop transformation
 * - Error boundary wrapping
 * - Children rendering support
 *
 * @param Component - React component to adapt
 * @param options - Adapter configuration options
 * @returns Block-compatible component
 *
 * @example
 * ```tsx
 * import { TextInput } from "@page-speed/forms/inputs";
 * import { createBlockAdapter } from "@page-speed/forms/integration";
 *
 * // Create Block-compatible TextInput
 * const BlockTextInput = createBlockAdapter(TextInput, {
 *   defaultProps: {
 *     placeholder: "Enter text...",
 *   },
 *   transformProps: (blockProps, block) => ({
 *     ...blockProps,
 *     // Map Block content to component props
 *     label: block.content || blockProps.label,
 *     // Apply Block styles as className
 *     className: block.styles,
 *   }),
 * });
 *
 * // Register with rendering system
 * registerBlockType("TextInput", BlockTextInput);
 * ```
 *
 * @example
 * ```tsx
 * // Block from design payload:
 * {
 *   _id: "field-email",
 *   _type: "TextInput",
 *   _name: "Email Field",
 *   content: "Email Address",
 *   styles: "w-full mb-4",
 *   blockProps: {
 *     name: "email",
 *     type: "email",
 *     placeholder: "you@example.com",
 *     required: true,
 *   }
 * }
 *
 * // Transformed to TextInput props:
 * <TextInput
 *   name="email"
 *   type="email"
 *   placeholder="you@example.com"
 *   required={true}
 *   label="Email Address"
 *   className="w-full mb-4"
 * />
 * ```
 */
export function createBlockAdapter<TProps extends Record<string, unknown>>(
  Component: React.ComponentType<TProps>,
  options: BlockAdapterOptions = {},
): React.ComponentType<AdaptedComponentProps> {
  const {
    defaultProps = {},
    transformProps,
    withErrorBoundary = true,
    errorFallback,
  } = options;

  const AdaptedComponent: React.FC<AdaptedComponentProps> = ({
    block,
    children,
    renderChildren,
  }) => {
    // Extract component props from blockProps
    const blockProps = (block.blockProps || {}) as Record<string, unknown>;

    // Merge with default props
    const mergedProps = { ...defaultProps, ...blockProps };

    // Apply custom transformation if provided
    const finalProps = transformProps
      ? transformProps(mergedProps, block)
      : mergedProps;

    // Add data attributes for debugging
    const dataAttrs = {
      "data-block-id": block._id,
      "data-block-type": block._type,
      ...(block._name && { "data-block-name": block._name }),
    };

    // Merge data attributes with final props
    const componentProps = {
      ...finalProps,
      ...dataAttrs,
    } as unknown as TProps;

    // Render children if renderChildren callback provided
    const renderedChildren = renderChildren
      ? renderChildren(block._id)
      : children;

    const element = (
      <Component {...componentProps}>{renderedChildren}</Component>
    );

    // Wrap with error boundary if enabled
    if (withErrorBoundary) {
      return (
        <BlockErrorBoundary block={block} fallback={errorFallback}>
          {element}
        </BlockErrorBoundary>
      );
    }

    return element;
  };

  // Set display name for debugging
  const componentName = Component.displayName || Component.name || "Component";
  AdaptedComponent.displayName = `BlockAdapter(${componentName})`;

  return AdaptedComponent;
}

/**
 * Standard prop transformer for form input components.
 *
 * Applies common transformations:
 * - Maps Block `content` to `label`
 * - Maps Block `styles` to `className`
 * - Preserves all blockProps
 *
 * @param blockProps - Props from Block.blockProps
 * @param block - Full Block object
 * @returns Transformed props for component
 *
 * @example
 * ```tsx
 * const BlockTextInput = createBlockAdapter(TextInput, {
 *   transformProps: standardInputTransformer,
 * });
 * ```
 */
export function standardInputTransformer(
  blockProps: Record<string, unknown>,
  block: Block,
): Record<string, unknown> {
  return {
    ...blockProps,
    // Use content as label if not already provided
    ...(block.content && !blockProps.label && { label: block.content }),
    // Apply Block styles as className
    ...(block.styles && { className: block.styles }),
  };
}

/**
 * Create multiple Block adapters with shared options.
 *
 * Convenience function for adapting multiple components at once
 * with the same configuration.
 *
 * @param components - Record of component name to component
 * @param options - Shared adapter options
 * @returns Record of adapted components
 *
 * @example
 * ```tsx
 * import * as Inputs from "@page-speed/forms/inputs";
 * import { createBlockAdapters, standardInputTransformer } from "@page-speed/forms/integration";
 *
 * const BlockInputs = createBlockAdapters(
 *   {
 *     TextInput: Inputs.TextInput,
 *     TextArea: Inputs.TextArea,
 *     Select: Inputs.Select,
 *   },
 *   {
 *     transformProps: standardInputTransformer,
 *     withErrorBoundary: true,
 *   }
 * );
 *
 * // BlockInputs.TextInput, BlockInputs.TextArea, BlockInputs.Select
 * // are now Block-compatible
 * ```
 */
export function createBlockAdapters<
  TComponents extends Record<string, React.ComponentType<any>>,
>(
  components: TComponents,
  options: BlockAdapterOptions = {},
): Record<keyof TComponents, React.ComponentType<AdaptedComponentProps>> {
  const adapted: Record<
    string,
    React.ComponentType<AdaptedComponentProps>
  > = {};

  for (const [name, component] of Object.entries(components)) {
    adapted[name] = createBlockAdapter(component, options);
  }

  return adapted as Record<
    keyof TComponents,
    React.ComponentType<AdaptedComponentProps>
  >;
}
