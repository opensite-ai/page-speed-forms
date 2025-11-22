/**
 * @page-speed/forms - ChaiBlock Adapter
 *
 * Adapts form components for use in opensite-blocks ChaiBlock rendering system.
 * Wraps form components to accept ChaiBlock prop structure and transforms them
 * to component-native props.
 *
 * @see https://github.com/opensite-ai/page-speed-forms
 */

"use client";

import * as React from "react";

/**
 * ChaiBlock structure from @opensite/blocks.
 * Minimal type definition for adapter compatibility.
 */
export interface ChaiBlock {
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
 * Options for ChaiBlock adapter.
 */
export interface ChaiBlockAdapterOptions {
  /**
   * Default props to merge with block props.
   */
  defaultProps?: Record<string, unknown>;

  /**
   * Transform function to convert ChaiBlock props to component props.
   * Useful for custom prop mapping logic.
   */
  transformProps?: (blockProps: Record<string, unknown>, block: ChaiBlock) => Record<string, unknown>;

  /**
   * Extract display name from block for debugging.
   * Defaults to using _name or _type from block.
   */
  getDisplayName?: (block: ChaiBlock) => string;

  /**
   * Enable React error boundary wrapping.
   * Defaults to true.
   */
  withErrorBoundary?: boolean;

  /**
   * Custom error fallback component.
   * If not provided, renders basic error message.
   */
  errorFallback?: (error: Error, block: ChaiBlock) => React.ReactNode;
}

/**
 * Props passed to adapted component.
 */
export interface AdaptedComponentProps {
  /**
   * ChaiBlock data from design payload.
   */
  block: ChaiBlock;

  /**
   * Child blocks for rendering nested content.
   * Used by container components like Form.
   */
  children?: React.ReactNode;

  /**
   * Callback to render child blocks.
   * Provided by opensite-blocks BlocksRenderer.
   */
  renderChildren?: (blockId: string) => React.ReactNode;
}

/**
 * Error boundary component for catching render errors.
 */
class ChaiBlockErrorBoundary extends React.Component<
  {
    block: ChaiBlock;
    fallback?: (error: Error, block: ChaiBlock) => React.ReactNode;
    children: React.ReactNode;
  },
  { error: Error | null }
> {
  constructor(props: ChaiBlockErrorBoundary["props"]) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error(`ChaiBlock render error (${this.props.block._id}):`, error, errorInfo);
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.props.block);
      }

      return (
        <div
          className="chai-block-error border border-red-300 bg-red-50 p-4 rounded text-red-700"
          data-block-id={this.props.block._id}
          data-block-type={this.props.block._type}
        >
          <p className="font-semibold">Block Render Error</p>
          <p className="text-sm">
            Block: {this.props.block._name || this.props.block._id} ({this.props.block._type})
          </p>
          <p className="text-sm mt-1">{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Create a ChaiBlock-compatible wrapper for a form component.
 *
 * This adapter transforms ChaiBlock props (from design payload) into
 * component-native props. It handles:
 * - Extracting props from `blockProps` field
 * - Merging with default props
 * - Custom prop transformation
 * - Error boundary wrapping
 * - Children rendering support
 *
 * @param Component - React component to adapt
 * @param options - Adapter configuration options
 * @returns ChaiBlock-compatible component
 *
 * @example
 * ```tsx
 * import { TextInput } from "@page-speed/forms/inputs";
 * import { createChaiBlockAdapter } from "@page-speed/forms/integration";
 *
 * // Create ChaiBlock-compatible TextInput
 * const ChaiTextInput = createChaiBlockAdapter(TextInput, {
 *   defaultProps: {
 *     placeholder: "Enter text...",
 *   },
 *   transformProps: (blockProps, block) => ({
 *     ...blockProps,
 *     // Map ChaiBlock content to component props
 *     label: block.content || blockProps.label,
 *     // Apply ChaiBlock styles as className
 *     className: block.styles,
 *   }),
 * });
 *
 * // Register with opensite-blocks
 * registerBlockType("TextInput", ChaiTextInput);
 * ```
 *
 * @example
 * ```tsx
 * // ChaiBlock from design payload:
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
export function createChaiBlockAdapter<TProps extends Record<string, unknown>>(
  Component: React.ComponentType<TProps>,
  options: ChaiBlockAdapterOptions = {}
): React.ComponentType<AdaptedComponentProps> {
  const {
    defaultProps = {},
    transformProps,
    withErrorBoundary = true,
    errorFallback,
  } = options;

  const AdaptedComponent: React.FC<AdaptedComponentProps> = ({ block, children, renderChildren }) => {
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
    const renderedChildren = renderChildren ? renderChildren(block._id) : children;

    const element = (
      <Component {...componentProps}>
        {renderedChildren}
      </Component>
    );

    // Wrap with error boundary if enabled
    if (withErrorBoundary) {
      return (
        <ChaiBlockErrorBoundary block={block} fallback={errorFallback}>
          {element}
        </ChaiBlockErrorBoundary>
      );
    }

    return element;
  };

  // Set display name for debugging
  const componentName = Component.displayName || Component.name || "Component";
  AdaptedComponent.displayName = `ChaiBlockAdapter(${componentName})`;

  return AdaptedComponent;
}

/**
 * Standard prop transformer for form input components.
 *
 * Applies common transformations:
 * - Maps ChaiBlock `content` to `label`
 * - Maps ChaiBlock `styles` to `className`
 * - Preserves all blockProps
 *
 * @param blockProps - Props from ChaiBlock.blockProps
 * @param block - Full ChaiBlock object
 * @returns Transformed props for component
 *
 * @example
 * ```tsx
 * const ChaiTextInput = createChaiBlockAdapter(TextInput, {
 *   transformProps: standardInputTransformer,
 * });
 * ```
 */
export function standardInputTransformer(
  blockProps: Record<string, unknown>,
  block: ChaiBlock
): Record<string, unknown> {
  return {
    ...blockProps,
    // Use content as label if not already provided
    ...(block.content && !blockProps.label && { label: block.content }),
    // Apply ChaiBlock styles as className
    ...(block.styles && { className: block.styles }),
  };
}

/**
 * Create multiple ChaiBlock adapters with shared options.
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
 * import { createChaiBlockAdapters, standardInputTransformer } from "@page-speed/forms/integration";
 *
 * const ChaiInputs = createChaiBlockAdapters(
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
 * // ChaiInputs.TextInput, ChaiInputs.TextArea, ChaiInputs.Select
 * // are now ChaiBlock-compatible
 * ```
 */
export function createChaiBlockAdapters<
  TComponents extends Record<string, React.ComponentType<any>>
>(
  components: TComponents,
  options: ChaiBlockAdapterOptions = {}
): Record<keyof TComponents, React.ComponentType<AdaptedComponentProps>> {
  const adapted: Record<string, React.ComponentType<AdaptedComponentProps>> = {};

  for (const [name, component] of Object.entries(components)) {
    adapted[name] = createChaiBlockAdapter(component, options);
  }

  return adapted as Record<keyof TComponents, React.ComponentType<AdaptedComponentProps>>;
}
