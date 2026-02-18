import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { Form } from "../Form";
import { useForm } from "../useForm";

// Test component that uses Form (no observer wrapper - form state is already reactive)
function TestFormComponent({
  onSubmit,
  initialValues = { email: "" },
}: {
  onSubmit: any;
  initialValues?: Record<string, any>;
}) {
  const form = useForm({
    initialValues,
    onSubmit,
  });

  return (
    <Form form={form} data-testid="test-form">
      <input
        data-testid="email-input"
        name="email"
        value={form.values.email || ""}
        onChange={(e) => form.setFieldValue("email" as any, e.target.value)}
        onBlur={() => form.setFieldTouched("email" as any, true)}
        type="email"
      />
      <button type="submit" data-testid="submit-button">
        Submit
      </button>
      <div data-testid="status">{form.status}</div>
    </Form>
  );
}

describe("Form Component", () => {
  // ============================================================================
  // Basic Rendering
  // ============================================================================

  describe("Basic Rendering", () => {
    it("should render form element with children", () => {
      const onSubmit = vi.fn();
      render(<TestFormComponent onSubmit={onSubmit} />);

      expect(screen.getByTestId("test-form")).toBeInTheDocument();
      expect(screen.getByTestId("email-input")).toBeInTheDocument();
      expect(screen.getByTestId("submit-button")).toBeInTheDocument();
    });

    it("should apply custom className", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form form={form} className="custom-form">
            <input data-testid="input" />
          </Form>
        );
      }

      render(<TestComponent />);

      const formElement = screen.getByTestId("input").parentElement;
      expect(formElement).toHaveClass("custom-form");
    });

    it("should forward additional HTML attributes", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form
            form={form}
            data-testid="form"
            id="test-form"
            role="form"
            aria-label="Test form"
          >
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      const formElement = screen.getByTestId("form");
      expect(formElement).toHaveAttribute("id", "test-form");
      expect(formElement).toHaveAttribute("role", "form");
      expect(formElement).toHaveAttribute("aria-label", "Test form");
    });

    it("should set noValidate to true by default", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form form={form} data-testid="form">
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId("form")).toHaveAttribute("novalidate");
    });

    it("should allow overriding noValidate", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form form={form} data-testid="form" noValidate={false}>
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId("form")).not.toHaveAttribute("novalidate");
    });

    it("should set method to post by default", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form form={form} data-testid="form">
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId("form")).toHaveAttribute("method", "post");
    });

    it("should support custom action attribute for progressive enhancement", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form form={form} data-testid="form" action="/api/submit">
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId("form")).toHaveAttribute(
        "action",
        "/api/submit"
      );
    });

    it("should resolve action and method from formConfig", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form
            form={form}
            data-testid="form"
            formConfig={{ endpoint: "/api/from-config", method: "get" }}
          >
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      const formElement = screen.getByTestId("form");
      expect(formElement).toHaveAttribute("action", "/api/from-config");
      expect(formElement).toHaveAttribute("method", "get");
    });

    it("should apply styleConfig.formClassName when className is not provided", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form
            form={form}
            data-testid="form"
            styleConfig={{ formClassName: "config-form-class" }}
          >
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId("form")).toHaveClass("config-form-class");
    });
  });

  // ============================================================================
  // Form Context
  // ============================================================================

  describe("Form Context", () => {
    it("should provide form context to children", () => {
      const onSubmit = vi.fn();
      render(
        <TestFormComponent
          onSubmit={onSubmit}
          initialValues={{ email: "test@example.com" }}
        />
      );

      const input = screen.getByTestId("email-input") as HTMLInputElement;
      expect(input.value).toBe("test@example.com");
    });

    it("should allow children to access form methods", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(<TestFormComponent onSubmit={onSubmit} />);

      const input = screen.getByTestId("email-input");
      await user.type(input, "new@example.com");

      expect(input).toHaveValue("new@example.com");
    });
  });

  // ============================================================================
  // Form Submission
  // ============================================================================

  describe("Form Submission", () => {
    it("should call handleSubmit on form submit", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <TestFormComponent
          onSubmit={onSubmit}
          initialValues={{ email: "test@example.com" }}
        />
      );

      const submitButton = screen.getByTestId("submit-button");
      await user.click(submitButton);

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ email: "test@example.com" }),
          expect.any(Object)
        );
      });
    });

    it("should prevent default form submission", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const handleFormSubmit = vi.fn((e) => e.preventDefault());

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form form={form} data-testid="form" onSubmit={handleFormSubmit}>
            <button type="submit" data-testid="submit">
              Submit
            </button>
          </Form>
        );
      }

      render(<TestComponent />);

      await user.click(screen.getByTestId("submit"));

      await waitFor(() => {
        expect(handleFormSubmit).toHaveBeenCalled();
      });
    });

    it("should update form status during submission", async () => {
      const user = userEvent.setup();

      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      const onSubmit = vi.fn(() => submitPromise);

      render(
        <TestFormComponent
          onSubmit={onSubmit}
          initialValues={{ email: "test@example.com" }}
        />
      );

      expect(screen.getByTestId("status")).toHaveTextContent("idle");

      await user.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent("submitting");
      });

      resolveSubmit!();

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent("success");
      });
    });

    it("should handle submission errors", async () => {
      const user = userEvent.setup();
      const error = new Error("Submission failed");
      const onSubmit = vi.fn(() => Promise.reject(error));

      render(
        <TestFormComponent
          onSubmit={onSubmit}
          initialValues={{ email: "test@example.com" }}
        />
      );

      await user.click(screen.getByTestId("submit-button"));

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent("error");
      });
    });

    it("should support notificationConfig and styleConfig feedback settings", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn().mockResolvedValue(undefined);

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "test@example.com" },
          onSubmit,
        });

        return (
          <Form
            form={form}
            notificationConfig={{
              successMessage: "Config success message",
            }}
            styleConfig={{
              successMessageClassName: "success-from-config",
            }}
          >
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<TestComponent />);

      await user.click(screen.getByText("Submit"));

      await waitFor(() => {
        expect(screen.getByText("Config success message")).toBeInTheDocument();
      });

      expect(
        screen
          .getByText("Config success message")
          .closest(".success-from-config"),
      ).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Progressive Enhancement
  // ============================================================================

  describe("Progressive Enhancement", () => {
    it("should work with server-side action when JavaScript is disabled", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form form={form} data-testid="form" action="/api/submit" method="post">
            <input name="email" />
            <button type="submit">Submit</button>
          </Form>
        );
      }

      render(<TestComponent />);

      const formElement = screen.getByTestId("form");
      expect(formElement).toHaveAttribute("action", "/api/submit");
      expect(formElement).toHaveAttribute("method", "post");
    });

    it("should support GET method for search forms", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { search: "" },
          onSubmit,
        });

        return (
          <Form
            form={form}
            data-testid="form"
            action="/search"
            method="get"
          >
            <input name="search" />
            <button type="submit">Search</button>
          </Form>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId("form")).toHaveAttribute("method", "get");
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  describe("Accessibility", () => {
    it("should render semantic HTML form element", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form form={form} data-testid="form">
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      expect(screen.getByTestId("form").tagName).toBe("FORM");
    });

    it("should support aria attributes", () => {
      const onSubmit = vi.fn();

      function TestComponent() {
        const form = useForm({
          initialValues: { email: "" },
          onSubmit,
        });

        return (
          <Form
            form={form}
            data-testid="form"
            aria-label="Contact form"
            aria-describedby="form-help"
          >
            <input />
          </Form>
        );
      }

      render(<TestComponent />);

      const formElement = screen.getByTestId("form");
      expect(formElement).toHaveAttribute("aria-label", "Contact form");
      expect(formElement).toHaveAttribute("aria-describedby", "form-help");
    });
  });
});
