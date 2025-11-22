import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { observer } from "@legendapp/state/react";
import { useForm } from "../useForm";
import type { UseFormOptions } from "../types";

// Helper component to test useForm - wrapped with observer for reactive re-renders
const FormComponent = observer(function FormComponent<T extends Record<string, any>>({
  options,
  onRender,
}: {
  options: UseFormOptions<T>;
  onRender?: (form: ReturnType<typeof useForm<T>>) => void;
}) {
  const form = useForm(options);

  // Call onRender callback for assertions
  onRender?.(form);

  return (
    <form onSubmit={form.handleSubmit} data-testid="form">
      <input
        data-testid="email-input"
        name="email"
        value={form.values.email || ""}
        onChange={(e) => form.setFieldValue("email" as keyof T, e.target.value as T[keyof T])}
        onBlur={() => form.setFieldTouched("email" as keyof T, true)}
      />
      {form.errors.email && (
        <span data-testid="email-error">{form.errors.email}</span>
      )}
      <div data-testid="is-dirty">{form.isDirty ? "dirty" : "pristine"}</div>
      <div data-testid="is-valid">{form.isValid ? "valid" : "invalid"}</div>
      <div data-testid="is-submitting">{form.isSubmitting ? "submitting" : "idle"}</div>
      <div data-testid="status">{form.status}</div>
      <button type="submit" disabled={form.isSubmitting}>
        Submit
      </button>
      <button
        type="button"
        onClick={() => form.resetForm()}
        data-testid="reset-button"
      >
        Reset
      </button>
    </form>
  );
});

describe("useForm Integration Tests", () => {
  // ============================================================================
  // Basic Form Interaction
  // ============================================================================

  describe("Basic Form Interaction", () => {
    it("should initialize with provided values", () => {
      render(
        <FormComponent
          options={{
            initialValues: { email: "test@example.com" },
            onSubmit: vi.fn(),
          }}
        />
      );

      const input = screen.getByTestId("email-input") as HTMLInputElement;
      expect(input.value).toBe("test@example.com");
    });

    it("should update field value when user types", async () => {
      const user = userEvent.setup();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            onSubmit: vi.fn(),
          }}
        />
      );

      const input = screen.getByTestId("email-input");
      await user.type(input, "test@example.com");

      expect(input).toHaveValue("test@example.com");
    });

    it("should mark form as dirty after value changes", async () => {
      const user = userEvent.setup();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            onSubmit: vi.fn(),
          }}
        />
      );

      expect(screen.getByTestId("is-dirty")).toHaveTextContent("pristine");

      const input = screen.getByTestId("email-input");
      await user.type(input, "test@example.com");

      await waitFor(() => {
        expect(screen.getByTestId("is-dirty")).toHaveTextContent("dirty");
      });
    });

    it("should reset form to initial values", async () => {
      const user = userEvent.setup();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            onSubmit: vi.fn(),
          }}
        />
      );

      const input = screen.getByTestId("email-input");
      await user.type(input, "test@example.com");

      expect(input).toHaveValue("test@example.com");
      expect(screen.getByTestId("is-dirty")).toHaveTextContent("dirty");

      const resetButton = screen.getByTestId("reset-button");
      await user.click(resetButton);

      await waitFor(() => {
        expect(input).toHaveValue("");
        expect(screen.getByTestId("is-dirty")).toHaveTextContent("pristine");
      });
    });
  });

  // ============================================================================
  // Validation
  // ============================================================================

  describe("Validation", () => {
    it("should validate field on blur", async () => {
      const user = userEvent.setup();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            validateOn: "onBlur",
            validationSchema: {
              email: (value) => (!value ? "Email is required" : undefined),
            },
            onSubmit: vi.fn(),
          }}
        />
      );

      const input = screen.getByTestId("email-input");

      // Initially no error
      expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();

      // Focus and blur without entering value
      await user.click(input);
      await user.tab(); // Move focus away

      // Error should appear
      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Email is required"
        );
      });
    });

    it("should clear error when validation passes", async () => {
      const user = userEvent.setup();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            validateOn: "onBlur",
            validationSchema: {
              email: (value) => (!value ? "Email is required" : undefined),
            },
            onSubmit: vi.fn(),
          }}
        />
      );

      const input = screen.getByTestId("email-input");

      // Trigger validation error
      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toBeInTheDocument();
      });

      // Enter valid value
      await user.type(input, "test@example.com");
      await user.tab();

      // Error should clear
      await waitFor(() => {
        expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
      });
    });

    it("should update isValid based on errors", async () => {
      const user = userEvent.setup();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            validateOn: "onBlur",
            validationSchema: {
              email: (value) => (!value ? "Email is required" : undefined),
            },
            onSubmit: vi.fn(),
          }}
        />
      );

      // Initially valid (no validation run yet)
      expect(screen.getByTestId("is-valid")).toHaveTextContent("valid");

      const input = screen.getByTestId("email-input");
      await user.click(input);
      await user.tab();

      // Should become invalid after validation
      await waitFor(() => {
        expect(screen.getByTestId("is-valid")).toHaveTextContent("invalid");
      });

      // Enter valid value
      await user.type(input, "test@example.com");
      await user.tab();

      // Should become valid again
      await waitFor(() => {
        expect(screen.getByTestId("is-valid")).toHaveTextContent("valid");
      });
    });

    it("should support async validators", async () => {
      const user = userEvent.setup();

      const asyncValidator = vi.fn(async (value: string) => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        return !value ? "Email is required" : undefined;
      });

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            validateOn: "onBlur",
            validationSchema: {
              email: asyncValidator,
            },
            onSubmit: vi.fn(),
          }}
        />
      );

      const input = screen.getByTestId("email-input");
      await user.click(input);
      await user.tab();

      await waitFor(
        () => {
          expect(screen.getByTestId("email-error")).toHaveTextContent(
            "Email is required"
          );
        },
        { timeout: 200 }
      );

      expect(asyncValidator).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // Form Submission
  // ============================================================================

  describe("Form Submission", () => {
    it("should call onSubmit with form values", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            onSubmit,
          }}
        />
      );

      const input = screen.getByTestId("email-input");
      await user.type(input, "test@example.com");

      const form = screen.getByTestId("form");
      await user.click(screen.getByText("Submit"));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith(
          expect.objectContaining({ email: "test@example.com" }),
          expect.any(Object)
        );
      });
    });

    it("should set isSubmitting during submission", async () => {
      const user = userEvent.setup();

      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      const onSubmit = vi.fn(() => submitPromise);

      render(
        <FormComponent
          options={{
            initialValues: { email: "test@example.com" },
            onSubmit,
          }}
        />
      );

      // Initially not submitting
      expect(screen.getByTestId("is-submitting")).toHaveTextContent("idle");
      expect(screen.getByTestId("status")).toHaveTextContent("idle");

      // Start submission
      await user.click(screen.getByText("Submit"));

      // Should be submitting
      await waitFor(() => {
        expect(screen.getByTestId("is-submitting")).toHaveTextContent("submitting");
      });

      // Resolve submission
      resolveSubmit!();

      // Should return to idle
      await waitFor(() => {
        expect(screen.getByTestId("is-submitting")).toHaveTextContent("idle");
        expect(screen.getByTestId("status")).toHaveTextContent("success");
      });
    });

    it("should validate before submitting", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();
      const onError = vi.fn();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            validationSchema: {
              email: (value) => (!value ? "Email is required" : undefined),
            },
            onSubmit,
            onError,
          }}
        />
      );

      await user.click(screen.getByText("Submit"));

      await waitFor(() => {
        expect(screen.getByTestId("email-error")).toHaveTextContent(
          "Email is required"
        );
      });

      expect(onSubmit).not.toHaveBeenCalled();
      expect(onError).toHaveBeenCalledWith({ email: "Email is required" });
      expect(screen.getByTestId("status")).toHaveTextContent("error");
    });

    it("should not submit if validation fails", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            validationSchema: {
              email: (value) => (!value ? "Email is required" : undefined),
            },
            onSubmit,
          }}
        />
      );

      await user.click(screen.getByText("Submit"));

      await waitFor(() => {
        expect(screen.getByTestId("status")).toHaveTextContent("error");
      });

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it("should update status to success after successful submission", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn(
        () => new Promise((resolve) => setTimeout(resolve, 50))
      );

      render(
        <FormComponent
          options={{
            initialValues: { email: "test@example.com" },
            onSubmit,
          }}
        />
      );

      expect(screen.getByTestId("status")).toHaveTextContent("idle");

      await user.click(screen.getByText("Submit"));

      await waitFor(
        () => {
          expect(screen.getByTestId("status")).toHaveTextContent("success");
        },
        { timeout: 200 }
      );
    });

    it("should disable submit button while submitting", async () => {
      const user = userEvent.setup();

      let resolveSubmit: () => void;
      const submitPromise = new Promise<void>((resolve) => {
        resolveSubmit = resolve;
      });

      const onSubmit = vi.fn(() => submitPromise);

      render(
        <FormComponent
          options={{
            initialValues: { email: "test@example.com" },
            onSubmit,
          }}
        />
      );

      const submitButton = screen.getByText("Submit");
      expect(submitButton).not.toBeDisabled();

      await user.click(submitButton);

      await waitFor(() => {
        expect(submitButton).toBeDisabled();
      });

      resolveSubmit!();

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  // ============================================================================
  // Complex Scenarios
  // ============================================================================

  describe("Complex Scenarios", () => {
    it("should handle complete form flow: type, validate, submit, reset", async () => {
      const user = userEvent.setup();
      const onSubmit = vi.fn();

      render(
        <FormComponent
          options={{
            initialValues: { email: "" },
            validateOn: "onBlur",
            validationSchema: {
              email: (value) => {
                if (!value) return "Email is required";
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
                  return "Invalid email";
                return undefined;
              },
            },
            onSubmit,
          }}
        />
      );

      const input = screen.getByTestId("email-input");

      // 1. Start pristine
      expect(screen.getByTestId("is-dirty")).toHaveTextContent("pristine");

      // 2. Type valid email
      await user.type(input, "test@example.com");
      await waitFor(() => {
        expect(screen.getByTestId("is-dirty")).toHaveTextContent("dirty");
      });

      // 3. Blur to validate
      await user.tab();
      await waitFor(() => {
        expect(screen.queryByTestId("email-error")).not.toBeInTheDocument();
      });

      // 4. Submit
      await user.click(screen.getByText("Submit"));
      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
        expect(screen.getByTestId("status")).toHaveTextContent("success");
      });

      // 5. Reset
      await user.click(screen.getByTestId("reset-button"));
      await waitFor(() => {
        expect(input).toHaveValue("");
        expect(screen.getByTestId("is-dirty")).toHaveTextContent("pristine");
        expect(screen.getByTestId("status")).toHaveTextContent("idle");
      });
    });
  });
});
