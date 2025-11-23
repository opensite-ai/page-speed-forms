import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import * as React from "react";
import {
  createBlockAdapter,
  createBlockAdapters,
  standardInputTransformer,
  type Block,
  type AdaptedComponentProps,
} from "../BlockAdapter";

// Mock input component for testing
interface MockInputProps {
  name: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
  children?: React.ReactNode;
  "data-block-id"?: string;
  "data-block-type"?: string;
  "data-block-name"?: string;
}

const MockInput: React.FC<MockInputProps> = ({
  name,
  label,
  placeholder,
  required,
  className,
  children,
  ...dataAttrs
}) => {
  return (
    <div className={className} {...dataAttrs}>
      {label && <label htmlFor={name}>{label}</label>}
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        data-testid="mock-input"
      />
      {children}
    </div>
  );
};

MockInput.displayName = "MockInput";

// Mock container component
interface MockContainerProps {
  title?: string;
  children?: React.ReactNode;
  "data-block-id"?: string;
  "data-block-type"?: string;
}

const MockContainer: React.FC<MockContainerProps> = ({
  title,
  children,
  ...dataAttrs
}) => {
  return (
    <div data-testid="mock-container" {...dataAttrs}>
      {title && <h2>{title}</h2>}
      {children}
    </div>
  );
};

MockContainer.displayName = "MockContainer";

// Mock component that throws error
const ErrorComponent: React.FC = () => {
  throw new Error("Component render error");
};

describe("BlockAdapter", () => {
  describe("createBlockAdapter", () => {
    it("should render component with props from blockProps", () => {
      const AdaptedInput = createBlockAdapter(MockInput);

      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
        blockProps: {
          name: "email",
          placeholder: "Enter email",
          required: true,
        },
      };

      render(<AdaptedInput block={block} />);

      const input = screen.getByTestId("mock-input");
      expect(input).toHaveAttribute("name", "email");
      expect(input).toHaveAttribute("placeholder", "Enter email");
      expect(input).toHaveAttribute("required");
    });

    it("should add data attributes for debugging", () => {
      const AdaptedInput = createBlockAdapter(MockInput);

      const block: Block = {
        _id: "field-email",
        _type: "TextInput",
        _name: "Email Field",
        blockProps: {
          name: "email",
        },
      };

      render(<AdaptedInput block={block} />);

      const container = screen.getByTestId("mock-input").parentElement!;
      expect(container).toHaveAttribute("data-block-id", "field-email");
      expect(container).toHaveAttribute("data-block-type", "TextInput");
      expect(container).toHaveAttribute("data-block-name", "Email Field");
    });

    it("should merge default props with block props", () => {
      const AdaptedInput = createBlockAdapter(MockInput, {
        defaultProps: {
          placeholder: "Default placeholder",
          className: "default-class",
        },
      });

      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
        blockProps: {
          name: "email",
          // Override default placeholder
          placeholder: "Custom placeholder",
        },
      };

      render(<AdaptedInput block={block} />);

      const input = screen.getByTestId("mock-input");
      expect(input).toHaveAttribute("placeholder", "Custom placeholder");
      expect(input.parentElement).toHaveClass("default-class");
    });

    it("should apply custom prop transformation", () => {
      const AdaptedInput = createBlockAdapter(MockInput, {
        transformProps: (blockProps, block) => ({
          ...blockProps,
          label: block.content,
          className: block.styles,
        }),
      });

      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
        content: "Email Address",
        styles: "w-full mb-4",
        blockProps: {
          name: "email",
        },
      };

      render(<AdaptedInput block={block} />);

      expect(screen.getByText("Email Address")).toBeInTheDocument();
      const container = screen.getByTestId("mock-input").parentElement!;
      expect(container).toHaveClass("w-full", "mb-4");
    });

    it("should render children when provided", () => {
      const AdaptedContainer = createBlockAdapter(MockContainer);

      const block: Block = {
        _id: "container-1",
        _type: "Container",
        blockProps: {
          title: "Form Section",
        },
      };

      render(
        <AdaptedContainer block={block}>
          <div data-testid="child-content">Child content</div>
        </AdaptedContainer>
      );

      expect(screen.getByTestId("child-content")).toBeInTheDocument();
      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("should call renderChildren callback if provided", () => {
      const AdaptedContainer = createBlockAdapter(MockContainer);
      const renderChildren = vi.fn(() => (
        <div data-testid="rendered-children">Rendered children</div>
      ));

      const block: Block = {
        _id: "container-1",
        _type: "Container",
        blockProps: {},
      };

      render(<AdaptedContainer block={block} renderChildren={renderChildren} />);

      expect(renderChildren).toHaveBeenCalledWith("container-1");
      expect(screen.getByTestId("rendered-children")).toBeInTheDocument();
    });

    it("should wrap with error boundary by default", () => {
      const AdaptedError = createBlockAdapter(ErrorComponent);

      const block: Block = {
        _id: "error-block",
        _type: "ErrorComponent",
        _name: "Error Test",
        blockProps: {},
      };

      // Suppress all console output during error boundary tests
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<AdaptedError block={block} />);

      expect(screen.getByText("Block Render Error")).toBeInTheDocument();
      expect(screen.getByText(/Error Test/)).toBeInTheDocument();
      expect(screen.getByText("Component render error")).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it("should not wrap with error boundary if disabled", () => {
      const AdaptedError = createBlockAdapter(ErrorComponent, {
        withErrorBoundary: false,
      });

      const block: Block = {
        _id: "error-block",
        _type: "ErrorComponent",
        blockProps: {},
      };

      // Suppress all console output during error boundary tests
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      expect(() => {
        render(<AdaptedError block={block} />);
      }).toThrow("Component render error");

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it("should use custom error fallback if provided", () => {
      const AdaptedError = createBlockAdapter(ErrorComponent, {
        errorFallback: (error, block) => (
          <div data-testid="custom-error">
            Custom error for {block._id}: {error.message}
          </div>
        ),
      });

      const block: Block = {
        _id: "error-block",
        _type: "ErrorComponent",
        blockProps: {},
      };

      // Suppress all console output during error boundary tests
      const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      render(<AdaptedError block={block} />);

      expect(screen.getByTestId("custom-error")).toBeInTheDocument();
      expect(screen.getByText(/Custom error for error-block/)).toBeInTheDocument();

      consoleErrorSpy.mockRestore();
      consoleWarnSpy.mockRestore();
    });

    it("should handle empty blockProps", () => {
      const AdaptedInput = createBlockAdapter(MockInput, {
        defaultProps: {
          name: "default-name",
        },
      });

      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
      };

      render(<AdaptedInput block={block} />);

      const input = screen.getByTestId("mock-input");
      expect(input).toHaveAttribute("name", "default-name");
    });

    it("should set display name for debugging", () => {
      const AdaptedInput = createBlockAdapter(MockInput);
      expect(AdaptedInput.displayName).toBe("BlockAdapter(MockInput)");
    });
  });

  describe("standardInputTransformer", () => {
    it("should map content to label if not provided", () => {
      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
        content: "Email Address",
        blockProps: {
          name: "email",
        },
      };

      const result = standardInputTransformer(block.blockProps || {}, block);

      expect(result).toEqual({
        name: "email",
        label: "Email Address",
      });
    });

    it("should not override existing label", () => {
      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
        content: "From Content",
        blockProps: {
          name: "email",
          label: "Existing Label",
        },
      };

      const result = standardInputTransformer(block.blockProps || {}, block);

      expect(result).toEqual({
        name: "email",
        label: "Existing Label",
      });
    });

    it("should map styles to className", () => {
      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
        styles: "w-full mb-4",
        blockProps: {
          name: "email",
        },
      };

      const result = standardInputTransformer(block.blockProps || {}, block);

      expect(result).toEqual({
        name: "email",
        className: "w-full mb-4",
      });
    });

    it("should handle both content and styles", () => {
      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
        content: "Email Address",
        styles: "w-full mb-4",
        blockProps: {
          name: "email",
          placeholder: "you@example.com",
        },
      };

      const result = standardInputTransformer(block.blockProps || {}, block);

      expect(result).toEqual({
        name: "email",
        placeholder: "you@example.com",
        label: "Email Address",
        className: "w-full mb-4",
      });
    });

    it("should preserve all blockProps", () => {
      const block: Block = {
        _id: "field-1",
        _type: "TextInput",
        blockProps: {
          name: "email",
          type: "email",
          required: true,
          maxLength: 100,
          customProp: "custom value",
        },
      };

      const result = standardInputTransformer(block.blockProps || {}, block);

      expect(result).toEqual({
        name: "email",
        type: "email",
        required: true,
        maxLength: 100,
        customProp: "custom value",
      });
    });
  });

  describe("createBlockAdapters", () => {
    it("should adapt multiple components at once", () => {
      const components = {
        Input: MockInput,
        Container: MockContainer,
      };

      const adapted = createBlockAdapters(components);

      expect(adapted.Input).toBeDefined();
      expect(adapted.Container).toBeDefined();
      expect(adapted.Input.displayName).toBe("BlockAdapter(MockInput)");
      expect(adapted.Container.displayName).toBe("BlockAdapter(MockContainer)");
    });

    it("should apply shared options to all components", () => {
      const components = {
        Input1: MockInput,
        Input2: MockInput,
      };

      const adapted = createBlockAdapters(components, {
        defaultProps: {
          className: "shared-class",
        },
        transformProps: standardInputTransformer,
      });

      const block1: Block = {
        _id: "field-1",
        _type: "Input1",
        content: "Label 1",
        blockProps: { name: "field1" },
      };

      const block2: Block = {
        _id: "field-2",
        _type: "Input2",
        content: "Label 2",
        blockProps: { name: "field2" },
      };

      const { container: container1 } = render(<adapted.Input1 block={block1} />);
      const { container: container2 } = render(<adapted.Input2 block={block2} />);

      expect(screen.getByText("Label 1")).toBeInTheDocument();
      expect(screen.getByText("Label 2")).toBeInTheDocument();

      const inputs = screen.getAllByTestId("mock-input");
      expect(inputs[0].parentElement).toHaveClass("shared-class");
      expect(inputs[1].parentElement).toHaveClass("shared-class");
    });

    it("should handle empty components object", () => {
      const adapted = createBlockAdapters({});
      expect(Object.keys(adapted)).toHaveLength(0);
    });
  });
});
