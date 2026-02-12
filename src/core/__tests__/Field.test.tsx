import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor, act, cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Field } from "../Field";
import { Form } from "../Form";
import { useForm } from "../useForm";

// Test component wrapper with Form context (no observer wrapper - form state is already reactive)
function TestFieldWrapper({
  fieldName = "email",
  label,
  description,
  showError = true,
  validate,
  children,
  validationSchema,
}: {
  fieldName?: string;
  label?: string;
  description?: string;
  showError?: boolean;
  validate?: any;
  children?: any;
  validationSchema?: any;
}) {
  const form = useForm({
    initialValues: { [fieldName]: "" },
    onSubmit: vi.fn(),
    validationSchema,
  });

  return (
    <Form form={form}>
      <Field
        name={fieldName}
        label={label}
        description={description}
        showError={showError}
        validate={validate}
      >
        {children ||
          (({ field, meta }) => (
            <input
              data-testid="field-input"
              {...field}
              aria-invalid={!!meta.error}
            />
          ))}
      </Field>
    </Form>
  );
}

describe("Field Component", () => {
  // Clean up after each test to prevent memory leaks
  afterEach(async () => {
    cleanup();
    // Clear all mocks
    vi.clearAllMocks();
    // Small delay to allow async operations to complete and garbage collection
    await new Promise((resolve) => setTimeout(resolve, 10));
  });

  // ============================================================================
  // Basic Rendering
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should render with render prop pattern", () => {
      render(
        <TestFieldWrapper fieldName="email">
          {({ field }) => <input data-testid="custom-input" {...field} />}
        </TestFieldWrapper>,
      );

      expect(screen.getByTestId("custom-input")).toBeInTheDocument();
    });

    it("should render with direct children", () => {
      render(
        <TestFieldWrapper fieldName="email">
          <input data-testid="direct-input" />
        </TestFieldWrapper>,
      );

      expect(screen.getByTestId("direct-input")).toBeInTheDocument();
    });

    it("should apply data-field attribute with field name", () => {
      render(<TestFieldWrapper fieldName="email" />);

      const fieldContainer =
        screen.getByTestId("field-input").parentElement?.parentElement;
      expect(fieldContainer).toHaveAttribute("data-field", "email");
    });

    it("should apply custom className", () => {
      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        });

        return (
          <Form form={form}>
            <Field name="email" className="custom-field">
              {({ field }) => <input {...field} />}
            </Field>
          </Form>
        );
      }

      render(<TestComponent />);

      const fieldContainer = screen.getByText((_, element) =>
        element?.hasAttribute("data-field"),
      );
      expect(fieldContainer).toHaveClass("custom-field");
    });
  });

  // ============================================================================
  // Label Rendering
  // ============================================================================

  describe("Label Rendering", () => {
    it("should render label when provided", () => {
      render(<TestFieldWrapper fieldName="email" label="Email Address" />);

      expect(screen.getByText("Email Address")).toBeInTheDocument();
      expect(screen.getByText("Email Address").tagName).toBe("LABEL");
    });

    it("should associate label with input using htmlFor", () => {
      render(<TestFieldWrapper fieldName="email" label="Email Address" />);

      const label = screen.getByText("Email Address");
      const input = screen.getByTestId("field-input");

      expect(label).toHaveAttribute("for", "email");
      expect(input).toHaveAttribute("name", "email");
    });

    it("should not render label when not provided", () => {
      render(<TestFieldWrapper fieldName="email" />);

      expect(screen.queryByRole("label")).not.toBeInTheDocument();
    });

    it("should apply field-label className to label", () => {
      render(<TestFieldWrapper fieldName="email" label="Email Address" />);

      const label = screen.getByText("Email Address");
      expect(label).toHaveClass("font-medium");
    });
  });

  // ============================================================================
  // Description Rendering
  // ============================================================================

  describe("Description Rendering", () => {
    it("should render description when provided", () => {
      render(
        <TestFieldWrapper
          fieldName="email"
          description="We'll never share your email"
        />,
      );

      expect(
        screen.getByText("We'll never share your email"),
      ).toBeInTheDocument();
    });

    it("should assign unique ID to description", () => {
      render(
        <TestFieldWrapper
          fieldName="email"
          description="We'll never share your email"
        />,
      );

      const description = screen.getByText("We'll never share your email");
      expect(description).toHaveAttribute("id", "email-description");
    });

    it("should apply field-description className", () => {
      render(
        <TestFieldWrapper
          fieldName="email"
          description="We'll never share your email"
        />,
      );

      const description = screen.getByText("We'll never share your email");
      expect(description).toHaveClass("text-sm");
    });

    it("should not render description when not provided", () => {
      render(<TestFieldWrapper fieldName="email" />);

      expect(screen.queryByText(/description/i)).not.toBeInTheDocument();
    });
  });

  // ============================================================================
  // Error Display
  // ============================================================================

  describe("Error Display", () => {
    it("should display error message when field is touched and has error", async () => {
      const user = userEvent.setup();

      render(
        <TestFieldWrapper
          fieldName="email"
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        />,
      );

      const input = screen.getByTestId("field-input");

      // Touch the field without entering value
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });
    });

    it("should apply correct error ID for aria-describedby association", async () => {
      const user = userEvent.setup();

      render(
        <TestFieldWrapper
          fieldName="email"
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        />,
      );

      const input = screen.getByTestId("field-input");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        const errorElement = screen.getByText("Email is required");
        expect(errorElement).toHaveAttribute("id", "email-error");
      });
    });

    it("should apply field-error className to error message", async () => {
      const user = userEvent.setup();

      render(
        <TestFieldWrapper
          fieldName="email"
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        />,
      );

      const input = screen.getByTestId("field-input");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        const errorElement = screen.getByText("Email is required");
        expect(errorElement).toHaveClass(
          "bg-destructive",
          "text-destructive-foreground",
        );
      });
    });

    it("should not display error when field is not touched", () => {
      render(
        <TestFieldWrapper
          fieldName="email"
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        />,
      );

      expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
    });

    it("should hide error when showError is false", async () => {
      const user = userEvent.setup();

      render(
        <TestFieldWrapper
          fieldName="email"
          showError={false}
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        />,
      );

      const input = screen.getByTestId("field-input");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
      });
    });

    it.skip("should handle array error messages", async () => {
      const user = userEvent.setup();
      let formInstance: any;

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit: vi.fn(),
        });
        formInstance = form;

        return (
          <Form form={form}>
            <Field name="email">
              {({ field }) => <input data-testid="field-input" {...field} />}
            </Field>
          </Form>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId("field-input");

      // Manually set an array of errors
      act(() => {
        formInstance.setFieldError("email", ["Error 1", "Error 2"] as any);
        formInstance.setFieldTouched("email", true);
      });

      await waitFor(() => {
        expect(screen.getByText("Error 1, Error 2")).toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  describe("Accessibility", () => {
    it("should have role=alert on error message", async () => {
      const user = userEvent.setup();

      render(
        <TestFieldWrapper
          fieldName="email"
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        />,
      );

      const input = screen.getByTestId("field-input");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        const errorElement = screen.getByText("Email is required");
        expect(errorElement).toHaveAttribute("role", "alert");
      });
    });

    it("should have aria-live=polite on error message", async () => {
      const user = userEvent.setup();

      render(
        <TestFieldWrapper
          fieldName="email"
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        />,
      );

      const input = screen.getByTestId("field-input");
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        const errorElement = screen.getByText("Email is required");
        expect(errorElement).toHaveAttribute("aria-live", "polite");
      });
    });

    it("should provide field meta to render prop for aria attributes", () => {
      let capturedMeta: any;

      render(
        <TestFieldWrapper fieldName="email">
          {({ field, meta }) => {
            capturedMeta = meta;
            return <input data-testid="field-input" {...field} />;
          }}
        </TestFieldWrapper>,
      );

      expect(capturedMeta).toHaveProperty("error");
      expect(capturedMeta).toHaveProperty("touched");
      expect(capturedMeta).toHaveProperty("isDirty");
      expect(capturedMeta).toHaveProperty("isValidating");
    });
  });

  // ============================================================================
  // Field-Level Validation
  // ============================================================================

  describe.skip("Field-Level Validation", () => {
    it("should support field-level validation via validate prop", async () => {
      const user = userEvent.setup();
      const validate = vi.fn((value: string) =>
        !value ? "Field is required" : undefined,
      );

      render(
        <TestFieldWrapper fieldName="email" validate={validate}>
          {({ field }) => <input data-testid="field-input" {...field} />}
        </TestFieldWrapper>,
      );

      const input = screen.getByTestId("field-input");
      await user.type(input, "test");

      expect(validate).toHaveBeenCalled();
    });

    it("should clear error when validation passes", async () => {
      const user = userEvent.setup();

      render(
        <TestFieldWrapper
          fieldName="email"
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        />,
      );

      const input = screen.getByTestId("field-input");

      // Trigger error
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText("Email is required")).toBeInTheDocument();
      });

      // Fix error
      await user.type(input, "test@example.com");
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByText("Email is required")).not.toBeInTheDocument();
      });
    });
  });

  // ============================================================================
  // Render Prop Pattern
  // ============================================================================

  describe("Render Prop Pattern", () => {
    it("should provide field props to render function", () => {
      let capturedField: any;

      render(
        <TestFieldWrapper fieldName="email">
          {({ field }) => {
            capturedField = field;
            return <input data-testid="field-input" {...field} />;
          }}
        </TestFieldWrapper>,
      );

      expect(capturedField).toHaveProperty("name", "email");
      expect(capturedField).toHaveProperty("value");
      expect(capturedField).toHaveProperty("onChange");
      expect(capturedField).toHaveProperty("onBlur");
    });

    it("should provide field meta to render function", () => {
      let capturedMeta: any;

      render(
        <TestFieldWrapper fieldName="email">
          {({ meta }) => {
            capturedMeta = meta;
            return <input data-testid="field-input" />;
          }}
        </TestFieldWrapper>,
      );

      expect(capturedMeta).toHaveProperty("error");
      expect(capturedMeta).toHaveProperty("touched");
      expect(capturedMeta).toHaveProperty("isDirty");
      expect(capturedMeta).toHaveProperty("isValidating");
    });

    it("should provide field helpers to render function", () => {
      let capturedHelpers: any;

      render(
        <TestFieldWrapper fieldName="email">
          {({ helpers }) => {
            capturedHelpers = helpers;
            return <input data-testid="field-input" />;
          }}
        </TestFieldWrapper>,
      );

      expect(capturedHelpers).toHaveProperty("setValue");
      expect(capturedHelpers).toHaveProperty("setTouched");
      expect(capturedHelpers).toHaveProperty("setError");
    });

    it("should allow custom input rendering with meta", async () => {
      const user = userEvent.setup();

      render(
        <TestFieldWrapper
          fieldName="email"
          validationSchema={{
            email: (value: string) =>
              !value ? "Email is required" : undefined,
          }}
        >
          {({ field, meta }) => (
            <input
              data-testid="field-input"
              {...field}
              className={meta.error && meta.touched ? "error-input" : ""}
            />
          )}
        </TestFieldWrapper>,
      );

      const input = screen.getByTestId("field-input");

      expect(input).not.toHaveClass("error-input");

      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(input).toHaveClass("error-input");
      });
    });
  });

  // ============================================================================
  // Context Integration
  // ============================================================================

  describe("Context Integration", () => {
    it("should throw error when used outside Form context", () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        render(
          <Field name="email">{({ field }) => <input {...field} />}</Field>,
        );
      }).toThrow("useField must be used within a FormContext");

      console.error = originalError;
    });

    it("should work correctly within Form context", () => {
      function TestComponent() {
        const form = useForm({
          initialValues: { email: "test@example.com" },
          onSubmit: vi.fn(),
        });

        return (
          <Form form={form}>
            <Field name="email">
              {({ field }) => <input data-testid="field-input" {...field} />}
            </Field>
          </Form>
        );
      }

      render(<TestComponent />);

      const input = screen.getByTestId("field-input") as HTMLInputElement;
      expect(input.value).toBe("test@example.com");
    });
  });
});
